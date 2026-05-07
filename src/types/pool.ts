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
  id: string;                   // "POOL_SEOUL_0001"
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
  facilities?: string[];        // ['샤워실', '주차장', '사물함']
  hasSchedule?: boolean;        // 자유수영 시간표 등록 여부
}
