// 메시지 발송 디스패처 — 단일 진입점.
//
// 액션 지점(초대/수락/거절/취소/만료 등)은 전부 dispatchMessage()만 호출한다.
// 룰(rules.ts) 조회 → 메시지 인스턴스 생성 → Supabase notifications insert.
//
// 변수 정책 (v0.6 — 스펙 §변수 갱신 방식)
//  · pool/시간표/date/time: **사실 기록(fact-snapshot)** — 여기서 발송 시점 값을
//    params에 박아 저장. 이후 풀명 변경/풀 삭제는 옛 카드에 영향 없음.
//  · nickname/avatar: **정체성(identity), live lookup** — params.name은 호환·
//    로깅용 폴백이고, P2 render는 params.user_id로 매번 user 테이블 조회해
//    현재 닉네임으로 갱신(없으면 [탈퇴 회원]).
//
// Phase 1: 수신자 식별이 로컬 친구코드(profile.id)뿐이라 "액션을 한 본인"의
// 이력 행만 적재된다(베스트 에포트, 실패해도 UX 비차단). 상대방 행 적재 +
// 수신함 실시간 동기화는 실 인증/서버 사이드 = Phase 2.
//
// related (Phase 2 navigate/dead-link 가드용)
//  · poolId        : 풀 dead-link 가드 (deleted_at 체크)
//  · scheduleId    : 일정 dead-link 가드 (수영 일정 삭제 체크)
//  · senderUserId  : identity live lookup의 키 (닉네임/아바타)
//  · termsKey      : 약관 키 유효성 가드

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/store/profile';
import { RULES, type MessageKind, type MessageParams } from './rules';

/** related: poolId/scheduleId/senderUserId/termsKey 등 — Phase 2 후속 액션·
 *  dead-link 가드용 ID 참조. params(표시값)와 분리해 둔다(스펙 §저장 형식). */
export async function dispatchMessage(
  kind: MessageKind,
  params: MessageParams = {},
  related: Record<string, unknown> = {},
): Promise<void> {
  const userCode = useProfile.getState().profile?.id;
  if (!userCode) return; // 식별자 없으면 이력 키 불가 → 스킵

  // 발송 시점 fact-snapshot: pool 빈 문자열 정규화 (이후 render에서 폴백 안 거치게).
  // P2엔 풀 테이블 lookup으로 발송 시점 풀명을 한 번 더 정규화할 수 있다.
  const snapshotParams: MessageParams = {
    ...params,
    pool: params.pool?.trim() || undefined,
  };

  const content = RULES[kind].build(snapshotParams);
  try {
    await supabase.from('notifications').insert({
      user_code: userCode,
      kind,
      title: content.title,
      body: content.body,
      params: snapshotParams,
      actions: content.actions ?? [],
      related,
    });
  } catch {
    // 오프라인/미인증 등 — 이력 적재 실패는 비차단(베스트 에포트).
  }
}
