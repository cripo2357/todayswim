// 친구 수영 레슨 (지도 stack otherLessons) — useOtherSchedules(자유수영 일정)의
// 레슨판. 친구 profiles.swim_classes 를 주간 반복 레슨으로 펼쳐 OtherLesson[] 로
// 반환. buildPoolProfileStacks 가 다음 회차로 환산해 노출창을 적용한다.
//
// 정책:
// - 친구 ids(useFriends.friends.profile_id) 를 키로 한 번 fetch. 서버가
//   show_swim_classes=true + lesson_pool_id 있는 친구만 이미 걸러줌.
// - 레슨엔 3단계 공개(private/friends/public)가 없음 — "켜짐=친구공개"라
//   visibility='friends' 고정(친구인 나에게만 노출, 사람들에겐 미노출).
// - 한 친구가 여러 요일 레슨을 가지면 각 슬롯을 개별 OtherLesson 으로. 지도
//   로직이 userId당 최임박 1건만 배치하므로 중복 노출 걱정 없음.
// - 빈 결과(친구 0명/미설정/서버 미연결)면 빈 배열. mock 폴백 없음(P3 권위).

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tryFetchFriendLessons } from '@/lib/profileSync';
import { useFriends } from '@/store/friends';
import type { OtherLesson } from '@/lib/mockData';

// reference-stable 빈 배열 — MapScreen 의 무거운 memo 체인이 매 렌더 재계산되지
// 않도록(useOtherSchedules 와 동일 패턴).
const EMPTY_OTHER_LESSONS: OtherLesson[] = [];

export function useOtherLessons(): OtherLesson[] {
  const friends = useFriends((s) => s.friends);
  const friendIds = React.useMemo(() => friends.map((f) => f.id), [friends]);
  const friendIdsKey = React.useMemo(
    () => [...friendIds].sort().join(','),
    [friendIds],
  );

  const { data } = useQuery({
    queryKey: ['otherLessons', friendIdsKey],
    queryFn: async (): Promise<OtherLesson[]> => {
      const rows = await tryFetchFriendLessons(friendIds);
      return rows.flatMap((r) =>
        (r.swim_classes ?? []).map((sc, i) => ({
          id: `${r.id}:${i}`,
          userId: r.id,
          nickname: r.nickname ?? '',
          // 아바타는 지도에서 친구=useFriends 소스로 대체되지만, 폴백/완전성 위해 채움.
          avatar: r.photo_uri ?? 'avatar-male-1',
          isFriend: true,
          poolId: r.lesson_pool_id ?? '',
          poolName: r.lesson_pool_name ?? '',
          day: sc.day,
          start: sc.start,
          end: sc.end,
          visibility: 'friends' as const,
        })),
      );
    },
    enabled: friendIds.length > 0,
  });

  return data ?? EMPTY_OTHER_LESSONS;
}
