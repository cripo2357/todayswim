// 친구코드(6자리) 단일 출처 — profile.id PK + 검색 표시 + mock 시드 모두 동일 세트.
//
// 혼동 문자(0/O/1/I/L) 제외 31자 알파벳. 길이 6 → 31^6 ≈ 8.87억 경우의 수.
//
// 이전엔 ALPHABET·genProfileId가 store/profile, accountCode가 lib/friendSearch에
// 분산. P2 mock→profiles 시드 진입(2026-05-20) 시점에 mockData가 accountCode를
// 쓰면서 순환 의존 우려 → 한 파일로 통일.

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const FRIEND_CODE_ALPHABET = CODE_ALPHABET;

/** 임의 6자리 친구코드 — 계정 생성·재발급용(profile.id). */
export function genProfileId(): string {
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return s;
}

/**
 * 임의 string → 결정적 6자리 친구코드(FNV-1a 32bit 해시 + 알파벳 매핑).
 * Phase-1에서 mock 계정 id를 친구코드로 자동 산출하는 데 사용. 같은 입력은
 * 항상 같은 결과 → mock 시드 마이그레이션과 클라 매칭.
 */
export function accountCode(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let x = h >>> 0;
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += CODE_ALPHABET[x % CODE_ALPHABET.length];
    x = (Math.floor(x / CODE_ALPHABET.length) + (i + 1) * 0x9e3779b1) >>> 0;
  }
  return s;
}

/** 사용자 입력 정규화 — CODE_ALPHABET 문자만, 대문자, 최대 6자리. */
export function sanitizeCode(v: string): string {
  return v
    .toUpperCase()
    .split('')
    .filter((ch) => CODE_ALPHABET.includes(ch))
    .join('')
    .slice(0, 6);
}
