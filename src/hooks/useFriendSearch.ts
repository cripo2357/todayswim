// 친구 검색 — 서버 profiles 단일 출처(2026-06-05 prod 정리).
//
// 정책:
// - **server-only.** profiles 테이블을 nickname ilike / friend-code(id) 로 조회.
// - mock 검색은 제거. (P3에서 mock 친구 서버 시드가 빠져 mock 결과는 실 계정이
//   아니므로, 추가해도 friend_requests FK 위반·알림이 어디에도 안 감 = "상대가
//   메시지를 못 받는" 회귀 원인이었음. 다른 P3 mock 제거와 일관.)
// - eligibility(기존 친구·차단 제외)는 호출부가 동일 필터 적용.

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  type FriendSearchUser,
  type FriendSearchOpts,
} from '@/lib/friendSearch';
import {
  trySearchProfilesByNickname,
  tryFindProfileByCode,
  type ProfileSearchRow,
} from '@/lib/friendsSync';

/** profiles row → FriendSearchUser. photo_uri 는 번들 AvatarId 또는 업로드 사진
 *  uri — 둘 다 그대로 통과(Avatar 가 uri/번들 모두 렌더). null 만 기본 폴백. */
function rowToUser(row: ProfileSearchRow): FriendSearchUser {
  return {
    id: row.id,
    nickname: row.nickname,
    status: row.bio ?? '',
    avatar: row.photo_uri ?? 'avatar-male-1',
    code: row.id, // mock id = 친구코드 통일과 일관.
  };
}

function dedupeAndFilter(
  list: FriendSearchUser[],
  opts: FriendSearchOpts,
): FriendSearchUser[] {
  const friendSet = new Set(opts.friendIds);
  const blockedSet = new Set(opts.blockedIds);
  const seen = new Set<string>();
  const out: FriendSearchUser[] = [];
  for (const u of list) {
    if (seen.has(u.id)) continue;
    if (opts.selfId && u.id === opts.selfId) continue; // 자기 자신 제외
    if (friendSet.has(u.id)) continue;
    if (blockedSet.has(u.id)) continue;
    seen.add(u.id);
    out.push(u);
  }
  return out;
}

/** 닉네임 검색 — 서버 profiles ilike. 최대 20. (mock 제거) */
export function useNicknameSearch(
  query: string,
  opts: FriendSearchOpts,
): FriendSearchUser[] {
  const q = query.trim();

  // 서버 결과 — async, staleTime은 전역 60s.
  const { data: serverResults = [] } = useQuery({
    queryKey: ['friendSearch.nickname', q],
    queryFn: async (): Promise<FriendSearchUser[]> => {
      const rows = await trySearchProfilesByNickname(q);
      return rows.map(rowToUser);
    },
    enabled: q.length > 0,
  });

  return React.useMemo(
    () => dedupeAndFilter(serverResults, opts).slice(0, 20),
    [serverResults, opts],
  );
}

/** 6자리 코드 검색 — mock 즉시 + 서버 폴백. 둘 중 어느 쪽이든 찾으면 반환.
 *  null = 6자 입력했는데 못 찾음. 6자 미만 = 입력 중. */
export function useCodeSearch(
  code: string,
  opts: FriendSearchOpts,
): FriendSearchUser | null {
  const c = code.trim().toUpperCase();
  const ready = c.length === 6;

  const { data: serverResult } = useQuery({
    queryKey: ['friendSearch.code', c],
    queryFn: async (): Promise<FriendSearchUser | null> => {
      const row = await tryFindProfileByCode(c);
      return row ? rowToUser(row) : null;
    },
    enabled: ready,
  });

  if (!ready) return null;
  const found = serverResult ?? null; // server-only (mock 제거)
  if (!found) return null;
  // eligibility — 자기 자신·친구·차단이면 검색 결과에서 제외.
  if (opts.selfId && found.id === opts.selfId) return null;
  if (opts.friendIds.includes(found.id)) return null;
  if (opts.blockedIds.includes(found.id)) return null;
  return found;
}
