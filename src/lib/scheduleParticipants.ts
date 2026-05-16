// 달력 카드 참여자 조회 — 소유 개념 아님. 같은 슬롯(풀+날짜+시작/끝)에
// 참여한 사람들을, 내 일정 공개여부 + 상대 가시성 + 내 설정으로 필터만 함.
//
// 규칙 (Figma 120:3156 / 사용자 확정 2026-05-16):
//  · 비공개:        나만. 친구섹션·초대 없음.
//  · 친구에게만 공개: 나 + 친구(상대 가시성 friends|public) + 친구초대.
//  · 전체 공개:       나 + 친구(friends|public) + 친구초대
//                     + 다른 사람(상대 가시성 public) — 단 내 설정이
//                       'public'(다른 사람 일정 보기)일 때만.

import type { MySwimSchedule } from '@/store/swimSchedule';
import type { OthersScheduleView } from '@/store/prefs';
import { MOCK_OTHER_SCHEDULES, type OtherSchedule } from '@/lib/mockData';

export interface ParticipantGroups {
  /** 친구 초대 버튼 노출 (비공개면 false) */
  showInvite: boolean;
  /** 같은 슬롯 친구 참여자 (가시성 friends|public) */
  friends: OtherSchedule[];
  /** 같은 슬롯 비친구 참여자 (가시성 public, 내 설정·내 공개여부 충족 시) */
  others: OtherSchedule[];
}

const EMPTY: ParticipantGroups = {
  showInvite: false,
  friends: [],
  others: [],
};

export function resolveParticipants(
  my: Pick<
    MySwimSchedule,
    'poolId' | 'date' | 'start' | 'end' | 'visibility'
  >,
  viewPref: OthersScheduleView,
): ParticipantGroups {
  if (my.visibility === 'private') return EMPTY;

  const sameSlot = MOCK_OTHER_SCHEDULES.filter(
    (o) =>
      o.poolId === my.poolId &&
      o.date === my.date &&
      o.start === my.start &&
      o.end === my.end,
  );

  const friends = sameSlot.filter(
    (o) =>
      o.isFriend &&
      (o.visibility === 'friends' || o.visibility === 'public'),
  );

  const others =
    my.visibility === 'public' && viewPref === 'public'
      ? sameSlot.filter((o) => !o.isFriend && o.visibility === 'public')
      : [];

  return { showInvite: true, friends, others };
}
