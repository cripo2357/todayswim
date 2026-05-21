// 알림 수신함 + 미열람 카운트 + 일괄 읽음 처리 + realtime 구독.
//
// 정책(useOtherSchedules 패턴과 일관):
// - user_code = useProfile.id. 없으면 disabled / 0 반환.
// - React Query 60s staleTime(전역 QueryClient).
// - 서버 0건 → 호출부가 mock 갤러리 폴백 결정(여기서는 빈 배열 / 0 반환).
// - row는 raw로 노출 — NotificationsTab이 kind→slot 매핑으로 변환(GROUPS 재사용).
//
// P3-A5 (2026-05-21): unread 카운트를 서버 count(*) 로 일원화 + 알림탭
// 진입 시 markAllNotificationsAsRead 가 DB read=true 일괄 UPDATE.
// 기존 메모리 zustand store(`src/store/notifications.ts`) 폐기.
//
// P3 후속 (2026-05-22): useNotificationsRealtime — Supabase realtime channel
// 로 본인 user_code 의 INSERT/UPDATE/DELETE 구독 → query 무효화로 즉시 반영.
// 60s polling fallback 은 그대로 (realtime 연결 실패·재연결 사이 보강).
// App.tsx 에서 1회 호출 → 로그인된 사용자 세션 동안 항상 활성.
//
// references: 0042_notifications, 0085_notifications_realtime,
//   message_rules_architecture, dispatch.ts.

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/store/profile';
import type { MessageKind, MessageParams } from '@/lib/messages/rules';

export interface NotificationRow {
  id: string;
  user_code: string;
  kind: MessageKind;
  title: string;
  body: string[];
  params: MessageParams;
  actions: string[];
  related: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ─── 알림 row 목록 ──────────────────────────────────────────────
export function useNotifications(): {
  rows: NotificationRow[];
  isLoading: boolean;
} {
  const userCode = useProfile((s) => s.profile?.id);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', userCode],
    queryFn: async (): Promise<NotificationRow[]> => {
      if (!userCode) return [];
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_code', userCode)
          .order('created_at', { ascending: false });
        if (error || !data) return [];
        return data as NotificationRow[];
      } catch {
        return [];
      }
    },
    enabled: !!userCode,
  });

  return { rows: data ?? [], isLoading };
}

// ─── 미열람 카운트 ──────────────────────────────────────────────
// MapScreen 의 빨간 배지 / 향후 다른 위치에서도 사용. 별도 query key 라
// rows fetch 와 독립적으로 cache.
export function useUnreadCount(): number {
  const userCode = useProfile((s) => s.profile?.id);

  const { data } = useQuery({
    queryKey: ['notifications-unread', userCode],
    queryFn: async (): Promise<number> => {
      if (!userCode) return 0;
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_code', userCode)
          .eq('read', false);
        if (error) return 0;
        return count ?? 0;
      } catch {
        return 0;
      }
    },
    enabled: !!userCode,
  });

  return data ?? 0;
}

// ─── 일괄 읽음 처리 helper ─────────────────────────────────────
// 알림탭 진입 시 호출 → DB read=true 일괄 UPDATE.
// 호출자가 useQueryClient.invalidateQueries 까지 처리해야 카운트 즉시 갱신.
// (Phase4: 카드 단위 read 토글 + 시각 인디케이터로 확장 가능. 현재는 v1 일괄.)
export async function markAllNotificationsAsRead(
  userCode: string | undefined,
): Promise<void> {
  if (!userCode) return;
  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_code', userCode)
      .eq('read', false);
  } catch {
    // best-effort — 실패해도 사용자 흐름 막지 않음(다음 진입 때 재시도).
  }
}

// 호출자 편의: hook 형태로 markAll + invalidate 한 번에 호출.
export function useMarkAllNotificationsAsRead(): () => Promise<void> {
  const userCode = useProfile((s) => s.profile?.id);
  const qc = useQueryClient();
  return async () => {
    await markAllNotificationsAsRead(userCode);
    await qc.invalidateQueries({ queryKey: ['notifications-unread', userCode] });
    await qc.invalidateQueries({ queryKey: ['notifications', userCode] });
  };
}

// ─── Realtime 구독 ──────────────────────────────────────────────
// Supabase Postgres changes — 본인 user_code 필터로 notifications 변화 구독.
// 새 INSERT(다른 사용자가 알림 보냄) / UPDATE(read 갱신) / DELETE(탈퇴
// 데이터 정리) 발생 시 query invalidate → 즉시 refetch.
//
// App.tsx 에서 한 번 호출 → 세션 동안 항상 활성. 컴포넌트 단위로 부르면
// 중복 채널 생성 가능 (Supabase realtime 은 channel name 단위 unique 라 OK
// 지만, 한 곳 관리가 효율).
//
// realtime 미동작 환경(네트워크/요금제) 에서도 useQuery 의 60s polling 이
// 폴백으로 동작 — 즉시성만 감소.
export function useNotificationsRealtime(): void {
  const userCode = useProfile((s) => s.profile?.id);
  const qc = useQueryClient();

  React.useEffect(() => {
    if (!userCode) return;

    const channel = supabase
      .channel(`notifications:${userCode}`)
      .on(
        // Supabase v2 realtime: postgres_changes 이벤트.
        'postgres_changes' as never,
        {
          event: '*', // INSERT / UPDATE / DELETE 모두
          schema: 'public',
          table: 'notifications',
          filter: `user_code=eq.${userCode}`,
        },
        () => {
          // 변경 → query 무효화. payload 직접 캐시 머지 대신 refetch 패턴
          // (단순·일관성 우선).
          void qc.invalidateQueries({
            queryKey: ['notifications', userCode],
          });
          void qc.invalidateQueries({
            queryKey: ['notifications-unread', userCode],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userCode, qc]);
}
