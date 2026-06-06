// 풀 카드/리스트의 '이용요금' 한 줄 텍스트 단일 출처.
// PoolBottomCard·PoolListScreen이 동일 로직을 쓰던 것을 공통화(가격 표기 회귀 방지).
//
// 우선순위: 일일권(평일/주말) → 없으면 월 등록(정기) 대표 월요금.
// 표기는 쉼표 없는 정수 + 원 (앱 전역 가격 표기 관례). 월요금은 'OO원(1개월)'로 일일권과 구분.
// 반환 null = 가격 정보 없음(미표시).
import type { Pool } from '@/types/pool';

export function formatPoolPrice(pool: Pool): string | null {
  if (pool.priceWeekday != null) {
    if (pool.priceWeekend != null && pool.priceWeekday !== pool.priceWeekend) {
      return `평일 ${pool.priceWeekday}원 · 주말 ${pool.priceWeekend}원`;
    }
    return `이용요금 ${pool.priceWeekday}원`;
  }
  if (pool.priceMonthly != null) {
    return `이용요금 ${pool.priceMonthly}원(1개월)`;
  }
  return null;
}
