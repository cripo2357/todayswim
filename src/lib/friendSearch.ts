// 새 친구 검색 — Phase-1(목업). Figma 168:7488 / 168:9354.
//
// 후보 = MOCK_FRIENDS ∪ MOCK_NON_FRIENDS, 기존 친구·차단 제외(useFriends 경유,
// block_policy_enforcement). "기존 친구와 비공개 사용자는 검색되지 않습니다" —
// 기존 친구/차단은 여기서 제외. "비공개 사용자"(상대 friendRequest 설정)는
// Phase-2: 유저 프로필이 로컬이라 타인 설정을 알 수 없음 → 갭 명시.
// 서버 profiles 조회도 Phase-2(현재 profiles 테이블 없음 — 사용자 확정).

import { MOCK_FRIENDS, MOCK_NON_FRIENDS, type MockAccount } from '@/lib/mockData';
import type { AvatarId } from '@/lib/avatars';

// 친구코드 유틸 단일 출처는 lib/friendCode. 외부 호환성 위해 re-export.
export { accountCode, sanitizeCode } from '@/lib/friendCode';

export interface FriendSearchUser {
  id: string;
  nickname: string;
  status: string;
  avatar: AvatarId;
  /** 6자리 계정 ID. P2 진입(2026-05-20) 후 mock id 자체가 친구코드 — `code = id`. */
  code: string;
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
    nickname: a.nickname,
    status: a.status,
    avatar: a.avatar,
    // P2 진입 후 mock id = 친구코드라 둘이 같다.
    code: a.id,
  };
}

/** 닉네임 부분일치(대소문자 무시). 정확>접두>포함 순, 최대 20. */
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
    let rank = -1;
    if (nk === q) rank = 0;
    else if (nk.startsWith(q)) rank = 1;
    else if (nk.includes(q)) rank = 2;
    if (rank >= 0) out.push({ u: toUser(a), rank });
  }
  out.sort((x, y) => x.rank - y.rank || x.u.nickname.localeCompare(y.u.nickname));
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
    // mock id = 친구코드라 직접 비교(대문자 통일).
    if (a.id.toUpperCase() === c) return toUser(a);
  }
  return null;
}

// sanitizeCode는 lib/friendCode 단일 출처 → 파일 상단에서 re-export.
