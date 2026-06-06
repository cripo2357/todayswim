// Pool's day — 메시지 kind → 알림 카테고리 매핑 (푸시 게이팅 단일 출처).
//
// 알림 설정 화면(NotificationSettingsScreen)의 5개 토글 + 마케팅 + 'none'.
// - 푸시 발송 여부 = 카테고리가 'none'이 아니고, 받는 사람의 해당 토글이 ON일 때.
// - 'none' = 본인 행동 확인(내가 방금 신청/초대/거절함, 가입 환영 등) → 영구 인앱만.
//
// 게이팅 흐름:
//   dispatch.ts(또는 서버 트리거) 가 notifications.category 에 이 값을 적재 →
//   send-push 가 받는 사람 profiles.notif_prefs[category] 확인 후 발송/스킵.
//
// 카테고리 ↔ prefs 토글:
//   friend     → notifFriendInvite      (친구 초대)
//   schedule   → notifScheduleReminder  (예정된 수영 일정)
//   submission → notifSubmissionResult  (정보 수정 요청 및 처리결과)
//   service    → notifServiceAnnounce   (서비스 안내)
//   report     → notifMonthlyReport     (수영 리포트)
//   marketing  → notifMarketing         (광고성 정보, 정통망법 §50 별도 동의)

import type { MessageKind } from './rules';

export type NotifCategory =
  | 'friend'
  | 'schedule'
  | 'submission'
  | 'service'
  | 'report'
  | 'marketing'
  | 'none';

// 카테고리 문자열 = profiles.notif_prefs 의 키와 동일(friend/schedule/...).
// send-push 가 notif_prefs[category] 로 게이팅, marketing 은 fail-closed.

export const MESSAGE_CATEGORY: Record<MessageKind, NotifCategory> = {
  // 친구 초대 — 상대 행동 알림은 푸시, 본인 행동 확인은 none.
  friend_request_received: 'friend',
  friend_request_accepted: 'friend',
  invite_received: 'friend',
  invite_accepted: 'friend',
  invite_canceled: 'friend',
  invite_auto_expired: 'friend',
  friend_request_sent: 'none', // 본인 확인
  friend_request_rejected: 'none', // 본인 확인
  invite_sent: 'none', // 본인 확인
  invite_rejected: 'none', // 본인 확인

  // 예정된 수영 일정
  schedule_reminder_prev_day: 'schedule',
  schedule_reminder_1h: 'schedule',
  friend_schedule_overlap: 'schedule',
  schedule_completion_prompt: 'schedule',

  // 정보 수정 요청 및 처리결과 (비동기 결과 → 푸시 적합)
  pool_submission_approved: 'submission',
  pool_submission_rejected: 'submission',
  schedule_submission_approved: 'submission',
  schedule_submission_rejected: 'submission',

  // 서비스 안내
  terms_updated: 'service',
  app_version_updated: 'service',
  new_feature_announced: 'service',
  nickname_changed_by_admin: 'service',
  welcome: 'none', // 방금 가입 — 푸시 노이즈
  donation_thanks: 'none', // 방금 후원 — 푸시 노이즈

  // 수영 리포트
  monthly_summary: 'report',

  // 마케팅 (§50 동의자만)
  marketing_event: 'marketing',
  marketing_partnership: 'marketing',
  marketing_recommendation: 'marketing',
};

/** 이 kind 가 (카테고리상) 푸시 발송 대상인가. 실제 발송은 받는 사람 토글 ON 추가 조건. */
export function categoryOf(kind: MessageKind): NotifCategory {
  return MESSAGE_CATEGORY[kind] ?? 'none';
}
