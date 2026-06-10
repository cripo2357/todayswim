// 특정 사용자 1명의 예정 일정 — 타인 프로필 "예정된 수영 일정"용.
//
// useOtherSchedules(친구 전체)와 달리 userId 1명만 fetch. 친구가 아닌 사용자
// 프로필에서도 그 사람의 전체공개 일정을 보여줘야 하므로 friendIds 가 아닌
// 단일 userId 기준. 서버는 private 만 제외(friends/public 둘 다 옴) →
// upcomingSchedulesFor 가 friends/public 게이팅(isFriend)을 최종 적용.

import { useQuery } from '@tanstack/react-query';
import { tryFetchSchedulesWithOwner } from '@/lib/userSchedulesSync';
import { rowToOtherSchedule } from '@/hooks/useOtherSchedules';
import type { OtherSchedule } from '@/lib/mockData';

const EMPTY: OtherSchedule[] = [];

export function useUserSchedules(userId: string): OtherSchedule[] {
  const { data } = useQuery({
    queryKey: ['userSchedules', userId],
    queryFn: async (): Promise<OtherSchedule[]> => {
      const rows = await tryFetchSchedulesWithOwner([userId]);
      // isFriend 필드는 upcomingSchedulesFor 가 별도 인자로 게이팅하므로
      // 여기 매핑값은 무관 — 빈 집합으로 매핑(필드만 채움).
      return rows.map((r) => rowToOtherSchedule(r, EMPTY_SET));
    },
    enabled: !!userId,
  });
  return data ?? EMPTY;
}

const EMPTY_SET = new Set<string>();
