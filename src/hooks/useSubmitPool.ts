// 수영장 추가/수정 요청 → pool_submissions INSERT.
// create: 사용자가 입력한 풀 정보 일체를 넘김. 좌표는 운영자가 검수 시 처리.
// edit: 풀 이름 + description(수정 요청 내용).

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SubmitPoolArgs {
  mode: 'create' | 'edit';
  poolId?: string;        // edit일 때 기존 풀 식별
  poolName: string;       // 수영장 이름 (create/edit 공통, 필수)
  /** edit 모드 — 수정 요청 본문 */
  description?: string;
  /** edit 모드 — 제출자 연락처 옵션 */
  submitterContact?: string;
  /** create 모드 상세 필드 */
  laneCount?: number;
  poolLength?: 25 | 50;
  depthMin?: number;
  depthMax?: number;
  hasKidsPool?: boolean;
  hasDivingPool?: boolean;
  isHotelPool?: boolean;
}

export function useSubmitPool() {
  return useMutation({
    mutationFn: async (args: SubmitPoolArgs) => {
      const { error } = await supabase.from('pool_submissions').insert({
        mode: args.mode,
        pool_id: args.mode === 'edit' ? args.poolId ?? null : null,
        pool_name: args.poolName.trim(),
        description: args.description?.trim() || null,
        submitter_contact: args.submitterContact?.trim() || null,
        lane_count: args.mode === 'create' ? args.laneCount ?? null : null,
        pool_length: args.mode === 'create' ? args.poolLength ?? null : null,
        depth_min: args.mode === 'create' ? args.depthMin ?? null : null,
        depth_max: args.mode === 'create' ? args.depthMax ?? null : null,
        has_kids_pool: args.mode === 'create' ? !!args.hasKidsPool : false,
        has_diving_pool: args.mode === 'create' ? !!args.hasDivingPool : false,
        is_hotel_pool: args.mode === 'create' ? !!args.isHotelPool : false,
      });
      if (error) throw error;
    },
  });
}
