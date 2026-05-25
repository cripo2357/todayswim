/**
 * 풀(수영장) 데이터 모델.
 * SPEC.md §5에서 정의한 Pool 인터페이스를 그대로 옮김.
 */

export type Region =
  | '서울' | '부산' | '대구' | '인천' | '광주' | '대전' | '울산' | '세종'
  | '경기' | '강원' | '충북' | '충남' | '전북' | '전남' | '경북' | '경남' | '제주';

export type PoolType = 'indoor' | 'outdoor' | 'both';
export type PoolOwnership = 'public' | 'private';

export interface Pool {
  id: string;                   // "POOL_0001" (opaque sequence, region 무관)
  name: string;                 // "ABC 수영장"
  region: Region;
  district: string;             // "송파구", "관악구 행운동" 등
  address: string;              // 도로명/지번
  lat: number;
  lng: number;
  type: PoolType;
  ownership: PoolOwnership;
  phone?: string;               // "02-1234-5678"
  website?: string;
  laneCount?: number;           // 4
  poolLength?: number;          // 25, 50 (m)
  depthMin?: number;            // 1.2 (m)
  depthMax?: number;            // 1.8 (m)
  facilities?: string[];        // ['샤워실', '주차장', '사물함'] — 세부 시설
  // 카드(Figma 93:10597) 1차 분류 칩 — cyan rounded square로 노출
  hasKidsPool?: boolean;        // 어린이풀 보유
  hasDivingPool?: boolean;      // 다이빙풀 보유
  isHotelPool?: boolean;        // 호텔 부속 — 마커도 별도(marker-hotel)
  hasSchedule?: boolean;        // 자유수영 시간표 등록 여부
  freeSwimAvailable?: boolean;  // 자유수영 자체가 가능한 풀인지 (false면 PoolBottomCard에서 "자유수영 불가능" 표시)
  pricePerSession?: number;     // (레거시) 단일 1회가 — priceWeekday로 대체
  priceWeekday?: number;        // 평일 성인 1회 가격 (KRW, 쉼표 없는 정수)
  priceWeekend?: number;        // 주말 성인 1회 가격 (KRW)
  // 수영장 건물 사진 (1:1, 정사각). 없으면 카드에서 미노출.
  // 로컬 require()는 number, 원격은 { uri: string } 형태.
  photoUrl?: number | { uri: string };
}
