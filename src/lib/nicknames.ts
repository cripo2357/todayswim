// 가입 닉네임 중복 확인/선점 — public.profile_nicknames (migration 0019).

import { supabase } from './supabase';

/**
 * 닉네임이 이미 선점됐는지 조회.
 * 조회 자체가 실패(네트워크 등)하면 false 반환 — 가입을 막지 않는다.
 * 동시성 상황의 최종 방어선은 테이블 PK(nickname) 제약.
 */
export async function isNicknameTaken(nickname: string): Promise<boolean> {
  const n = nickname.trim();
  if (!n) return false;
  const { data, error } = await supabase
    .from('profile_nicknames')
    .select('nickname')
    .eq('nickname', n)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

/** 가입 완료 시 닉네임 선점. 이미 점유돼 있으면 PK 충돌로 조용히 무시된다. */
export async function claimNickname(nickname: string): Promise<void> {
  const n = nickname.trim();
  if (!n) return;
  await supabase.from('profile_nicknames').insert({ nickname: n });
}
