// 수영 칼로리 + 음식 환산 — 수영 일기 통계 엔진. (크리스 확정 2026-06-14, 페이스 선형 확정)
//
// kcal = 체중(kg) × 수영시간(h) × MET(페이스),  페이스 = 총거리(m) ÷ 시간(분)
//   MET = 2.64 + 0.10 × 페이스  ≡  kcal = 179×h + 0.113×거리 (@68kg)
//   "물속 기저(시간) + 빠를수록 강도(페이스) 가산" 구조. floor·임계점 없이 페이스에 선형.
//
// 애플워치 실측 29샘플 최소제곱 회귀로 calibration (총칼로리 기준). MAPE ~10%.
//   잔차 ~10%는 사람마다 다른 몸무게·심박(강도) 탓 — 거리·시간만으론 더 못 줄임(애플은 심박 보유).
//   초기 3샘플로 만든 floor+임계점 모델은 고강도 과소평가(페이스45=실측MET8.7인데 모델6.7)라 폐기.
// 거리·영법은 "페이스(=거리/시간)"를 통해 강도로 간접 반영(직접 MET 곱셈은 실측과 어긋나 폐기:
//   접영 25% 샘플인데 분당 안 올랐고, 거리기반 역산값도 2배 벌어졌음). STROKE_MET은 참고용.
// 체중 = profile.weight(선택 입력) 우선 → 없으면 성별×연령대 기본표 → 전체 폴백.
// 음식 환산 = 베스트핏(1~5개로 가장 깔끔히 떨어지는 친숙한 음식), 주류 제외, "OO N개 태웠어요!".

import type { UserProfile } from '@/store/profile';

export type StrokeKey = '자유형' | '배영' | '평영' | '접영' | '기타';

// 영법별 MET (Compendium of Physical Activities, 자유수영 중강도).
export const STROKE_MET: Record<StrokeKey, number> = {
  자유형: 8.3,
  배영: 9.5,
  평영: 10.3, // breaststroke
  접영: 13.8, // butterfly — 가장 높음
  기타: 6.0,
};

const STROKE_ORDER: StrokeKey[] = ['자유형', '배영', '평영', '접영', '기타'];

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

// 페이스 선형 MET calibration — 애플워치 실측 29샘플 최소제곱 회귀(@68kg).
//   kcal = 179×h + 0.113×거리 ≡ 체중 × h × (2.64 + 0.10×페이스). MAPE ~10%.
// MET_BASE = 물속 저강도/휴식 기저(페이스 0이어도 발생), SLOPE = 페이스(m/min)당 증가.
const MET_BASE = 2.64;
const MET_PACE_SLOPE = 0.1; // m/min당 MET 증가(빠를수록 강도↑)
const MET_MAX = 13; // 엘리트 스프린트 폭주 방지(페이스 ~104m/min에서 도달)

/** 사용자가 입력한 거리·시간으로 유효 MET·칼로리 산출. kcal = 체중 × 시간(h) × MET(페이스). */
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
  // 거리가 0이면(기록 없음) 칼로리도 0 — 시간만으론 '수영'으로 안 침.
  if (totalDistance > 0 && hours > 0) {
    const pace = totalDistance / input.durationMin; // m/min
    const met = Math.min(MET_MAX, MET_BASE + MET_PACE_SLOPE * pace);
    kcal = Math.round(weightKg * hours * met);
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
  const note = `※ 칼로리는 수영 시간·속도와 ${wbase}로 계산돼요.${weightEntered ? '' : ' 프로필에 몸무게를 입력하면 더 정확해져요.'}`;
  return { main, note };
}