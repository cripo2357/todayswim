// Pool's day — 친구 일정 겹침 알림. 내가 일정을 추가할 때, 같은 슬롯(풀+날짜+시각)
// 에 이미 일정이 있는 친구가 있으면 본인 알림함에 friend_schedule_overlap 적재.
//
// 왜 클라(일정 추가 시점)인가: "추가하는 순간" 친구도 거기 간다는 걸 알려주는 게
// 가장 유용하고, 서버 cron이 따로 스캔할 필요 없다. 친구 일정은 서버에서 fetch
// (tryFetchSchedulesWithOwner) — private는 서버가 이미 제외하므로 프라이버시 안전.
//
// best-effort: 네트워크/미인증/친구 0명이면 조용히 무동작.

import { tryFetchSchedulesWithOwner } from '@/lib/userSchedulesSync';
import { useFriends } from '@/store/friends';
import { dispatchMessage } from '@/lib/messages/dispatch';
import type { MySwimSchedule } from '@/store/swimSchedule';

export async function checkFriendOverlap(
  s: Pick<MySwimSchedule, 'poolId' | 'poolName' | 'date' | 'start' | 'end'>,
): Promise<void> {
  try {
    const friendIds = useFriends.getState().friends.map((f) => f.id);
    if (friendIds.length === 0) return;

    const rows = await tryFetchSchedulesWithOwner(friendIds);
    const friendSet = new Set(friendIds);
    const overlap = rows.find(
      (r) =>
        friendSet.has(r.profile_id) &&
        (r.pool_id ?? '') === s.poolId &&
        r.date === s.date &&
        r.start_time === s.start &&
        r.end_time === s.end,
    );
    if (!overlap) return;

    // 겹친 친구(첫 번째) 닉네임으로 알림 — "{name}님도 수영 일정이 있어요."
    void dispatchMessage(
      'friend_schedule_overlap',
      {
        name: overlap.profiles?.nickname ?? '',
        pool: s.poolName,
        date: s.date,
        time: s.start,
      },
      { poolId: s.poolId, date: s.date, start: s.start, end: s.end },
    );
  } catch {
    /* best-effort */
  }
}
