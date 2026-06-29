// Pool's day — 친구 일정 겹침 알림. 내가 일정을 추가할 때, 같은 슬롯(풀+날짜+시각)
// 에 이미 일정이 있는 친구를 찾아:
//   ① 본인 알림함에 friend_schedule_overlap("{친구}님(외 N명)도 이 시간에 수영해요").
//   ② 겹친 친구들 각자에게 friend_joined_my_slot 푸시("{나}님도 이 시간에 수영해요").
// 우연한 슬롯 겹침을 "함께" 신호로 전환(북극성). 양방향 — 나중에 친구가 등록하면
// 그쪽에서 같은 로직이 나를 핑.
//
// 왜 클라(일정 추가 시점)인가: "추가하는 순간"이 가장 유용하고 서버 cron 불필요.
// 친구 일정은 서버 fetch(tryFetchSchedulesWithOwner) — private는 서버가 이미 제외.
// ② 발송 게이트: 내 일정이 비공개면 친구에게 안 알림(안 보이는 일정이라).
//
// best-effort: 네트워크/미인증/친구 0명이면 조용히 무동작.

import { tryFetchSchedulesWithOwner } from '@/lib/userSchedulesSync';
import { useFriends } from '@/store/friends';
import { useProfile } from '@/store/profile';
import { dispatchMessage, dispatchMessageTo } from '@/lib/messages/dispatch';
import type { MySwimSchedule } from '@/store/swimSchedule';

export async function checkFriendOverlap(
  s: Pick<
    MySwimSchedule,
    'poolId' | 'poolName' | 'date' | 'start' | 'end' | 'visibility'
  >,
): Promise<void> {
  try {
    const friendIds = useFriends.getState().friends.map((f) => f.id);
    if (friendIds.length === 0) return;

    const rows = await tryFetchSchedulesWithOwner(friendIds);
    const friendSet = new Set(friendIds);
    // 같은 슬롯 친구들(profile_id 기준 중복 제거).
    const byId = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      if (!friendSet.has(r.profile_id)) continue;
      if ((r.pool_id ?? '') !== s.poolId) continue;
      if (r.date !== s.date || r.start_time !== s.start || r.end_time !== s.end)
        continue;
      if (!byId.has(r.profile_id)) byId.set(r.profile_id, r);
    }
    const friends = [...byId.values()];
    if (friends.length === 0) return;

    const related = {
      poolId: s.poolId,
      date: s.date,
      start: s.start,
      end: s.end,
    };

    // ① 본인 알림함 — "{친구}님(외 N명)도 이 시간에 수영해요."
    const first = friends[0];
    void dispatchMessage(
      'friend_schedule_overlap',
      {
        name: first.profiles?.nickname ?? '',
        count: friends.length,
        pool: s.poolName,
        date: s.date,
        time: s.start,
      },
      { ...related, senderAvatar: first.profiles?.photo_uri ?? undefined },
    );

    // ② 겹친 친구들 각자에게 — "{나}님도 이 시간에 수영해요." (내 일정 비공개면 생략)
    if (s.visibility !== 'private') {
      const me = useProfile.getState().profile;
      const myNick = me?.name?.trim() ?? '';
      const myAvatar = me?.photoUri ?? undefined;
      for (const f of friends) {
        void dispatchMessageTo(
          f.profile_id,
          'friend_joined_my_slot',
          { name: myNick, pool: s.poolName, date: s.date, time: s.start },
          { ...related, senderAvatar: myAvatar },
        );
      }
    }
  } catch {
    /* best-effort */
  }
}
