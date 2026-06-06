// 메시지 발송 디스패처 — 단일 진입점.
//
// 액션 지점(초대/수락/거절/취소/만료 등)은 전부 dispatchMessage()만 호출한다.
// 룰(rules.ts) 조회 → 메시지 인스턴스 생성 → Supabase notifications insert
// + (P3-A4 통합) 본인 외 수신자에게 OS 푸시 발송.
//
// 변수 정책 (v0.6 — 스펙 §변수 갱신 방식)
//  · pool/시간표/date/time: **사실 기록(fact-snapshot)** — 여기서 발송 시점 값을
//    params에 박아 저장. 이후 풀명 변경/풀 삭제는 옛 카드에 영향 없음.
//  · nickname/avatar: **정체성(identity), live lookup** — params.name은 호환·
//    로깅용 폴백이고, P2 render는 params.user_id로 매번 user 테이블 조회해
//    현재 닉네임으로 갱신(없으면 [탈퇴 회원]).
//
// Phase 2(2026-05-20~) 진입: 호출자가 `toUserCode`를 알려주면 'self'(액션을
// 한 본인) + 'other'(상대) 두 행을 동시 적재. RULES[kind].recipients가
// 'self'면 toUserCode 무시. 'both'/'other'면 toUserCode 필수(없으면 self만).
// 수신함 fetch는 hooks/useNotifications.
//
// P3 (2026-05-21) — OS 푸시 통합 (B.1):
//  · notifications insert 후, **본인 외 수신자**에게 send-push Edge Function 호출.
//  · profile.id(친구코드) → auth_uid 변환해 user_ids 전달.
//  · 본인 행(self)은 인앱만 — 방금 본인 액션 confirm 푸시는 노이즈.
//  · best-effort — 실패해도 알림 적재는 살아있음.
//  · Apple TEST MODE: 상대 profile.auth_uid 가 null/없음이면 push skip.
//
// related (Phase 2 navigate/dead-link 가드용)
//  · poolId        : 풀 dead-link 가드 (deleted_at 체크)
//  · scheduleId    : 일정 dead-link 가드 (수영 일정 삭제 체크)
//  · senderUserId  : identity live lookup의 키 (닉네임/아바타)
//  · termsKey      : 약관 키 유효성 가드

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/store/profile';
import { RULES, type MessageKind, type MessageParams } from './rules';
import { categoryOf, type NotifCategory } from './notifCategory';

// ─────────────────────────────────────────────────────────────────────
// OS 푸시 발송 helper — 친구코드(profile.id) → auth_uid 변환 → send-push.
// best-effort, 실패 silent. 호출 측에서 await 안 함(void).
// ─────────────────────────────────────────────────────────────────────
async function sendPushToUserCode(
  toUserCode: string,
  title: string,
  bodyLines: string[],
  data: Record<string, unknown>,
  category: NotifCategory,
): Promise<void> {
  try {
    // 친구코드 → auth_uid lookup. mock 사용자(auth_uid null) 는 skip.
    const { data: prof } = await supabase
      .from('profiles')
      .select('auth_uid')
      .eq('id', toUserCode)
      .maybeSingle();
    const authUid = (prof as { auth_uid?: string | null } | null)?.auth_uid;
    if (!authUid) return;

    await supabase.functions.invoke('send-push', {
      body: {
        user_ids: [authUid],
        title,
        // 인앱 알림 body 는 줄 배열이지만 OS 푸시는 단일 문자열 — join.
        // 빈 줄(separator) 은 제외.
        body: bodyLines.filter((l) => l.length > 0).join('\n'),
        data,
        // 카테고리 — send-push 가 받는 사람 notif_prefs[category] 로 게이팅.
        category,
      },
    });
  } catch {
    /* best-effort — 푸시 실패해도 인앱 알림은 살아있음 */
  }
}

/** dispatchMessage 옵션. `toUserCode` 가 주어지면 상대 행도 적재(P2 진입). */
export interface DispatchOptions {
  /** 'other' 수신자(상대 친구코드 = profile.id). RULES[kind].recipients가
   *  'self'면 무시. 'other'/'both'면 이 값이 있어야 상대 행 적재. */
  toUserCode?: string;
}

/** related: poolId/scheduleId/senderUserId/termsKey 등 — Phase 2 후속 액션·
 *  dead-link 가드용 ID 참조. params(표시값)와 분리해 둔다(스펙 §저장 형식). */
export async function dispatchMessage(
  kind: MessageKind,
  params: MessageParams = {},
  related: Record<string, unknown> = {},
  options: DispatchOptions = {},
): Promise<void> {
  const userCode = useProfile.getState().profile?.id;
  if (!userCode) return; // 식별자 없으면 이력 키 불가 → 스킵

  // 발송 시점 fact-snapshot: pool 빈 문자열 정규화 (이후 render에서 폴백 안 거치게).
  // P2엔 풀 테이블 lookup으로 발송 시점 풀명을 한 번 더 정규화할 수 있다.
  const snapshotParams: MessageParams = {
    ...params,
    pool: params.pool?.trim() || undefined,
  };

  const rule = RULES[kind];
  const content = rule.build(snapshotParams);

  // 누구에게 적재할지: rule.recipients + options.toUserCode 조합.
  // - 'self': 본인 행만
  // - 'other': 상대 행만 (toUserCode 있을 때)
  // - 'both': 본인 + 상대 (toUserCode 있을 때만 상대 추가)
  const category = categoryOf(kind);
  const rows: Record<string, unknown>[] = [];
  const base = {
    kind,
    title: content.title,
    body: content.body,
    params: snapshotParams,
    actions: content.actions ?? [],
    related,
    category, // 트리거 경로 게이팅용 — notifications.category
  };
  if (rule.recipients === 'self' || rule.recipients === 'both') {
    rows.push({ ...base, user_code: userCode });
  }
  if (
    (rule.recipients === 'other' || rule.recipients === 'both') &&
    options.toUserCode &&
    options.toUserCode !== userCode
  ) {
    rows.push({ ...base, user_code: options.toUserCode });
  }
  if (rows.length === 0) return;

  try {
    await supabase.from('notifications').insert(rows);
  } catch {
    // 오프라인/미인증 등 — 이력 적재 실패는 비차단(베스트 에포트).
  }

  // OS 푸시 발송.
  // 규칙: category != 'none' AND NOT(본인행 AND category=='friend').
  //  · friend 카테고리의 '본인행'은 내가 방금 한 행동 확인(수락/취소 등)이라 푸시 X.
  //    상대행(신청자/피초대자)에게만 푸시.
  //  · schedule/submission/service/report/marketing 은 본인이 곧 수신자라 본인행도 푸시.
  //  · 실제 발송 여부는 send-push 가 받는 사람 토글(notif_prefs[category])로 최종 게이팅.
  // void: 호출자(액션 핸들러)가 푸시 응답까지 기다릴 필요 없음.
  if (category !== 'none') {
    for (const row of rows) {
      const isSelf = row.user_code === userCode;
      if (isSelf && category === 'friend') continue; // 본인 액션 confirm — 푸시 X
      void sendPushToUserCode(
        row.user_code as string,
        content.title,
        content.body,
        related,
        category,
      );
    }
  }
}

/**
 * 명시적으로 상대 user_code 의 알림함에 적재 — rule.recipients 무시.
 *
 * 용례: 본인이 'invite_sent'를 자기 이력에 박는 것과 별개로, 초대받은 친구의
 * 알림함에 'invite_received'를 박을 때. 'invite_received'/'friend_request_received'
 * 같은 "받는 사람 본인"용 룰을 발신자가 적재하려면 dispatchMessage는 본인
 * user_code 로 들어가서 의도와 어긋남 — 그래서 별도 함수.
 *
 * params.name 은 통상 발신자 닉네임(상대 화면에서 "{name}이 …" 표기). 호출자가
 * useProfile.id 가 아닌 발신자 정보로 채워서 전달.
 */
export async function dispatchMessageTo(
  toUserCode: string,
  kind: MessageKind,
  params: MessageParams = {},
  related: Record<string, unknown> = {},
): Promise<void> {
  if (!toUserCode) return;
  const snapshotParams: MessageParams = {
    ...params,
    pool: params.pool?.trim() || undefined,
  };
  const content = RULES[kind].build(snapshotParams);
  const category = categoryOf(kind);
  try {
    await supabase.from('notifications').insert({
      user_code: toUserCode,
      kind,
      title: content.title,
      body: content.body,
      params: snapshotParams,
      actions: content.actions ?? [],
      related,
      category,
    });
  } catch {
    /* best-effort */
  }

  // OS 푸시 — dispatchMessageTo 는 정의상 상대(remote=수신자)에게만 가니까,
  // category != 'none' 이면 발송(받는 사람 토글로 send-push 가 최종 게이팅).
  if (category !== 'none') {
    void sendPushToUserCode(
      toUserCode,
      content.title,
      content.body,
      related,
      category,
    );
  }
}
