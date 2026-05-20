// Pool's day — Phase 2 세 번째 배치: 친구 시스템 서버 best-effort 동기.
//
// 정책(profileSync와 동일 톤):
// - **로컬 우선**. useFriends store(zustand)가 권위 — UI는 즉시 반영, 서버는
//   백그라운드 best-effort. 다중 기기 동기화는 실 auth 진입 후.
// - **friend_request ID 클라가 모름** → `(from, to, status=pending)` 조합으로
//   UPDATE. 0048의 partial unique(from+to where pending) 인덱스가 1개 보장.
// - **친구코드 = profiles.id**. mock 친구(fr1 등)는 서버 profiles row 없어
//   FK 위반으로 silent fail — 실 사용자끼리만 의미 있는 동기. 정상 동작.
// - **현재 유저 친구코드 = `useProfile.getState().profile?.id`**. 없으면 skip
//   (가입 전, mock 로그인 일부 케이스). 호출부가 가드.
//
// references: profiles_schema, 0048_friends, block_policy_enforcement,
// message_rules_architecture.

import { supabase } from './supabase';

/** 친구 요청 보내기 — friend_requests insert (status='pending'). */
export async function tryInsertFriendRequest(
  fromId: string,
  toId: string,
): Promise<void> {
  try {
    await supabase
      .from('friend_requests')
      .insert({ from_profile_id: fromId, to_profile_id: toId });
  } catch {
    /* best-effort */
  }
}

/** 보낸 요청 취소 — pending 상태인 같은 from→to UPDATE. */
export async function tryCancelFriendRequest(
  fromId: string,
  toId: string,
): Promise<void> {
  try {
    await supabase
      .from('friend_requests')
      .update({ status: 'cancelled', responded_at: new Date().toISOString() })
      .eq('from_profile_id', fromId)
      .eq('to_profile_id', toId)
      .eq('status', 'pending');
  } catch {
    /* best-effort */
  }
}

/** 받은 요청 거절 — pending 상태인 같은 from→to UPDATE. */
export async function tryRejectFriendRequest(
  fromId: string,
  toId: string,
): Promise<void> {
  try {
    await supabase
      .from('friend_requests')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('from_profile_id', fromId)
      .eq('to_profile_id', toId)
      .eq('status', 'pending');
  } catch {
    /* best-effort */
  }
}

/** 받은 요청 수락 — pending 요청을 accepted로 + 양방향 friendships insert. */
export async function tryAcceptFriendRequest(
  meId: string,
  otherId: string,
): Promise<void> {
  try {
    await supabase
      .from('friend_requests')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('from_profile_id', otherId)
      .eq('to_profile_id', meId)
      .eq('status', 'pending');
    // 양방향 두 행. 짝 보장 = 두 insert 동시 시도.
    await supabase.from('friendships').upsert([
      { profile_id: meId, friend_id: otherId },
      { profile_id: otherId, friend_id: meId },
    ]);
  } catch {
    /* best-effort */
  }
}

/** 친구 삭제 — 양방향 friendships 행 모두 delete. */
export async function tryDeleteFriendship(
  meId: string,
  friendId: string,
): Promise<void> {
  try {
    // (me, friend) + (friend, me) 한 번에. OR 필터 사용.
    await supabase
      .from('friendships')
      .delete()
      .or(
        `and(profile_id.eq.${meId},friend_id.eq.${friendId}),and(profile_id.eq.${friendId},friend_id.eq.${meId})`,
      );
  } catch {
    /* best-effort */
  }
}

/** 영구 차단 — blocks insert. 트리거가 friendships/pending 요청 cleanup. */
export async function tryInsertBlock(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  try {
    await supabase
      .from('blocks')
      .insert({ blocker_id: blockerId, blocked_id: blockedId });
  } catch {
    /* best-effort */
  }
}

// ─── 재설치/기기변경 복구용 — 현 단계 호출처 없음(실 auth 진입 후) ───
// future: useFriends.hydrate() 시 호출 — 로컬 비었을 때만.

/** 친구 목록 fetch — friendships 양방향 두 행 중 내 쪽만. */
export async function tryFetchFriendIds(meId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('profile_id', meId);
    if (error || !data) return [];
    return data.map((r) => r.friend_id as string);
  } catch {
    return [];
  }
}

/** 받은 요청 fetch — to=me, status=pending. */
export async function tryFetchIncomingRequestFromIds(
  meId: string,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('from_profile_id')
      .eq('to_profile_id', meId)
      .eq('status', 'pending');
    if (error || !data) return [];
    return data.map((r) => r.from_profile_id as string);
  } catch {
    return [];
  }
}

/** 보낸 요청 fetch — from=me, status=pending. */
export async function tryFetchOutgoingRequestToIds(
  meId: string,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('to_profile_id')
      .eq('from_profile_id', meId)
      .eq('status', 'pending');
    if (error || !data) return [];
    return data.map((r) => r.to_profile_id as string);
  } catch {
    return [];
  }
}

/** 차단 목록 fetch — blocker=me. */
export async function tryFetchBlockedIds(meId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', meId);
    if (error || !data) return [];
    return data.map((r) => r.blocked_id as string);
  } catch {
    return [];
  }
}
