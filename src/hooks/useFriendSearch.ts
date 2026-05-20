// 친구 검색 — P2 진입(2026-05-20) 후 mock + 서버 결합.
//
// 정책:
// - mock 검색(searchByNickname/findByCode)은 sync, 즉시 반환 — UX 응답성 보존.
// - 서버 검색은 React Query 비동기, 결과 합쳐서 dedupe by id.
// - mock 친구가 이미 서버에 시드돼 둘이 거의 동일한 결과 — 서버가 더 권위지만
//   네트워크 실패/오프라인 대비 mock fallback 유지(useOtherSchedules 동일 패턴).
// - eligibility(기존 친구·차단 제외)는 호출부가 동일 필터 적용.

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  searchByNickname as mockSearchByNickname,
  findByCode as mockFindByCode,
  type FriendSearchUser,
  type FriendSearchOpts,
} from '@/lib/friendSearch';
import {
  trySearchProfilesByNickname,
  tryFindProfileByCode,
  type ProfileSearchRow,
} from '@/lib/friendsSync';
import type { AvatarId } from '@/lib/avatars';

/** profiles row → FriendSearchUser. photo_uri 가 번들 AvatarId면 그대로, 아니면 폴백. */
function rowToUser(row: ProfileSearchRow): FriendSearchUser {
  const a = row.photo_uri ?? 'avatar-male-1';
  const avatar = (a.startsWith('avatar-') ? a : 'avatar-male-1') as AvatarId;
  return {
    id: row.id,
    name: row.nickname,
    nickname: row.nickname,
    status: row.bio ?? '',
    avatar,
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
    if (friendSet.has(u.id)) continue;
    if (blockedSet.has(u.id)) continue;
    seen.add(u.id);
    out.push(u);
  }
  return out;
}

/** 닉네임 검색 — mock 즉시 결과 + 서버 결과 합쳐 dedupe. 최대 20. */
export function useNicknameSearch(
  query: string,
  opts: FriendSearchOpts,
): FriendSearchUser[] {
  const q = query.trim();

  // mock 결과 — sync, 즉시.
  const mockResults = React.useMemo(
    () => mockSearchByNickname(q, opts),
    [q, opts],
  );

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
    () => dedupeAndFilter([...mockResults, ...serverResults], opts).slice(0, 20),
    [mockResults, serverResults, opts],
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

  const mockResult = React.useMemo(
    () => (ready ? mockFindByCode(c, opts) : null),
    [c, ready, opts],
  );

  const { data: serverResult } = useQuery({
    queryKey: ['friendSearch.code', c],
    queryFn: async (): Promise<FriendSearchUser | null> => {
      const row = await tryFindProfileByCode(c);
      return row ? rowToUser(row) : null;
    },
    enabled: ready,
  });

  if (!ready) return null;
  // 둘 중 누구든 찾으면 사용. 서버 우선(권위).
  const found = serverResult ?? mockResult ?? null;
  if (!found) return null;
  // eligibility — 친구·차단이면 검색 결과에서 제외.
  if (opts.friendIds.includes(found.id)) return null;
  if (opts.blockedIds.includes(found.id)) return null;
  return found;
}
