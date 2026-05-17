// 지도 수영장 마커 옆 프로필 스택 — 표시 대상 산출(순수 로직).
//
// 규칙 (사용자 확정 2026-05-18 / Figma 173:13595·13735·13797):
//  · 대상 = 나 또는 내 친구 중, "24시간 이내 진행예정" 수영 일정이 있는 사용자.
//  · 한 사용자가 24h 내 일정 2개+면 → 가장 임박한 일정의 수영장에 1회 배치.
//  · 차단 사용자 제외. 친구는 useFriends(friends/blocked) 경유로만 노출
//    (정적 isFriend 신뢰 X — block_policy_enforcement 메모리).
//  · 친구의 비공개(private) 슬롯은 제외(participant_visibility_policy 일관 —
//    내 일정은 내 것이라 가시성 무관).
//  · 순서: 나=0번, 나머지는 풀별 고정 셔플(매 렌더 재셔플 방지). 최대 29 + "… more".
//
// Phase-1: 친구 일정 소스는 기존 participant 데이터(MOCK_OTHER_SCHEDULES, 달력
//          resolveParticipants 와 동일 소스). 서버 친구 일정 적재는 Phase-2 갭.

import type { Pool } from '@/types/pool';
import type { UserProfile } from '@/store/profile';
import type { MySwimSchedule } from '@/store/swimSchedule';
import type { MockAccount, OtherSchedule } from '@/lib/mockData';

export type StackRelation = 'me' | 'friend';

export interface StackEntry {
  userId: string;
  photoUri?: string;
  /** 소형 노출용 64px 썸네일(있으면). 없으면 Avatar가 photoUri 폴백. */
  thumbUri?: string;
  relation: StackRelation;
}

export interface PoolStack {
  /** 표시 순서 확정(나=0번, 나머지 풀별 고정 셔플), 최대 STACK_MAX */
  entries: StackEntry[];
  /** STACK_MAX 초과 → "… more" 표시 */
  overflow: boolean;
}

/** 한 풀에 노출하는 최대 아바타 수(초과 시 "… more"). Figma 5×6 - more칸. */
export const STACK_MAX = 29;

const H24_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" + "HH:MM" → epoch ms (로컬). swimSchedule.isSchedulePast 와 동일 파싱. */
function slotStartMs(date: string, start: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = start.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
}

/** 결정적 셔플용 문자열 해시 (FNV-1a 32bit) — 풀별 고정 순서, 매 렌더 재셔플 방지. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface BuildStacksInput {
  pools: Pool[];
  myProfile: UserProfile | null;
  mySchedules: MySwimSchedule[];
  friends: MockAccount[];
  blocked: readonly string[];
  otherSchedules: OtherSchedule[];
  /** 기준 시각(ms). 미지정 시 Date.now(). */
  now?: number;
}

interface Cand {
  userId: string;
  relation: StackRelation;
  photoUri?: string;
  thumbUri?: string;
  poolId: string;
  startMs: number;
}

/** 풀별 프로필 스택 산출. key=poolId, 마커 있는 풀만 포함. */
export function buildPoolProfileStacks(
  input: BuildStacksInput,
): Map<string, PoolStack> {
  const now = input.now ?? Date.now();
  const windowEnd = now + H24_MS;
  const poolIds = new Set(input.pools.map((p) => p.id));

  // userId 당 가장 임박한 후보 1건만 유지(여러 슬롯 → 최임박 풀 배치).
  const best = new Map<string, Cand>();
  const consider = (c: Cand) => {
    if (!poolIds.has(c.poolId)) return; // 마커 없는 풀은 무시
    if (c.startMs <= now || c.startMs > windowEnd) return; // 24h 내 진행예정만
    const prev = best.get(c.userId);
    if (!prev || c.startMs < prev.startMs) best.set(c.userId, c);
  };

  // 나 — 내 일정은 가시성 무관(내 것).
  if (input.myProfile) {
    const meId = input.myProfile.id || 'me';
    for (const s of input.mySchedules) {
      consider({
        userId: meId,
        relation: 'me',
        photoUri: input.myProfile.photoUri,
        thumbUri: input.myProfile.photoThumbUri,
        poolId: s.poolId,
        startMs: slotStartMs(s.date, s.start),
      });
    }
  }

  // 친구 — useFriends 경유. 차단 제외, 실제 친구만, private 제외.
  const friendById = new Map(input.friends.map((f) => [f.id, f]));
  const blockedSet = new Set(input.blocked);
  for (const o of input.otherSchedules) {
    if (blockedSet.has(o.userId)) continue;
    const f = friendById.get(o.userId);
    if (!f) continue;
    if (o.visibility === 'private') continue;
    consider({
      userId: o.userId,
      relation: 'friend',
      photoUri: f.avatar, // 노출 아바타는 useFriends 소스 기준
      poolId: o.poolId,
      startMs: slotStartMs(o.date, o.start),
    });
  }

  // 풀별 그룹 → 정렬(나 먼저, 나머지 고정 셔플) → cap.
  const byPool = new Map<string, Cand[]>();
  for (const c of best.values()) {
    const arr = byPool.get(c.poolId);
    if (arr) arr.push(c);
    else byPool.set(c.poolId, [c]);
  }

  const result = new Map<string, PoolStack>();
  for (const [poolId, cands] of byPool) {
    const me = cands.filter((c) => c.relation === 'me');
    const others = cands
      .filter((c) => c.relation !== 'me')
      .sort((a, b) => hash(poolId + a.userId) - hash(poolId + b.userId));
    const ordered = [...me, ...others];
    result.set(poolId, {
      overflow: ordered.length > STACK_MAX,
      entries: ordered.slice(0, STACK_MAX).map((c) => ({
        userId: c.userId,
        photoUri: c.photoUri,
        thumbUri: c.thumbUri,
        relation: c.relation,
      })),
    });
  }
  return result;
}
