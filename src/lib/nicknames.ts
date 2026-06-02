// 가입 닉네임 중복 확인/선점 — public.profile_nicknames (migration 0019).

import { supabase } from './supabase';

/**
 * 닉네임이 이미 선점됐는지 조회 — 백엔드 profile_nicknames 단일 권위.
 * 조회 실패(네트워크 등)면 false(fail-open) — 가입을 막지 않는다.
 * 최종 방어선은 테이블 PK(nickname) 제약.
 */
// 운영 사칭 차단어 — 정규화(소문자/공백·특수 제거) 후 '포함' 검사.
// 예: '운영자수영', 'x풀스데이' 등 부분 포함도 모두 차단.
const RESERVED = [
  '풀스데이', 'poolsday', 'poolday', '풀스', 'pools',
  '매니저', 'manager', '운영자', '운영진', '운영팀', '운영', '운영측',
  '관리자', '관리', '어드민', 'admin', 'administrator', 'root',
  '공식', 'official', '고객센터', '고객지원', '문의', 'support', 'cs',
  '스태프', 'staff', '마스터', 'master', '시스템', 'system', '봇', 'bot',
];

// 욕설/비속어 어근 — 정규화 후 '포함' 검사(1차 필터; 자모분리·변형
// 완전대응은 백엔드 모더레이션 몫). 대표 어근만 최소 유지.
const PROFANITY = [
  '시발', '씨발', '시바', 'ㅅㅂ', '병신', 'ㅂㅅ', '지랄', 'ㅈㄹ',
  '개새', '새끼', '쌍놈', '쌍년', '썅', '좆', '존나', '죶', '니미',
  '보지', '자지', '걸레', '창녀', '엿먹', '닥쳐', '꺼져', '죽어',
  '애미', '느금', '느개비', 'tlqkf', 'qudtls', 'wlfkf',
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'fck',
];

/**
 * 닉네임 정책 위반 사유(즉시·오프라인 1차 필터) — 운영 사칭 / 욕설. 없으면 null.
 * 입력 중 즉시 피드백용 정적 검사. 최종 권위는 "변경 적용 시점"의
 * nicknameBlockReasonRemote(서버 nickname_blocklist 그 자리 조회) —
 * isNicknameTaken(중복)이 제출 시 서버 조회하는 것과 동일 톤.
 */
export function nicknameBlockReason(
  nickname: string,
): 'reserved' | 'profanity' | null {
  const n = nickname.trim().toLowerCase();
  if (!n) return null;
  if (RESERVED.some((w) => n.includes(w))) return 'reserved';
  if (PROFANITY.some((w) => n.includes(w))) return 'profanity';
  return null;
}

/**
 * 변경 적용 시점 서버 차단어 검사 — public.nickname_blocklist 를 그 자리에서
 * 조회(항상 최신; 운영자가 코드 배포 없이 추가/삭제 가능). DB 트리거(0043)와
 * 동일 정규화: 소문자화 후 substring 포함. profanity 우선 판정.
 * 네트워크/조회 실패 시 null(fail-open) — 정적 nicknameBlockReason 이 1차 방어선.
 */
export async function nicknameBlockReasonRemote(
  nickname: string,
): Promise<'reserved' | 'profanity' | null> {
  const n = nickname.trim().toLowerCase();
  if (!n) return null;
  const { data, error } = await supabase
    .from('nickname_blocklist')
    .select('term, kind');
  if (error || !data) return null;
  let reserved = false;
  for (const row of data as { term: string; kind: 'reserved' | 'profanity' }[]) {
    const t = row.term.trim().toLowerCase();
    if (t && n.includes(t)) {
      if (row.kind === 'profanity') return 'profanity';
      reserved = true;
    }
  }
  return reserved ? 'reserved' : null;
}

/** 닉네임 위반 안내문구 (UI 표시용 단일 출처) */
export const NICKNAME_NOTICE: Record<'reserved' | 'profanity' | 'taken', string> = {
  reserved: '운영진을 사칭할 수 있는 닉네임은 사용할 수 없습니다.',
  profanity: '부적절한 표현이 포함된 닉네임은 사용할 수 없습니다.',
  taken: '이미 사용중인 닉네임입니다.',
};

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

/**
 * 닉네임 입력 필터 — 영소문자(a-z)·한글·숫자만 허용.
 * 공백·특수문자·영대문자 등 그 외 문자는 모두 제거(입력 자체를 차단).
 * 한글 IME 조합 중 자모(ㄱ-ㅎ, ㅏ-ㅣ, 결합 자모 U+1100~U+11FF)도 허용해
 * 입력 도중 글자가 끊기지 않게 한다.
 */
export function sanitizeNickname(v: string): string {
  return v.replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣᄀ-ᇿ]/g, '');
}
