// 새 친구 검색 — Phase-1(목업). Figma 168:7488 / 168:9354.
//
// 후보 = MOCK_FRIENDS ∪ MOCK_NON_FRIENDS, 기존 친구·차단 제외(useFriends 경유,
// block_policy_enforcement). "기존 친구와 비공개 사용자는 검색되지 않습니다" —
// 기존 친구/차단은 여기서 제외. "비공개 사용자"(상대 friendRequest 설정)는
// Phase-2: 유저 프로필이 로컬이라 타인 설정을 알 수 없음 → 갭 명시.
// 서버 profiles 조회도 Phase-2(현재 profiles 테이블 없음 — 사용자 확정).

import { MOCK_FRIENDS, MOCK_NON_FRIENDS, type MockAccount } from '@/lib/mockData';
import type { AvatarId } from '@/lib/avatars';

export interface FriendSearchUser {
  id: string;
  name: string;
  nickname: string;
  status: string;
  avatar: AvatarId;
  /** 6자리 계정 ID — Phase-1 결정적 파생(실 genProfileId는 Phase-2) */
  code: string;
}

// genProfileId(store/profile)와 동일 세트 — 혼동문자(0/O/1/I/L) 제외.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** 계정 id → 결정적 6자리 코드. Phase-1 ID 검색 데모용(실 ID는 Phase-2). */
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

const ALL: MockAccount[] = [...MOCK_FRIENDS, ...MOCK_NON_FRIENDS];

export interface FriendSearchOpts {
  /** 현재 친구 id (제외) */
  friendIds: readonly string[];
  /** 차단 id (제외) */
  blockedIds: readonly string[];
}

function eligible(a: MockAccount, o: FriendSearchOpts): boolean {
  return !o.friendIds.includes(a.id) && !o.blockedIds.includes(a.id);
}

function toUser(a: MockAccount): FriendSearchUser {
  return {
    id: a.id,
    name: a.name,
    nickname: a.nickname,
    status: a.status,
    avatar: a.avatar,
    code: accountCode(a.id),
  };
}

/** 닉네임/이름 부분일치(대소문자 무시). 정확>접두>포함 순, 최대 20. */
export function searchByNickname(
  query: string,
  o: FriendSearchOpts,
): FriendSearchUser[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: { u: FriendSearchUser; rank: number }[] = [];
  for (const a of ALL) {
    if (!eligible(a, o)) continue;
    const nk = a.nickname.toLowerCase();
    const nm = a.name.toLowerCase();
    let rank = -1;
    if (nk === q || nm === q) rank = 0;
    else if (nk.startsWith(q) || nm.startsWith(q)) rank = 1;
    else if (nk.includes(q) || nm.includes(q)) rank = 2;
    if (rank >= 0) out.push({ u: toUser(a), rank });
  }
  out.sort((x, y) => x.rank - y.rank || x.u.name.localeCompare(y.u.name));
  return out.slice(0, 20).map((x) => x.u);
}

/** 정확한 6자리 코드 매칭(대소문자 무시). 없으면 null. */
export function findByCode(
  code: string,
  o: FriendSearchOpts,
): FriendSearchUser | null {
  const c = code.trim().toUpperCase();
  if (c.length !== 6) return null;
  for (const a of ALL) {
    if (!eligible(a, o)) continue;
    if (accountCode(a.id) === c) return toUser(a);
  }
  return null;
}

/** ID 입력 정규화 — CODE_ALPHABET 문자만, 대문자, 최대 6자리. */
export function sanitizeCode(v: string): string {
  return v
    .toUpperCase()
    .split('')
    .filter((ch) => CODE_ALPHABET.includes(ch))
    .join('')
    .slice(0, 6);
}
