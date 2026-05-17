// 메시지 발송 디스패처 — 단일 진입점.
//
// 액션 지점(초대/수락/거절/취소/만료 등)은 전부 dispatchMessage()만 호출한다.
// 룰(rules.ts) 조회 → 메시지 인스턴스 생성 → Supabase notifications insert.
//
// Phase 1: 수신자 식별이 로컬 친구코드(profile.id)뿐이라 "액션을 한 본인"의
// 이력 행만 적재된다(베스트 에포트, 실패해도 UX 비차단). 상대방 행 적재 +
// 수신함 실시간 동기화는 실 인증/서버 사이드 = Phase 2.

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/store/profile';
import { RULES, type MessageKind, type MessageParams } from './rules';

/** related: poolId/date 등 부가 식별 정보(조회·후속 액션용, 선택) */
export async function dispatchMessage(
  kind: MessageKind,
  params: MessageParams = {},
  related: Record<string, unknown> = {},
): Promise<void> {
  const userCode = useProfile.getState().profile?.id;
  if (!userCode) return; // 식별자 없으면 이력 키 불가 → 스킵

  const content = RULES[kind].build(params);
  try {
    await supabase.from('notifications').insert({
      user_code: userCode,
      kind,
      title: content.title,
      body: content.body,
      params,
      actions: content.actions ?? [],
      related,
    });
  } catch {
    // 오프라인/미인증 등 — 이력 적재 실패는 비차단(베스트 에포트).
  }
}
