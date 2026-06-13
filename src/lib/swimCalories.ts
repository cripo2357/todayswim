// 수영 칼로리 + 음식 환산 — 수영 일기 통계 엔진. (크리스 확정 2026-06-14)
//
// kcal = 체중(kg) × 수영시간(h) × 영법가중평균MET
//   영법가중평균MET = Σ(MET_영법 × 거리_영법) / 총거리   (접영 많을수록 ↑)
// 체중 = profile.weight(선택 입력) 우선 → 없으면 성별×연령대 기본표 → 전체 폴백.
// 음식 환산 = 베스트핏(1~5개로 가장 깔끔히 떨어지는 친숙한 음식), 주류 제외, "OO N개 태웠어요!".

import type { UserProfile } from '@/store/profile';

export type StrokeKey = '자유형' | '배영' | '접영' | '평형' | '기타';

// 영법별 MET (Compendium of Physical Activities, 자유수영 중강도).
export const STROKE_MET: Record<StrokeKey, number> = {
  자유형: 8.3,
  배영: 9.5,
  평형: 10.3, // breaststroke
  접영: 13.8, // butterfly — 가장 높음
  기타: 6.0,
};

const STROKE_ORDER: StrokeKey[] = ['자유형', '배영', '접영', '평형', '기타'];

// 성별×연령대 기본 체중(kg) — 한국 성인 평균 근사치. profile.weight 미입력 시 폴백.
const DEFAULT_WEIGHT: Record<'male' | 'female', Record<number, number>> = {
  male: { 10: 64, 20: 73, 30: 77, 40: 76, 50: 72, 60: 68, 70: 64 },
  female: { 10: 55, 20: 57, 30: 58, 40: 59, 50: 59, 60: 58, 70: 55 },
};
const FALLBACK_WEIGHT = 63;

function ageFromBirth(birthDate?: string): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  if ((now.getMonth() + 1) * 100 + now.getDate() < m * 100 + d) age--;
  return age >= 0 && age < 120 ? age : null;
}

function ageBucket(age: number): number {
  if (age < 20) return 10;
  if (age >= 70) return 70;
  return Math.floor(age / 10) * 10; // 20~60
}

/** 칼로리용 체중(kg) — profile.weight 우선 → 성별×연령대 기본 → 전체 폴백. */
export function resolveWeightKg(
  p: Pick<UserProfile, 'weight' | 'gender' | 'birthDate'>,
): number {
  if (p.weight && p.weight > 0) return p.weight;
  const age = ageFromBirth(p.birthDate);
  const b = age == null ? 30 : ageBucket(age); // 연령 미상이면 30대 기준
  if (p.gender === 'male') return DEFAULT_WEIGHT.male[b];
  if (p.gender === 'female') return DEFAULT_WEIGHT.female[b];
  return age == null
    ? FALLBACK_WEIGHT
    : Math.round((DEFAULT_WEIGHT.male[b] + DEFAULT_WEIGHT.female[b]) / 2);
}

export interface SwimRecordInput {
  /** 레인 길이(m). 회(편도) × 레인 = 거리. */
  laneLength: number;
  /** 영법별 회수(1회 = 레인 1편도). */
  reps: Partial<Record<StrokeKey, number>>;
  /** 총 수영 시간(분). */
  durationMin: number;
}

export interface SwimStats {
  totalDistance: number; // m
  breakdown: { stroke: StrokeKey; distance: number }[];
  durationMin: number;
  kcal: number;
}

/** 거리 = 레인 × 회, kcal = 체중 × 시간(h) × 가중평균MET. */
export function computeSwimStats(
  input: SwimRecordInput,
  weightKg: number,
): SwimStats {
  const breakdown = STROKE_ORDER.map((s) => ({
    stroke: s,
    distance: (input.reps[s] ?? 0) * input.laneLength,
  })).filter((b) => b.distance > 0);
  const totalDistance = breakdown.reduce((s, b) => s + b.distance, 0);
  const hours = input.durationMin / 60;
  let kcal = 0;
  if (totalDistance > 0 && hours > 0) {
    const wMet =
      breakdown.reduce((s, b) => s + STROKE_MET[b.stroke] * b.distance, 0) /
      totalDistance;
    kcal = Math.round(weightKg * hours * wMet);
  }
  return { totalDistance, breakdown, durationMin: input.durationMin, kcal };
}

// 음식 환산 — 베스트핏. 주류 제외(운동 앱). kcal 근사치.
interface Food {
  label: string;
  unit: string;
  kcal: number;
}
const FOODS: Food[] = [
  { label: '바나나', unit: '개', kcal: 90 },
  { label: '초코파이', unit: '개', kcal: 170 },
  { label: '아이스크림', unit: '개', kcal: 180 },
  { label: '라떼', unit: '잔', kcal: 180 },
  { label: '공깃밥', unit: '공기', kcal: 300 },
  { label: '떡볶이', unit: '인분', kcal: 300 },
  { label: '치킨', unit: '조각', kcal: 250 },
  { label: '김밥', unit: '줄', kcal: 480 },
  { label: '라면', unit: '개', kcal: 500 },
  { label: '삼겹살', unit: '인분', kcal: 500 },
  { label: '햄버거', unit: '개', kcal: 550 },
  { label: '짜장면', unit: '그릇', kcal: 700 },
];

export interface FoodEquivalent {
  label: string;
  count: number;
  unit: string;
  text: string;
}

/** kcal → "OO N개 태웠어요!" (1~5개로 가장 깔끔히 떨어지는 음식). */
export function caloriesToFood(kcal: number): FoodEquivalent | null {
  if (kcal <= 0) return null;
  let best: { f: Food; count: number; err: number } | null = null;
  for (const f of FOODS) {
    const raw = kcal / f.kcal;
    const count = Math.max(1, Math.round(raw));
    if (count > 5) continue; // 너무 많으면 후보 제외
    const err = Math.abs(raw - count);
    if (!best || err < best.err) best = { f, count, err };
  }
  if (!best) {
    // 초고소모(전부 5개 초과) → 가장 큰 음식 기준.
    const f = FOODS[FOODS.length - 1];
    best = { f, count: Math.max(1, Math.round(kcal / f.kcal)), err: 0 };
  }
  return {
    label: best.f.label,
    count: best.count,
    unit: best.f.unit,
    text: `${best.f.label} ${best.count}${best.f.unit} 태웠어요!`,
  };
}

// ── 레포트 문구 ─────────────────────────────────────────────────────────
function hasJong(s: string): boolean {
  const c = s.charCodeAt(s.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
}
/** 을/를 조사. */
function withEul(s: string): string {
  return s + (hasJong(s) ? '을' : '를');
}
/** 으로/로 조사 (ㄹ받침은 '로'). */
function withEuro(s: string): string {
  const c = s.charCodeAt(s.length - 1);
  const jong = c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 : 0;
  return s + (jong === 0 || jong === 8 ? '로' : '으로');
}

/** "2시간 10분" / "50분" / "1시간". */
export function formatSwimDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

export interface SwimReport {
  /** 통계 요약 문장. */
  main: string;
  /** ※ 계산 방식 안내(+몸무게 미입력 시 nudge). */
  note: string;
}

/** 일기 통계 레포트 문구. weightEntered=profile.weight 입력 여부. */
export function buildSwimReport(
  stats: SwimStats,
  laneLength: number,
  weightEntered: boolean,
): SwimReport | null {
  if (stats.totalDistance <= 0 || stats.durationMin <= 0) return null;
  const reps = Math.round(stats.totalDistance / laneLength);
  const dur = formatSwimDuration(stats.durationMin);
  const top = [...stats.breakdown].sort((a, b) => b.distance - a.distance)[0]
    .stroke;
  const fe = caloriesToFood(stats.kcal);
  const foodTail = fe
    ? ` 소모해서 ${withEul(`${fe.label} ${fe.count}${fe.unit}`)} 태운 셈이에요! 🔥`
    : ' 소모했어요!';

  const head =
    stats.breakdown.length === 1
      ? `${dur} 동안 ${laneLength}m 레인을 ${reps}회 ${withEuro(top)} 수영했어요.`
      : `${dur} 동안 ${laneLength}m 레인을 ${reps}회 수영했고, ${withEul(top)} 가장 많이 했어요.`;

  const main = `${head} 이번 수영으로 ${stats.kcal}kcal를${foodTail}`;
  const wbase = weightEntered ? '입력하신 몸무게' : '성별·연령대 표준 몸무게';
  const note = `※ 칼로리는 영법별 MET 계수와 ${wbase}로 계산돼요.${weightEntered ? '' : ' 프로필에 몸무게를 입력하면 더 정확해져요.'}`;
  return { main, note };
}