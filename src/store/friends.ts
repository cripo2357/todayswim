// 친구 관계 — Phase 1 로컬(메모리) 보관.
// 4상태: none(신청 가능) / outgoing(내가 신청중) / incoming(내가 신청 받음)
//        / friend(친구). + blocked(영구 차단, 해제 불가·양방향 제외).
// 백엔드 미연동: 실시간 동기화는 Phase 2. (앱 재시작 시 초기화.)

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

export type FriendRelation =
  | 'none' // 신청 가능
  | 'outgoing' // 내가 신청중
  | 'incoming' // 내가 신청 받음
  | 'friend' // 친구
  | 'blocked'; // 영구 차단

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
  requests: FriendRequest[]; // 내가 받은 요청(incoming)
  sent: string[]; // 내가 보낸 요청 대상 id(outgoing)
  blocked: string[]; // 영구 차단 id(해제 없음)
  /** 친구로 등록 — 받은 요청을 친구 목록으로 이동 */
  accept: (id: string) => void;
  /** 받은 친구 요청 거절 — 요청 제거 */
  reject: (id: string) => void;
  /** 친구 신청 보내기 — none→outgoing */
  sendRequest: (id: string) => void;
  /** 보낸 요청 취소 — outgoing→none */
  cancelRequest: (id: string) => void;
  /** 친구 삭제 — friend→none (다시 신청 가능) */
  removeFriend: (id: string) => void;
  /** 영구 차단 — 친구/요청/보낸요청에서 제거 + blocked 추가(해제 불가) */
  block: (id: string) => void;
}

export const useFriends = create<FriendsState>((set) => ({
  friends: MOCK_FRIENDS,
  requests: SEED_REQUESTS,
  sent: [],
  blocked: [],
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
      const friends = s.friends.some((f) => f.id === id)
        ? s.friends
        : [friend, ...s.friends];
      return { friends, requests: s.requests.filter((r) => r.id !== id) };
    }),
  reject: (id) =>
    set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
  sendRequest: (id) =>
    set((s) =>
      s.sent.includes(id) ? s : { sent: [...s.sent, id] },
    ),
  cancelRequest: (id) =>
    set((s) => ({ sent: s.sent.filter((x) => x !== id) })),
  removeFriend: (id) =>
    set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
  block: (id) =>
    set((s) =>
      s.blocked.includes(id)
        ? s
        : {
            blocked: [...s.blocked, id],
            friends: s.friends.filter((f) => f.id !== id),
            requests: s.requests.filter((r) => r.id !== id),
            sent: s.sent.filter((x) => x !== id),
          },
    ),
}));

/** 특정 사용자와의 관계 — blocked 최우선, 그다음 friend/incoming/outgoing/none */
export function friendRelation(
  s: Pick<FriendsState, 'friends' | 'requests' | 'sent' | 'blocked'>,
  id: string,
): FriendRelation {
  if (s.blocked.includes(id)) return 'blocked';
  if (s.friends.some((f) => f.id === id)) return 'friend';
  if (s.requests.some((r) => r.id === id)) return 'incoming';
  if (s.sent.includes(id)) return 'outgoing';
  return 'none';
}
