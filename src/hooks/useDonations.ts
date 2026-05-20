// 후원 메시지 fetch + 작성/수정/비공개 mutation 한 곳.
//
// - 전체 donations 한 번에 가져와서(최대 500) 사용자별 최신 1건 dedup + hidden
//   필터(본인은 본인 hidden도 보임). 클라이언트 비용은 dedup 1회.
// - 작성/수정/비공개는 React Query invalidate 로 즉시 갱신.
// - profiles join 으로 닉네임/아바타 함께 조회 — DonationScreen 카드 표시용.

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  tryInsertDonation,
  tryUpdateDonationMessage,
  tryUpdateDonationHidden,
  dedupeDonationsForDisplay,
  type DonationRow,
} from '@/lib/donationsSync';
import { useProfile } from '@/store/profile';
import type { AvatarId } from '@/lib/avatars';

const QUERY_KEY = ['donations.all'] as const;

interface DonationWithOwnerRow extends DonationRow {
  profiles: { nickname: string; photo_uri: string | null } | null;
}

export interface DonationItem {
  id: string;
  profileId: string;
  nickname: string;
  avatar: AvatarId;
  message: string;
  hidden: boolean;
  createdAt: string;
  /** 내 카드인지 — 본인이면 "후원 비공개" / "문구 수정" 액션 노출. */
  mine: boolean;
}

function rowToItem(
  row: DonationWithOwnerRow,
  myProfileId: string | null,
): DonationItem {
  const a = row.profiles?.photo_uri ?? 'avatar-male-1';
  const avatar = (a.startsWith('avatar-') ? a : 'avatar-male-1') as AvatarId;
  return {
    id: row.id,
    profileId: row.profile_id,
    nickname: row.profiles?.nickname ?? '',
    avatar,
    message: row.message,
    hidden: row.hidden,
    createdAt: row.created_at,
    mine: row.profile_id === myProfileId,
  };
}

export function useDonations(): {
  items: DonationItem[];
  mine: DonationItem | null;
  isLoading: boolean;
  refetch: () => void;
} {
  const myProfileId = useProfile((s) => s.profile?.id ?? null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<DonationWithOwnerRow[]> => {
      try {
        const { data, error } = await supabase
          .from('donations')
          .select('*, profiles!inner(nickname, photo_uri)')
          .order('created_at', { ascending: false })
          .limit(500);
        if (error || !data) return [];
        return data as DonationWithOwnerRow[];
      } catch {
        return [];
      }
    },
  });

  const rows = data ?? [];
  // 사용자별 최신 1건 dedup + hidden(본인 제외) 필터.
  const deduped = React.useMemo(
    () => dedupeDonationsForDisplay(rows, myProfileId),
    [rows, myProfileId],
  );
  const items = React.useMemo(
    () => deduped.map((r) => rowToItem(r, myProfileId)),
    [deduped, myProfileId],
  );
  const mine = items.find((i) => i.mine) ?? null;
  return { items, mine, isLoading, refetch };
}

export function useCreateDonation(): (message: string) => Promise<boolean> {
  const myProfileId = useProfile((s) => s.profile?.id);
  const qc = useQueryClient();
  return async (message: string) => {
    if (!myProfileId || !message.trim()) return false;
    const created = await tryInsertDonation(myProfileId, message.trim());
    if (created) {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
      return true;
    }
    return false;
  };
}

export function useUpdateDonationMessage(): (
  id: string,
  message: string,
) => Promise<void> {
  const qc = useQueryClient();
  return async (id, message) => {
    if (!message.trim()) return;
    await tryUpdateDonationMessage(id, message.trim());
    void qc.invalidateQueries({ queryKey: QUERY_KEY });
  };
}

export function useToggleDonationHidden(): (
  id: string,
  hidden: boolean,
) => Promise<void> {
  const qc = useQueryClient();
  return async (id, hidden) => {
    await tryUpdateDonationHidden(id, hidden);
    void qc.invalidateQueries({ queryKey: QUERY_KEY });
  };
}
