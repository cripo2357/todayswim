// 가입 닉네임 중복 확인/선점 — public.profile_nicknames (migration 0019).

import { supabase } from './supabase';
import { MOCK_FRIENDS, MOCK_NON_FRIENDS } from './mockData';

// Phase1 로컬 점유 닉네임 — 목업 사용자들이 쓰는 닉네임(소문자 정규화).
// 백엔드 profile_nicknames가 비었거나(또는 미적용/RLS로 supabase 조회가
// fail-open 돼도) 목업 환경에서 중복검사가 실제로 동작하도록.
const MOCK_TAKEN = new Set(
  [...MOCK_FRIENDS, ...MOCK_NON_FRIENDS].map((a) =>
    a.nickname.trim().toLowerCase(),
  ),
);

/**
 * 닉네임이 이미 선점됐는지 조회.
 * ① 로컬 목업 점유분(항상) ② 백엔드 profile_nicknames.
 * 백엔드 조회 실패(네트워크 등)면 그쪽만 false — 가입을 막지 않되
 * 로컬 목업 중복은 항상 잡는다. 최종 방어선은 테이블 PK(nickname) 제약.
 */
export async function isNicknameTaken(nickname: string): Promise<boolean> {
  const n = nickname.trim();
  if (!n) return false;
  if (MOCK_TAKEN.has(n.toLowerCase())) return true;
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

/**
 * 닉네임 입력 필터 — 영소문자(a-z)·한글·숫자만 허용.
 * 공백·특수문자·영대문자 등 그 외 문자는 모두 제거(입력 자체를 차단).
 * 한글 IME 조합 중 자모(ㄱ-ㅎ, ㅏ-ㅣ, 결합 자모 U+1100~U+11FF)도 허용해
 * 입력 도중 글자가 끊기지 않게 한다.
 */
export function sanitizeNickname(v: string): string {
  return v.replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣᄀ-ᇿ]/g, '');
}
