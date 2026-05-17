// 친구 관계 — Phase 1 로컬(메모리) 보관. 친구 목록 + 받은 친구 요청.
// 백엔드 미연동: 친구 요청 보내기/실시간 동기화는 Phase 2.
// (sentInvites/notifications와 동일하게 앱 재시작 시 초기화.)

import { create } from 'zustand';
import { MOCK_FRIENDS, MOCK_NON_FRIENDS, type MockAccount } from '@/lib/mockData';

export interface FriendRequest {
  id: string; // 요청자 계정 id
  name: string;
  avatar: MockAccount['avatar'];
  nickname: string;
  status: string;
  time: string; // 표시용 수신 시각
}

// 받은 친구 요청 시드 — 친구 아닌 계정 일부가 요청한 상태(목).
const SEED_REQUESTS: FriendRequest[] = MOCK_NON_FRIENDS.slice(0, 2).map(
  (a, i) => ({
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    nickname: a.nickname,
    status: a.status,
    time: i === 0 ? '26.05.11 오전 3:23' : '26.05.10 오후 9:12',
  }),
);

interface FriendsState {
  friends: MockAccount[];
  requests: FriendRequest[];
  /** 친구로 등록 — 요청을 친구 목록으로 이동 */
  accept: (id: string) => void;
  /** 친구 요청 거절 — 요청 제거 */
  reject: (id: string) => void;
}

export const useFriends = create<FriendsState>((set) => ({
  friends: MOCK_FRIENDS,
  requests: SEED_REQUESTS,
  accept: (id) =>
    set((s) => {
      const req = s.requests.find((r) => r.id === id);
      if (!req) return s;
      const acc = MOCK_NON_FRIENDS.find((a) => a.id === id);
      const friend: MockAccount =
        acc ?? {
          id: req.id,
          name: req.name,
          nickname: req.nickname,
          status: req.status,
          code: '',
          avatar: req.avatar,
        };
      // 이미 친구면 중복 추가 방지
      const friends = s.friends.some((f) => f.id === id)
        ? s.friends
        : [friend, ...s.friends];
      return { friends, requests: s.requests.filter((r) => r.id !== id) };
    }),
  reject: (id) =>
    set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
}));
