// Pool's day — 일정 초대 관계 서버 동기 (0296 schedule_invites).
//
// 발송/수락/거절/취소 4개 플로우가 호출. userSchedulesSync 와 동일한 정책:
//  - best-effort: 오프라인/미인증이어도 로컬 UX(알림·일정)는 진행, 서버 반영만 silent fail.
//  - RLS(0296): insert=초대자 본인, update=양 당사자 본인. 서비스롤 불필요(사용자 JWT).
//
// 식별 전략: 알림에 invite id 를 안 싣는다. (초대자, 피초대자, 슬롯) 자연키로 갱신 —
// 0296 의 부분 unique(pending) 인덱스가 그 조합의 pending 행을 ≤1개로 보장하므로
// 자연키만으로 정확히 그 행을 전이할 수 있다(발송 직후 navigate 의 await 불필요).
//
// references: 0296_schedule_invites, userSchedulesSync, message_rules_architecture.

import { supabase } from './supabase';

export interface InviteSlot {
  poolId: string;
  poolName: string;
  poolPhotoUrl?: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
}

/** 슬롯 자연키(WHERE 절 공통) — pool_id + date + start_time. */
type SlotKey = Pick<InviteSlot, 'poolId' | 'date' | 'start'>;

/**
 * 초대 발송 — 피초대자별 pending 행 insert. best-effort.
 * inviterScheduleId 는 초대자 원본 일정 id(컨텍스트·후속 UI 용, nullable).
 */
export async function createInvites(
  inviterId: string,
  inviteeIds: string[],
  slot: InviteSlot,
  inviterScheduleId?: string,
): Promise<void> {
  if (!inviterId || inviteeIds.length === 0) return;
  try {
    const rows = inviteeIds.map((invitee_id) => ({
      inviter_id: inviterId,
      invitee_id,
      inviter_schedule_id: inviterScheduleId ?? null,
      pool_id: slot.poolId,
      pool_name: slot.poolName,
      pool_photo_url: slot.poolPhotoUrl ?? null,
      date: slot.date,
      start_time: slot.start,
      end_time: slot.end,
    }));
    await supabase.from('schedule_invites').insert(rows);
  } catch {
    /* best-effort */
  }
}

/**
 * 초대 응답(수락/거절) — (초대자,피초대자,슬롯)의 pending 행을 자연키로 전이.
 * 부분 unique(pending)라 ≤1행만 매칭. 수락 시 invitee 본인 일정 id 기록(컨텍스트).
 * 이미 취소/만료된 stale 카드 탭이면 매칭 0행(무해).
 */
export async function respondInviteBySlot(
  inviterId: string,
  inviteeId: string,
  slot: SlotKey,
  status: 'accepted' | 'rejected',
  acceptedScheduleId?: string,
): Promise<void> {
  if (!inviterId || !inviteeId) return;
  try {
    await supabase
      .from('schedule_invites')
      .update({
        status,
        responded_at: new Date().toISOString(),
        ...(status === 'accepted' && acceptedScheduleId
          ? { accepted_schedule_id: acceptedScheduleId }
          : {}),
      })
      .eq('inviter_id', inviterId)
      .eq('invitee_id', inviteeId)
      .eq('pool_id', slot.poolId)
      .eq('date', slot.date)
      .eq('start_time', slot.start)
      .eq('status', 'pending');
  } catch {
    /* best-effort */
  }
}

/**
 * 초대 취소 — 초대자가 보낸 (피초대자들, 슬롯)의 pending 행을 canceled.
 * 이미 수락/거절된 행은 그대로 보존(pending 만 전이).
 */
export async function cancelInvitesBySlot(
  inviterId: string,
  inviteeIds: string[],
  slot: SlotKey,
): Promise<void> {
  if (!inviterId || inviteeIds.length === 0) return;
  try {
    await supabase
      .from('schedule_invites')
      .update({ status: 'canceled', responded_at: new Date().toISOString() })
      .eq('inviter_id', inviterId)
      .in('invitee_id', inviteeIds)
      .eq('pool_id', slot.poolId)
      .eq('date', slot.date)
      .eq('start_time', slot.start)
      .eq('status', 'pending');
  } catch {
    /* best-effort */
  }
}