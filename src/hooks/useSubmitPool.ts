// 수영장 추가/수정 요청 → pool_submissions INSERT.
// PoolNameScreen에서 호출. mode='create'면 pool_id NULL, mode='edit'면 기존 pool_id 필수.

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SubmitPoolArgs {
  mode: 'create' | 'edit';
  poolId?: string;        // edit일 때 필수 (기존 풀 식별)
  poolName: string;       // 사용자가 입력한 풀 이름
  description?: string;   // create: 추가 정보 / edit: 수정 요청 본문
  submitterContact?: string; // 옵션
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
      });
      if (error) throw error;
    },
  });
}
