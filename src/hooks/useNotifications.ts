// 알림 수신함 — P2 진입(2026-05-20)에 NotificationsTab의 mock 갤러리를
// 서버 notifications(0042) 테이블 기반으로 전환.
//
// 정책(useOtherSchedules 패턴과 일관):
// - user_code = useProfile.id. 없으면 disabled.
// - React Query 60s staleTime(전역 QueryClient).
// - 서버 0건 → 호출부가 mock 갤러리 폴백 결정(여기서는 단순히 빈 배열 반환).
// - row는 raw로 노출 — NotificationsTab이 kind→slot 매핑으로 변환(GROUPS 재사용).
//
// references: 0042_notifications, message_rules_architecture, dispatch.ts.

import { useQuery } from '@tanstack/react-query';
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
