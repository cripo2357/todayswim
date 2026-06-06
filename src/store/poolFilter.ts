/**
 * 수영장 검색 필터 상태.
 *
 * Figma 57:2036 — 자유수영 운영 요일, 레인 길이, 자유수영 요금, 부가 시설.
 * 모든 카테고리 multi-select. 카테고리별로 "전체 선택" 또는 "아무것도 선택 안함" 상태는
 * 필터 미적용과 동일하게 취급 (= isFilterActive false).
 */
import { create } from 'zustand';
import type { DayOfWeek, Schedule } from '@/types/schedule';
import type { Pool } from '@/types/pool';

/** 레인 길이 — 라디오 단일선택. '전체'면 미적용. */
export type LaneOption = '전체' | '25m' | '50m';
/** 자유수영 요금 — 라디오 단일선택. '전체'면 미적용. Figma 85:3129 — 오천원 이하 추가. */
export type FeeOption = '전체' | '오천원 이하' | '만원 이하';
export type FacilityOption = '어린이풀' | '다이빙' | '호텔';

/** 각 카테고리 전체 옵션. */
export const ALL_DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];
export const ALL_LANES: LaneOption[] = ['전체', '25m', '50m'];
export const ALL_FEES: FeeOption[] = ['전체', '오천원 이하', '만원 이하'];
export const ALL_FACILITIES: FacilityOption[] = ['어린이풀', '다이빙', '호텔'];

interface FilterState {
  days: DayOfWeek[];
  lane: LaneOption;
  fee: FeeOption;
  facilities: FacilityOption[];

  apply: (input: {
    days: DayOfWeek[];
    lane: LaneOption;
    fee: FeeOption;
    facilities: FacilityOption[];
  }) => void;
  /** 기본값(DEFAULT_DAYS, 전체)으로 복귀 — 필터 화면의 "초기화" 버튼용. */
  reset: () => void;
  /** 모든 필터 해제 → isFilterActive=false. 지도 pill X 버튼용. */
  clearAll: () => void;
}

// 기본값: 주말(토/일) 자유수영 위주 사용 패턴에 맞춰 토·일만 선택. 레인/요금/시설은 전체.
export const DEFAULT_DAYS: DayOfWeek[] = ['토', '일'];

export const usePoolFilter = create<FilterState>((set) => ({
  // 초기 store는 빈 상태(필터 미적용) — App.tsx mount 시 clearAll()로 한 번 더 보장.
  // 사용자 편의 기본(토/일)은 PoolFilterScreen 진입 시 fallback으로 적용.
  days: [],
  lane: '전체',
  fee: '전체',
  facilities: [],

  apply: ({ days, lane, fee, facilities }) => set({ days, lane, fee, facilities }),
  reset: () => set({ days: DEFAULT_DAYS, lane: '전체', fee: '전체', facilities: [] }),
  clearAll: () => set({ days: [], lane: '전체', fee: '전체', facilities: [] }),
}));

export function isFilterActive(s: FilterState): boolean {
  // 요일: 1개 이상 선택돼 있으면 OR 필터 적용 (선택 요일 중 하나라도 운영하는 풀만 통과).
  //       시간표 없는 풀은 어느 요일도 운영 안 함 → 자동 탈락.
  // 부가시설: 1개 이상 선택돼 있으면 AND 필터 적용 (선택한 시설 모두 보유한 풀만 통과).
  return (
    s.days.length > 0 ||
    s.lane !== '전체' ||
    s.fee !== '전체' ||
    s.facilities.length > 0
  );
}

/**
 * 필터 조건에 매칭되는 풀만 반환.
 * - days: 1개 이상 선택 = 해당 요일 중 하나라도 운영하는 풀 (OR). 시간표 없는 풀은 자동 탈락.
 * - lane: '전체' 미적용 / '25m만' = 25m / '50m만' = 50m
 * - fee: '전체' 미적용 / '오천원 이하' = 일일가 ≤5000 / '만원 이하' = ≤10000. 일일요금 없는 풀(월권 전용)은 제외.
 * - facilities: 1개 이상 선택 = 선택한 시설 모두 보유한 풀 (AND).
 */
export function filterPools(
  pools: Pool[],
  schedules: Schedule[],
  s: FilterState,
): Pool[] {
  const dayActive = s.days.length > 0;
  const laneActive = s.lane !== '전체';
  const feeActive = s.fee !== '전체';
  const facActive = s.facilities.length > 0;

  if (!dayActive && !laneActive && !feeActive && !facActive) return pools;

  return pools.filter((p) => {
    if (dayActive) {
      const sched = schedules.find((sc) => sc.poolId === p.id);
      if (!sched) return false;
      const hit = s.days.some((d) => (sched.byDay[d]?.length ?? 0) > 0);
      if (!hit) return false;
    }
    if (laneActive) {
      const len = p.poolLength ?? 0;
      if (s.lane === '25m' && len !== 25) return false;
      if (s.lane === '50m' && len !== 50) return false;
    }
    if (feeActive) {
      // 요금 필터는 '1일 이용권' 기준. 일일요금이 아예 없는 풀(월권·쿠폰 전용)은 검색대상서 제외.
      // 토/일 개별가는 없으면 주말 공통가 폴백. 월요금·회차권은 일일이 아니라 제외.
      const dailyPrices = [
        p.priceWeekday,
        p.priceSat ?? p.priceWeekend,
        p.priceSun ?? p.priceWeekend,
      ].filter((v): v is number => v != null);
      if (dailyPrices.length === 0) return false;
      const minDaily = Math.min(...dailyPrices);
      if (s.fee === '오천원 이하' && minDaily > 5000) return false;
      if (s.fee === '만원 이하' && minDaily > 10000) return false;
    }
    if (facActive) {
      // 옵션 칩(어린이풀/다이빙/호텔)은 boolean flag — 선택한 옵션 모두 보유해야 통과 (AND).
      for (const f of s.facilities) {
        if (f === '어린이풀' && !p.hasKidsPool) return false;
        if (f === '다이빙' && !p.hasDivingPool) return false;
        if (f === '호텔' && !p.isHotelPool) return false;
      }
    }
    return true;
  });
}
