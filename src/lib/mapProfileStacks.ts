// 지도 수영장 마커 옆 프로필 스택 — 표시 대상 산출(순수 로직).
//
// 규칙 (사용자 확정 2026-05-18 / Figma 173:13595·13735·13797):
//  · 노출 시간 기준 = 일정 "시작 N 전 ~ 종료시각" 사이(N = 사용자 설정).
//    기본 24h(prefs.mapFriendHorizon = 'd1'). 12h·6h 옵션은 prefs로만 조절,
//    여기는 horizonMs 파라미터로 받아 적용. 즉 now ∈ [slotStart − horizonMs, slotEnd].
//  · 대상 일정 = 수영 일정 + (공개)수영 레슨. 한 사용자는 일정·레슨 통틀어
//    가장 임박한(시작 빠른) 1건의 수영장에만 1회 배치(2곳 이상 노출 금지).
//    레슨은 주간 반복 → 다음 회차로 환산해 동일 노출창 적용.
//  · 차단 사용자 제외. 친구는 useFriends(friends/blocked) 경유로만 노출
//    (정적 isFriend 신뢰 X — block_policy_enforcement 메모리).
//  · 친구의 비공개(private) 슬롯은 제외(participant_visibility_policy 일관 —
//    내 일정은 내 것이라 가시성 무관).
//  · 순서: 나=맨앞(맵 그리드 좌측 하단 고정), 그 다음 친구, 마지막 사람들(비친구
//    전체공개). 같은 우선순위 안에선 (시드+풀+사용자) 해시 셔플. 시드는 호출자가
//    결정 — MapScreen은 useFocusEffect로 포커스마다 새 시드 발급. 9명 초과면
//    친구가 먼저 자리 채우고 사람들은 남는 자리만 → 이름표를 '비친구가 친구를
//    밀어내는' 회귀 방지. 9명 넘으면 "… more" 칸.
//
// Phase-1: 친구 일정 소스는 기존 participant 데이터(MOCK_OTHER_SCHEDULES, 달력
//          resolveParticipants 와 동일 소스). 서버 친구 일정 적재는 Phase-2 갭.

import type { Pool } from '@/types/pool';
import type { UserProfile, SwimClass } from '@/store/profile';
import type { MySwimSchedule } from '@/store/swimSchedule';
import type {
  MockAccount,
  OtherSchedule,
  OtherLesson,
} from '@/lib/mockData';
import { lessonOccurrenceMs } from '@/lib/swimClass';

/** 'me'=나, 'friend'=실제 친구, 'other'=비친구 전체공개(profileVis='public'일
 *  때만 후보). Avatar 외곽선 색: pd-byellow / pd-mint / pd-gray. */
export type StackRelation = 'me' | 'friend' | 'other';

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

// 한 풀에 노출하는 최대 아바타 수(초과 시 "… more").
// 사용자 확정(Figma Frame 655): 3×3 = 9명까지, 10명+면 별도 "…" 칸.
// 성능 완화 — 29→9 (map_stack_perf 메모리: 캡처 비용 = 아바타수×풀수).
export const STACK_MAX = 9;

/** 기본 노출 horizon = 1일. prefs.mapFriendHorizon 미전달 시 폴백. */
const DEFAULT_HORIZON_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" + "HH:MM" → epoch ms (로컬). swimSchedule.isSchedulePast 와 동일 파싱. */
function slotMs(date: string, hhmm: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
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
  // 수영 레슨(주간 반복) — 공개 시 일정과 함께 stack 후보. 한 사용자는
  // 레슨·일정 통틀어 최임박 1건만 노출(consider가 자동 보장).
  myLessonPoolId?: string | null;
  mySwimClasses?: SwimClass[];
  showMyLessons?: boolean;
  /** 내 일정·레슨을 내 지도에서 노출할지(prefs.myScheduleVisibility !== 'off').
   *  기본 true(하위호환). 'off'면 내 마커도 가림. */
  showMine?: boolean;
  otherLessons?: OtherLesson[];
  /** 기준 시각(ms). 미지정 시 Date.now(). */
  now?: number;
  /** 친구 일정 노출창 시작 = 슬롯 시작 − friendHorizonMs. 미지정 시 1일(24h).
   *  publicHorizonMs와 별개 — 'off'면 0(즉시 비노출). */
  friendHorizonMs?: number;
  /** 사람들(비친구 전체공개) 일정 노출창. 미지정 또는 0이면 사람들 일정 미노출.
   *  profileVisibility='public'일 때만 의미. */
  publicHorizonMs?: number;
  /** 풀별 셔플 시드 — 호출자가 동일 시드를 유지하는 동안 결과 안정, 새 시드를
   *  넘기면 9명 표본·순서 모두 재셔플. MapScreen은 useFocusEffect로 포커스
   *  시점마다 새 시드 발급(맵 진입할 때마다 셔플). 미지정 시 '0' — 풀+사용자
   *  ID만으로 결정적 정렬(테스트·하위호환). */
  shuffleSeed?: string;
}

interface Cand {
  userId: string;
  relation: StackRelation;
  photoUri?: string;
  thumbUri?: string;
  poolId: string;
  startMs: number;
  endMs: number;
  /** 후보별 적용 horizon — 나/친구/사람들 각각 다름. consider에서 단일 horizonMs를
   *  사용하면 셋을 한번에 처리 불가 → 후보 자체에 묶어 전달. */
  horizonMs: number;
}

/** 풀별 프로필 스택 산출. key=poolId, 마커 있는 풀만 포함. */
export function buildPoolProfileStacks(
  input: BuildStacksInput,
): Map<string, PoolStack> {
  const now = input.now ?? Date.now();
  const friendHorizonMs = input.friendHorizonMs ?? DEFAULT_HORIZON_MS;
  const publicHorizonMs = input.publicHorizonMs ?? 0;
  const showMine = input.showMine ?? true;
  const shuffleSeed = input.shuffleSeed ?? '0';
  const poolIds = new Set(input.pools.map((p) => p.id));

  // userId 당 가장 임박한 후보 1건만 유지(여러 슬롯 → 최임박 풀 배치).
  const best = new Map<string, Cand>();
  const consider = (c: Cand) => {
    if (!poolIds.has(c.poolId)) return; // 마커 없는 풀은 무시
    if (c.horizonMs <= 0) return; // 해당 관계군 미노출
    // 노출창: 시작 horizonMs 전 ~ 종료시각 (사용자 설정).
    if (now < c.startMs - c.horizonMs || now > c.endMs) return;
    const prev = best.get(c.userId);
    if (!prev || c.startMs < prev.startMs) best.set(c.userId, c);
  };
  // 내 일정은 가시성 토글만 통과하면 horizon 무관 (내 거니까 노출창 제한 X).
  // 단순화를 위해 매우 큰 horizon(=항상 노출창 안)을 부여.
  const ALWAYS_HORIZON = Number.MAX_SAFE_INTEGER;
  const mineHorizon = showMine ? ALWAYS_HORIZON : 0;

  // 나 — 내 일정은 가시성 무관(내 것). showMine='off'면 mineHorizon=0 → 미노출.
  if (input.myProfile) {
    const meId = input.myProfile.id || 'me';
    for (const s of input.mySchedules) {
      consider({
        userId: meId,
        relation: 'me',
        photoUri: input.myProfile.photoUri,
        thumbUri: input.myProfile.photoThumbUri,
        poolId: s.poolId,
        startMs: slotMs(s.date, s.start),
        endMs: slotMs(s.date, s.end),
        horizonMs: mineHorizon,
      });
    }
  }

  // 친구·사람들 — useFriends 경유. 차단 제외, 친구/사람들 분기, private 제외.
  // 친구 = friendById에 있는 사용자 (visibility friends/public 둘 다 노출).
  // 사람들 = friendById에 없는 사용자 중 visibility==='public'만 노출 +
  //        profileVis='public' 사용자만 (publicHorizonMs로 게이팅).
  const friendById = new Map(input.friends.map((f) => [f.id, f]));
  const blockedSet = new Set(input.blocked);
  for (const o of input.otherSchedules) {
    if (blockedSet.has(o.userId)) continue;
    if (o.visibility === 'private') continue;
    const f = friendById.get(o.userId);
    if (f) {
      consider({
        userId: o.userId,
        relation: 'friend',
        photoUri: f.avatar, // 노출 아바타는 useFriends 소스 기준
        poolId: o.poolId,
        startMs: slotMs(o.date, o.start),
        endMs: slotMs(o.date, o.end),
        horizonMs: friendHorizonMs,
      });
    } else if (o.visibility === 'public' && publicHorizonMs > 0) {
      // 사람들(비친구) — 친구 아닌 사람의 전체공개 일정. relation='other'
      // → Avatar 외곽선 pd-gray + 정렬 시 친구 뒤로 밀림(친구 우선).
      consider({
        userId: o.userId,
        relation: 'other',
        photoUri: o.avatar,
        poolId: o.poolId,
        startMs: slotMs(o.date, o.start),
        endMs: slotMs(o.date, o.end),
        horizonMs: publicHorizonMs,
      });
    }
  }

  // 나 — 수영 레슨(공개 시). 레슨풀 + 주간 슬롯 → 다음 회차로 consider.
  // 일정과 같은 consider 라 userId당 최임박(레슨·일정 통합) 1건만 남음.
  if (input.myProfile && input.showMyLessons && input.myLessonPoolId) {
    const meId = input.myProfile.id || 'me';
    for (const sc of input.mySwimClasses ?? []) {
      const occ = lessonOccurrenceMs(sc.day, sc.start, sc.end, now);
      consider({
        userId: meId,
        relation: 'me',
        photoUri: input.myProfile.photoUri,
        thumbUri: input.myProfile.photoThumbUri,
        poolId: input.myLessonPoolId,
        startMs: occ.startMs,
        endMs: occ.endMs,
        horizonMs: mineHorizon,
      });
    }
  }

  // 친구 — 친구공개/전체공개 레슨. useFriends 경유(차단·실친구), private 제외.
  // 일정과 동일하게 'private'만 가림 — 'friends'/'public' 모두 친구인 나에게 노출.
  for (const o of input.otherLessons ?? []) {
    if (blockedSet.has(o.userId)) continue;
    if (o.visibility === 'private') continue;
    const f = friendById.get(o.userId);
    const occ = lessonOccurrenceMs(o.day, o.start, o.end, now);
    if (f) {
      consider({
        userId: o.userId,
        relation: 'friend',
        photoUri: f.avatar,
        poolId: o.poolId,
        startMs: occ.startMs,
        endMs: occ.endMs,
        horizonMs: friendHorizonMs,
      });
    } else if (o.visibility === 'public' && publicHorizonMs > 0) {
      consider({
        userId: o.userId,
        relation: 'other',
        photoUri: o.avatar,
        poolId: o.poolId,
        startMs: occ.startMs,
        endMs: occ.endMs,
        horizonMs: publicHorizonMs,
      });
    }
  }

  // 풀별 그룹 → 정렬(나 먼저, 나머지 시드+풀+사용자 해시 셔플) → cap.
  // 시드가 매 포커스마다 새 값이면 표본 추출(앞 9명)과 순서 둘 다 재셔플.
  const byPool = new Map<string, Cand[]>();
  for (const c of best.values()) {
    const arr = byPool.get(c.poolId);
    if (arr) arr.push(c);
    else byPool.set(c.poolId, [c]);
  }

  const result = new Map<string, PoolStack>();
  // 정렬 우선순위 — 나(고정 0번) > 친구 > 사람들(비친구). 9칸이 다 차면 친구가
  // 우선 채워지고 사람들은 남는 자리에만. 같은 우선순위 안에서는 (시드+풀+사용자)
  // 해시 셔플로 매 진입마다 다른 9명·다른 순서.
  const relRank = (r: StackRelation): number =>
    r === 'me' ? 0 : r === 'friend' ? 1 : 2;
  for (const [poolId, cands] of byPool) {
    const me = cands.filter((c) => c.relation === 'me');
    const others = cands
      .filter((c) => c.relation !== 'me')
      .sort((a, b) => {
        const dr = relRank(a.relation) - relRank(b.relation);
        if (dr !== 0) return dr;
        return (
          hash(shuffleSeed + ':' + poolId + ':' + a.userId) -
          hash(shuffleSeed + ':' + poolId + ':' + b.userId)
        );
      });
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
