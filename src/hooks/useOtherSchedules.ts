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
  type OtherSchedule,
} from '@/lib/mockData';
import type { ScheduleVisibility } from '@/store/swimSchedule';

function rowToOtherSchedule(
  row: ScheduleWithOwnerRow,
  friendIds: Set<string>,
): OtherSchedule {
  const owner = row.profiles;
  // photo_uri 는 항상 아바타 URL(번들·업로드·소셜 통일) — 그대로 통과.
  // URI 를 버리면 업로드 사진 사용자가 기본 아바타로 잘못 보임. null 만 폴백.
  const avatar = owner?.photo_uri ?? 'avatar-male-1';
  return {
    id: row.id,
    userId: row.profile_id,
    nickname: owner?.nickname ?? '',
    avatar,
    // 소형(≤28px) 렌더는 64 썸네일로 — 512 다운스케일 앨리어싱 회피. 없으면 avatar 폴백.
    avatarThumb: owner?.photo_thumb_uri ?? undefined,
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
 * (P3 prod 준비, 2026-05-26): mock 폴백 제거 — 서버가 단일 권위. 친구 0명/
 *   서버 0건 모두 빈 배열. mock 시드는 dev/preview env 진입 시점에 분리.
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

  // P3 prod 준비: 서버가 단일 권위 — mock 폴백 제거. 친구 0건/서버 0건 모두 빈 배열.
  return data ?? [];
}
