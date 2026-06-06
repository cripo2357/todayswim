// 풀 카드/리스트의 '이용요금' 한 줄 텍스트 단일 출처.
// PoolBottomCard·PoolListScreen이 동일 로직을 쓰던 것을 공통화(가격 표기 회귀 방지).
//
// 우선순위: 일일권(평일/토/일) → 회차권(쿠폰) → 월 등록. 표기는 쉼표 없는 정수 + 원(앱 전역 관례).
// 일일가 버킷(평일/토/일)은 같은 값끼리 라벨을 합침. 토=일이면 '주말'로 합침.
// 반환 null = 가격 정보 없음(미표시).
import type { Pool } from '@/types/pool';

export function formatPoolPrice(pool: Pool): string | null {
  const weekday = pool.priceWeekday ?? null;
  // 토/일 개별가 우선, 없으면 주말 공통가 폴백.
  const sat = pool.priceSat ?? pool.priceWeekend ?? null;
  const sun = pool.priceSun ?? pool.priceWeekend ?? null;

  const buckets: { label: string; price: number }[] = [];
  if (weekday != null) buckets.push({ label: '평일', price: weekday });
  if (sat != null && sun != null && sat === sun) {
    buckets.push({ label: '주말', price: sat });
  } else {
    if (sat != null) buckets.push({ label: '토', price: sat });
    if (sun != null) buckets.push({ label: '일', price: sun });
  }

  if (buckets.length > 0) {
    // 같은 가격끼리 라벨 합치기(순서 유지). 전부 같으면 라벨 없이 "이용요금 X원".
    const groups: { labels: string[]; price: number }[] = [];
    for (const b of buckets) {
      const g = groups.find((x) => x.price === b.price);
      if (g) g.labels.push(b.label);
      else groups.push({ labels: [b.label], price: b.price });
    }
    if (groups.length === 1) return `이용요금 ${groups[0].price}원`;
    return groups.map((g) => `${g.labels.join('·')} ${g.price}원`).join(' · ');
  }

  // 일일가 없음 → 회차권(쿠폰) → 월 등록 순.
  if (pool.pricePerTime != null) {
    return pool.pricePerTimeCount != null
      ? `이용요금 ${pool.pricePerTime}원(${pool.pricePerTimeCount}회)`
      : `이용요금 ${pool.pricePerTime}원`;
  }
  if (pool.priceMonthly != null) {
    return `이용요금 ${pool.priceMonthly}원(1개월)`;
  }
  return null;
}
