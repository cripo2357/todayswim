// 다른 사용자 일정 (친구 + 같은 슬롯 참여자) — P2 5번째 배치 진입(2026-05-21)에
// MOCK_OTHER_SCHEDULES 교체. useFriends.friends 의 profile_id 목록을 키로 잡고
// user_schedules + profiles join 한 번 fetch. mock 데이터는 안전망 폴백.
//
// 정책:
// - 친구 ids 변하면 React Query 재fetch. staleTime은 QueryClient(60s) 따름.
// - 빈 결과(서버 미연결/RLS/마이그 미적용/시드 실패)면 mock 폴백 — 개발/검증
//   매끄러움. 운영은 P3에서 mock 제거 + staleTime 강화.
// - private 행은 서버에서 이미 제외. friends/public만 옴.
// - isFriend = 친구 ids에 포함됐는지(요청 input 기준). 비친구 일정도 보려면
//   별도 슬롯-단위 fetch가 필요(tryFetchSchedulesByPoolDate, 후속).

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  tryFetchSchedulesWithOwner,
  type ScheduleWithOwnerRow,
} from '@/lib/userSchedulesSync';
import { useFriends } from '@/store/friends';
import {
  MOCK_OTHER_SCHEDULES,
  type OtherSchedule,
} from '@/lib/mockData';
import type { AvatarId } from '@/lib/avatars';
import type { ScheduleVisibility } from '@/store/swimSchedule';

function rowToOtherSchedule(
  row: ScheduleWithOwnerRow,
  friendIds: Set<string>,
): OtherSchedule {
  const owner = row.profiles;
  // photo_uri에 번들 AvatarId('avatar-male-1' 등)가 들어옴. OtherSchedule.avatar
  // 는 AvatarId 타입이라 그대로 캐스트. URL이면 fallback id를 잡아두는 게 안전.
  const avatarRaw = owner?.photo_uri ?? 'avatar-male-1';
  const avatar = (
    avatarRaw.startsWith('avatar-') ? avatarRaw : 'avatar-male-1'
  ) as AvatarId;
  return {
    id: row.id,
    userId: row.profile_id,
    name: owner?.nickname ?? '',
    avatar,
    isFriend: friendIds.has(row.profile_id),
    poolId: row.pool_id ?? '',
    poolName: row.pool_name,
    date: row.date,
    start: row.start_time,
    end: row.end_time,
    visibility: row.visibility as ScheduleVisibility,
  };
}

/**
 * 친구 일정 + (옵션) 같은 슬롯 비친구 일정 — 통합 OtherSchedule[].
 *
 * 친구 = useFriends.friends 의 profile_id. P2 진입 후 mock id = 친구코드라
 * 그대로 profiles PK. 비친구 public 일정은 P2 후속 배치(슬롯-단위 fetch).
 *
 * 폴백: 서버 결과 0건이면 MOCK_OTHER_SCHEDULES 반환 — 검증 매끄러움.
 *   실 사용자만 가입한 prod 환경에선 P3에서 mock 시드 미실행 + 폴백 제거.
 */
export function useOtherSchedules(): OtherSchedule[] {
  // zustand selector는 reference-stable 값만 반환해야 함 — `.map()` 직접
  // 반환하면 매 호출마다 새 array → useSyncExternalStore가 "값 바뀜" 판정
  // → 무한 렌더. friends 자체를 구독하고 .map은 useMemo로 파생.
  const friends = useFriends((s) => s.friends);
  const friendIds = React.useMemo(() => friends.map((f) => f.id), [friends]);
  const friendIdsKey = React.useMemo(
    () => [...friendIds].sort().join(','),
    [friendIds],
  );
  const friendIdsSet = React.useMemo(() => new Set(friendIds), [friendIds]);

  const { data } = useQuery({
    queryKey: ['otherSchedules', friendIdsKey],
    queryFn: async (): Promise<OtherSchedule[]> => {
      const rows = await tryFetchSchedulesWithOwner(friendIds);
      return rows.map((r) => rowToOtherSchedule(r, friendIdsSet));
    },
    enabled: friendIds.length > 0,
  });

  // 서버 0건 → mock 폴백. 친구 0명이면 query disabled → data undefined → mock.
  return data && data.length > 0 ? data : MOCK_OTHER_SCHEDULES;
}
