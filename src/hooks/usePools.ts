// Supabase에서 풀 목록 fetch — react-query로 캐싱 (staleTime 60s, App.tsx queryClient 기본값).
//
// DB 컬럼은 snake_case (Postgres 컨벤션) — Pool TS 인터페이스의 camelCase로 매핑.
// 사진은 Supabase Storage URL을 photo_url 컬럼에 저장.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Pool } from '@/types/pool';

interface PoolRow {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  ownership: string;
  phone: string | null;
  website: string | null;
  lane_count: number | null;
  pool_length: number | null;
  depth_min: number | null;
  depth_max: number | null;
  facilities: string[] | null;
  has_kids_pool: boolean | null;
  has_diving_pool: boolean | null;
  is_hotel_pool: boolean | null;
  has_schedule: boolean | null;
  is_active: boolean | null;
  free_swim_available: boolean | null;
  price_per_session: number | null;
  price_weekday: number | null;
  price_weekend: number | null;
  photo_url: string | null;
}

function rowToPool(row: PoolRow): Pool {
  return {
    id: row.id,
    name: row.name,
    region: row.region as Pool['region'],
    district: row.district,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    type: row.type as Pool['type'],
    ownership: row.ownership as Pool['ownership'],
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    laneCount: row.lane_count ?? undefined,
    poolLength: row.pool_length ?? undefined,
    depthMin: row.depth_min ?? undefined,
    depthMax: row.depth_max ?? undefined,
    facilities: row.facilities ?? undefined,
    hasKidsPool: row.has_kids_pool ?? undefined,
    hasDivingPool: row.has_diving_pool ?? undefined,
    isHotelPool: row.is_hotel_pool ?? undefined,
    hasSchedule: row.has_schedule ?? undefined,
    freeSwimAvailable: row.free_swim_available ?? undefined,
    pricePerSession: row.price_per_session ?? undefined,
    // 평일가: price_weekday 우선, 없으면 레거시 price_per_session 폴백.
    priceWeekday: row.price_weekday ?? row.price_per_session ?? undefined,
    priceWeekend: row.price_weekend ?? undefined,
    photoUrl: row.photo_url ? { uri: row.photo_url } : undefined,
  };
}

export function usePools() {
  return useQuery({
    queryKey: ['pools'],
    queryFn: async (): Promise<Pool[]> => {
      // is_active=false(예: 호텔 풀)는 서비스에서 제외 — 0115_pools_is_active.
      const { data, error } = await supabase.from('pools').select('*').eq('is_active', true);
      if (error) throw error;
      return (data as PoolRow[]).map(rowToPool);
    },
  });
}
