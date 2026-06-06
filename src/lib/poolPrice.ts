// 풀 카드/리스트의 '이용요금' 한 줄 텍스트 단일 출처.
// PoolBottomCard·PoolListScreen이 동일 로직을 쓰던 것을 공통화(가격 표기 회귀 방지).
//
// 우선순위: 일일권(평일/토/일) → 회차권(쿠폰) → 월 등록. 표기는 쉼표 없는 정수 + 원(앱 전역 관례).
// "이용요금" 같은 prefix 안 씀(의도된 적 없음, 크리스 2026-06-07). 금액만 표기.
// 일일가는 주중/토/일 각각 표기(묶지 않음). 전부 같으면 'X원', 토=일이면 '주말'. 회차권='OO원(N회)', 월='OO원(1개월)'.
// 반환 null = 가격 정보 없음(미표시).
import type { Pool } from '@/types/pool';

export function formatPoolPrice(pool: Pool): string | null {
  const weekday = pool.priceWeekday ?? null;
  // 토/일 개별가 우선, 없으면 주말 공통가 폴백.
  const sat = pool.priceSat ?? pool.priceWeekend ?? null;
  const sun = pool.priceSun ?? pool.priceWeekend ?? null;

  const buckets: { label: string; price: number }[] = [];
  if (weekday != null) buckets.push({ label: '주중', price: weekday });
  if (sat != null && sun != null && sat === sun) {
    buckets.push({ label: '주말', price: sat });
  } else {
    if (sat != null) buckets.push({ label: '토', price: sat });
    if (sun != null) buckets.push({ label: '일', price: sun });
  }

  if (buckets.length > 0) {
    // 전부 같은 값이면 금액만 "X원". 다르면 주중/토/일을 각각 따로 표기(묶지 않음).
    const allSame = buckets.every((b) => b.price === buckets[0].price);
    if (allSame) return `${buckets[0].price}원`;
    return buckets.map((b) => `${b.label} ${b.price}원`).join(' · ');
  }

  // 일일가 없음 → 회차권(쿠폰) → 월 등록 순.
  if (pool.pricePerTime != null) {
    return pool.pricePerTimeCount != null
      ? `${pool.pricePerTime}원(${pool.pricePerTimeCount}회)`
      : `${pool.pricePerTime}원`;
  }
  if (pool.priceMonthly != null) {
    return `${pool.priceMonthly}원(1개월)`;
  }
  return null;
}
