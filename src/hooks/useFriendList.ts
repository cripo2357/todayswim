// 친구 목록 페이지네이션 seam (friends_scalability 메모리).
//
// Phase 1: 로컬 friends store를 가나다순 정렬 후 12개씩 윈도잉.
//          검색 시엔 전체 매치 노출(메모리라 가능, 보통 소수).
// Phase 2: 이 훅의 "구현"만 서버 커서 페이지네이션 + 서버 검색으로
//          교체한다. 인터페이스(items/hasMore/loadMore/query/setQuery)는
//          그대로 → FriendsTab 무수정. 이게 Phase1↔2 단일 swap point.

import React from 'react';
import { compareKo } from '@/lib/koSort';
import { useFriends } from '@/store/friends';
import type { MockAccount } from '@/lib/mockData';

export const FRIEND_PAGE = 12;

export interface FriendListResult {
  /** 그릴 친구 — 검색없으면 12씩 누적, 검색이면 전체 매치 */
  items: MockAccount[];
  /** 필터 적용 후 총 수(섹션 카운트용) */
  total: number;
  /** 더 불러올 게 있나 (검색 중이 아닐 때만 페이징) */
  hasMore: boolean;
  /** 검색어 입력 중 여부 */
  searching: boolean;
  /** 스크롤 하단 도달 시 +12 */
  loadMore: () => void;
  /** 확정된 검색어 */
  query: string;
  /** 검색어 설정(윈도우 리셋) */
  setQuery: (q: string) => void;
}

export function useFriendList(): FriendListResult {
  const friends = useFriends((s) => s.friends);
  const [query, setQueryRaw] = React.useState('');
  const [visible, setVisible] = React.useState(FRIEND_PAGE);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // 정렬·필터는 friends/검색어 변화 시에만 (매 렌더 재정렬 방지).
  const sorted = React.useMemo<MockAccount[]>(() => {
    const base = q
      ? friends.filter((f) => f.nickname.toLowerCase().includes(q))
      : friends;
    return [...base].sort((a, b) => compareKo(a.nickname, b.nickname));
  }, [friends, q]);

  const items = searching ? sorted : sorted.slice(0, visible);
  const hasMore = !searching && sorted.length > items.length;

  const loadMore = React.useCallback(() => {
    setVisible((v) => v + FRIEND_PAGE);
  }, []);

  const setQuery = React.useCallback((next: string) => {
    setQueryRaw(next);
    setVisible(FRIEND_PAGE); // 검색/해제 시 12부터 다시
  }, []);

  return {
    items,
    total: sorted.length,
    hasMore,
    searching,
    loadMore,
    query,
    setQuery,
  };
}
