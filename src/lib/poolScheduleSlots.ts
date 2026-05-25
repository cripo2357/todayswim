// 풀별 일정 슬롯 + 가시 참여자 — 풀 카드 하단 일정 카드 (Figma 265:3158).
//
// 정책 (사용자 확정 2026-05-22):
//  · 같은 슬롯(poolId+date+start+end) 에 모인 모든 사람을 1장의 카드로 표시.
//  · "내가 볼 수 있는 참여자 수 ≥ 1" 인 슬롯만 노출.
//  · 가시 규칙:
//     - me                                   → 항상 보임 (내 일정에 같은 슬롯 있으면)
//     - friend (isFriend=true)               → 항상 보임 (단, visibility friends|public)
//     - stranger (isFriend=false)            → othersScheduleView==='public' 일 때만
//                                              (visibility public 행만)
//     - blocked                              → 항상 제외
//  · 정렬:
//     - 카드 안 참여자 = me 우선 → friends → strangers
//     - 카드들 자체 = date+start 오름차순 (가까운 일정부터)
//
// resolveParticipants (lib/scheduleParticipants) 와 별개 — 그쪽은 "이미 참여
// 중인 슬롯의 다른 참여자" 조회. 본 모듈은 "풀의 모든 슬롯 + 각 슬롯의 가시
// 참여자" 를 한 번에 계산.

import type { AvatarId } from './avatars';
import type { OtherSchedule } from './mockData';
import type { MySwimSchedule } from '@/store/swimSchedule';
import type { OthersScheduleView } from '@/store/prefs';

export interface VisibleParticipant {
  id: string;
  nickname: string;
  avatar: AvatarId | string;
  relation: 'me' | 'friend' | 'stranger';
}

export interface PoolScheduleSlot {
  /** 슬롯 식별 키 = date|start|end */
  key: string;
  date: string;
  start: string;
  end: string;
  /** 내가 이 슬롯에 일정 등록돼 있는지 */
  imParticipating: boolean;
  /** 카드에 표시할 참여자 (me 우선, friend, stranger 순). 빈 배열은 불가능
   *  (호출자가 길이 0 슬롯을 반환에 포함시키지 않음). */
  participants: VisibleParticipant[];
}

export interface MeForSlot {
  /** 내 친구코드(profile.id). 없으면 me 추가 안 함 (비로그인 / Apple mock). */
  id: string | undefined;
  nickname: string | undefined;
  avatar: AvatarId | string | undefined;
}

interface BuildArgs {
  poolId: string;
  me: MeForSlot;
  mySchedules: readonly MySwimSchedule[];
  otherSchedules: readonly OtherSchedule[];
  blockedIds: readonly string[];
  /** prefs.othersScheduleView — 'public' 이면 비친구도 표시, 'friends' 면 친구만. */
  othersScheduleView: OthersScheduleView;
}

export function buildPoolScheduleSlots({
  poolId,
  me,
  mySchedules,
  otherSchedules,
  blockedIds,
  othersScheduleView,
}: BuildArgs): PoolScheduleSlot[] {
  const blocked = new Set(blockedIds);

  // 같은 풀의 내 일정 / 다른 사람 일정만.
  const mineHere = mySchedules.filter((s) => s.poolId === poolId);
  const othersHere = otherSchedules.filter(
    (o) => o.poolId === poolId && !blocked.has(o.userId),
  );

  // 슬롯 키로 그룹.
  const byKey = new Map<
    string,
    {
      date: string;
      start: string;
      end: string;
      myEntry?: MySwimSchedule;
      friendEntries: OtherSchedule[];
      strangerEntries: OtherSchedule[];
    }
  >();

  const upsert = (date: string, start: string, end: string) => {
    const key = `${date}|${start}|${end}`;
    let g = byKey.get(key);
    if (!g) {
      g = { date, start, end, friendEntries: [], strangerEntries: [] };
      byKey.set(key, g);
    }
    return g;
  };

  for (const s of mineHere) {
    const g = upsert(s.date, s.start, s.end);
    g.myEntry = s;
  }
  for (const o of othersHere) {
    const g = upsert(o.date, o.start, o.end);
    // 친구·비친구 분리(나중 정렬·필터링 용이).
    if (o.isFriend) {
      // 친구는 visibility friends|public 만 노출 (private 은 그쪽이 가린 거).
      if (o.visibility === 'friends' || o.visibility === 'public') {
        g.friendEntries.push(o);
      }
    } else {
      // 비친구는 visibility public 만 + 내 설정이 'public' 일 때만.
      if (o.visibility === 'public' && othersScheduleView === 'public') {
        g.strangerEntries.push(o);
      }
    }
  }

  // 사용자 요청 — 지난 일정은 카드에 표시 X. "현재 진행중(start<=now<=end) OR
  // 예정(start>now)" 만 노출. timezone 은 device local (KST 가정).
  const nowMs = Date.now();
  const slotEndMs = (date: string, end: string): number => {
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = end.split(':').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0).getTime();
  };

  const slots: PoolScheduleSlot[] = [];
  for (const [key, g] of byKey) {
    // 종료 시각이 지난 슬롯은 제외 — 지난 일정 카드 안 보임.
    if (slotEndMs(g.date, g.end) <= nowMs) continue;

    const participants: VisibleParticipant[] = [];

    // me 우선
    if (g.myEntry && me.id && me.nickname && me.avatar) {
      participants.push({
        id: me.id,
        nickname: me.nickname,
        avatar: me.avatar,
        relation: 'me',
      });
    }
    // friends
    for (const o of g.friendEntries) {
      participants.push({
        id: o.userId,
        nickname: o.nickname,
        avatar: o.avatar,
        relation: 'friend',
      });
    }
    // strangers
    for (const o of g.strangerEntries) {
      participants.push({
        id: o.userId,
        nickname: o.nickname,
        avatar: o.avatar,
        relation: 'stranger',
      });
    }

    // 내가 볼 수 있는 참여자 ≥ 1 인 슬롯만 노출.
    if (participants.length === 0) continue;

    slots.push({
      key,
      date: g.date,
      start: g.start,
      end: g.end,
      imParticipating: !!g.myEntry,
      participants,
    });
  }

  // 카드 정렬 — 가까운 일정 먼저. date 후 start 비교.
  slots.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.start < b.start ? -1 : 1;
  });

  return slots;
}
