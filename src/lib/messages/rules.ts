// 메시지 발송 Rule 레지스트리 (코드 단일 출처).
//
// Rule = 4요소: 언제(MessageKind 트리거) → 누구에게(recipients) →
// 무슨 문구(build → title/body/actions) → 어떤 액션.
// 정책 추가/수정은 이 파일 한 곳에서. 실제 적재는 dispatchMessage(./dispatch).
//
// recipients: 이 메시지가 향하는 대상(역할). Phase 1은 'self'(액션을 한
// 로컬 본인) 행만 적재되고, 'other'(상대방) 적재는 서버 사이드 = Phase 2.
// 단, 룰에는 미리 정책으로 선언해 둔다.

export type MessageKind =
  | 'friend_request_received' // 나에게 친구 요청이 옴
  | 'friend_request_rejected' // 내가 친구 요청을 거절함 (본인 기록)
  | 'friend_request_accepted' // 내가 친구 요청을 수락함 (본인 기록)
  | 'invite_sent' // 내가 수영 초대장을 보냄 (본인 기록)
  | 'invite_received' // 나에게 수영 초대가 옴
  | 'invite_accepted' // 상대가 내 초대를 수락 (내게 통지)
  | 'invite_rejected' // 상대가 내 초대를 거절 (내게 통지)
  | 'invite_canceled' // 내가 보낸 초대를 취소함 (본인 기록)
  | 'invite_auto_expired' // 미응답 72h 초과 자동 취소
  | 'welcome' // 가입 환영
  // ── 신규: notification-triggers-spec.md v0.1 (docs/) ──
  // 카피는 v0.1 초안(디자이너·운영자 검토 전). 레지스트리 선언만 —
  // 실제 호출처(크론·운영자 콘솔·서버 디스패치)는 Phase 2.
  | 'new_feature_announced' // 새 기능 출시 안내(운영자)
  | 'app_version_updated' // 앱 버전 업데이트 안내(운영자)
  | 'pool_submission_approved' // 풀 제보 승인
  | 'pool_submission_rejected' // 풀 제보 반려
  | 'schedule_submission_approved' // 시간표 제보 승인
  | 'schedule_submission_rejected' // 시간표 제보 반려
  | 'marketing_event' // (광고) 이벤트
  | 'marketing_partnership' // (광고) 제휴
  | 'marketing_recommendation' // (광고) 개인화 추천
  | 'schedule_reminder_prev_day' // 일정 전날 20:00 리마인더
  | 'schedule_reminder_1h' // 일정 1시간 전 리마인더
  | 'terms_updated' // 약관 개정 안내(법정·P0)
  | 'nickname_changed_by_admin' // 운영자 닉네임 강제 변경(P0)
  | 'monthly_summary' // 월간 수영 결산
  | 'schedule_completion_prompt' // 일정 종료 후 완료 확인
  | 'friend_schedule_overlap'; // 같은 풀+시간 친구 일정 겹침

export type MessageRecipient = 'self' | 'other' | 'both';

export interface MessageParams {
  /** 상대 표시 이름 (요청자/초대 대상 등) */
  name?: string;
  /** 다수 대상일 때 인원 수 */
  count?: number;
  /** 수영장 이름 */
  pool?: string;
  /** 일시 문구 (예: "26.08.21 오후 4:00") */
  when?: string;
  // ── 신규 트리거용 변수 (notification-triggers-spec.md v0.1) ──
  /** 일정 날짜 표현 (예: "5월 28일(수)" / "내일") */
  date?: string;
  /** 일정 시간 (예: "19:00") */
  time?: string;
  /** 기능 이름 (new_feature_announced / app_version_updated) */
  featureName?: string;
  /** 앱 버전 (예: "1.2") */
  version?: string;
  /** 변경사항 불릿 (app_version_updated) */
  bullets?: string[];
  /** 약관 시행일 (예: "2026년 6월 5일") */
  effectiveDate?: string;
  /** 운영자가 새로 부여한 닉네임 (nickname_changed_by_admin) */
  newNickname?: string;
  /** 사유 (닉네임 강제 변경 등) */
  reason?: string;
  /** 월간 결산 대상 월 (예: "4") */
  month?: string;
  /** 최다 방문 풀 (monthly_summary) */
  favoritePool?: string;
  /** 마케팅 제목 / 제휴사명 / 추천 제목 */
  headline?: string;
  /** 마케팅·추천 설명 본문 */
  desc?: string;
  /** 마케팅 혜택 문구 (marketing_event) */
  benefit?: string;
}

export interface MessageContent {
  title: string;
  /** 본문 줄 배열 */
  body: string[];
  /** 알림 카드 액션 버튼 (없으면 표시 안 함) */
  actions?: string[];
}

interface Rule {
  recipients: MessageRecipient;
  build: (p: MessageParams) => MessageContent;
}

/** "[수영장] 일시" 보조 줄 (pool/when 둘 다 있을 때만) */
function venueLine(p: MessageParams): string[] {
  if (p.pool && p.when) return [`[${p.pool}] ${p.when}`];
  if (p.pool) return [`[${p.pool}]`];
  return [];
}
/** 대상 표기 — name 우선, 없으면 "N명" */
function who(p: MessageParams): string {
  if (p.name) return `${p.name}님`;
  if (p.count && p.count > 0) return `${p.count}명`;
  return '상대';
}

export const RULES: Record<MessageKind, Rule> = {
  friend_request_received: {
    recipients: 'self',
    build: (p) => ({
      title: '친구 추가',
      body: [`${who(p)}이 친구가 되고 싶어합니다.`, '서로 친구로 추가하겠습니까?'],
      actions: ['거절', '수락'],
    }),
  },
  friend_request_rejected: {
    recipients: 'both',
    build: (p) => ({
      title: '친구 추가 거절',
      body: [`${who(p)}의 친구 요청을 거절했습니다.`],
    }),
  },
  friend_request_accepted: {
    recipients: 'both',
    build: (p) => ({
      title: '친구 추가 완료',
      body: [`${who(p)}과 친구가 되었습니다.`],
    }),
  },
  invite_sent: {
    recipients: 'self',
    build: (p) => ({
      title: '수영 초대장',
      body: [`${who(p)}에게 초대장을 보냈습니다.`, ...venueLine(p)],
      actions: ['초대 취소'],
    }),
  },
  invite_received: {
    recipients: 'self',
    build: (p) => ({
      title: '수영 일정 초대',
      body: [
        `${who(p)}이 초대장을 보냈습니다.`,
        ...venueLine(p),
        '초대를 수락하겠습니까?',
      ],
      actions: ['거절', '수락'],
    }),
  },
  invite_accepted: {
    recipients: 'self',
    build: (p) => ({
      title: '초대 수락',
      body: [`${who(p)}이 내 초대를 수락했습니다.`, ...venueLine(p)],
    }),
  },
  invite_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '초대 거절',
      body: [`${who(p)}이 내 초대를 거절했습니다.`, ...venueLine(p)],
    }),
  },
  invite_canceled: {
    recipients: 'both',
    build: (p) => ({
      title: '초대 취소',
      body: [`${who(p)}에게 보낸 초대를 취소했습니다.`, ...venueLine(p)],
    }),
  },
  invite_auto_expired: {
    recipients: 'both',
    build: (p) => ({
      title: '초대 자동 취소',
      body: [
        '초대를 보낸지 72시간이 초과되어 초대가 자동 취소되었습니다.',
        ...venueLine(p),
      ],
    }),
  },
  welcome: {
    recipients: 'self',
    build: () => ({
      title: 'Everyday is Pool’s day',
      body: ['오늘부터 풀스데이와 함께 수영해요.'],
    }),
  },

  // ──────────────────────────────────────────────────────────────
  // 신규 트리거 (notification-triggers-spec.md v0.1)
  //
  // 카피는 v0.1 초안 — 디자이너·운영자 검토 후 확정. 모델은 현행 유지
  // (recipients/title/body/actions)이므로 스펙의 우선순위·채널·푸시 전용
  // 본문·끌수있음 등 메타데이터는 여기 담지 않는다(상세는 docs/ 스펙).
  // 액션 패턴 매핑: A→actions 없음, B→1버튼, C→2버튼, E→actions 없음.
  // 수신자: 운영자·시스템·크론 발 → 전부 "대상 회원 본인 행"이라 'self'.
  // 광역 팬아웃/양측 적재는 Phase 2 서버 디스패치.
  // ──────────────────────────────────────────────────────────────

  new_feature_announced: {
    recipients: 'self',
    build: (p) => ({
      title: '새 기능이 나왔어요',
      body: [`${p.featureName ?? '새'} 기능이 새로 추가됐어요. 지금 확인해보세요!`],
      actions: ['확인하러 가기'],
    }),
  },
  app_version_updated: {
    recipients: 'self',
    build: (p) => ({
      title: p.version ? `v${p.version} 업데이트` : '앱이 업데이트됐어요',
      body: [
        `${p.featureName ?? '일부'} 기능이 개선됐어요`,
        ...(p.bullets ?? []).map((b) => `• ${b}`),
      ],
    }),
  },
  pool_submission_approved: {
    recipients: 'self',
    build: (p) => ({
      title: '제보해주신 수영장이 등록됐어요!',
      body: [
        `${p.pool ?? '제보하신 수영장'} 정보가 Pool’s Day에 추가됐어요. 함께 만들어가요 🏊`,
      ],
      actions: ['수영장 보러 가기'],
    }),
  },
  pool_submission_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '제보 검토 결과를 알려드려요',
      body: [
        `${p.pool ?? '제보하신 수영장'} 제보가 이번엔 반영되지 않았어요.`,
        '소중한 의견 감사해요. 다음에 또 알려주세요.',
      ],
    }),
  },
  schedule_submission_approved: {
    recipients: 'self',
    build: (p) => ({
      title: '시간표 제보가 등록됐어요!',
      body: [`${p.pool ?? '제보하신 수영장'}의 자유수영 시간표가 업데이트됐어요 🏊`],
      actions: ['시간표 보러 가기'],
    }),
  },
  schedule_submission_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '시간표 제보 검토 결과를 알려드려요',
      body: [
        `${p.pool ?? '제보하신 수영장'} 시간표 제보가 이번엔 반영되지 않았어요.`,
        '소중한 의견 감사해요.',
      ],
    }),
  },
  marketing_event: {
    recipients: 'self',
    build: (p) => ({
      title: `(광고) ${p.headline ?? '이벤트'}`,
      body: [
        ...(p.desc ? [p.desc] : []),
        ...(p.benefit ? [`지금 참여하면 ${p.benefit}을 받을 수 있어요!`] : []),
        ...(!p.desc && !p.benefit ? ['새 이벤트가 열렸어요.'] : []),
      ],
      actions: ['이벤트로 이동'],
    }),
  },
  marketing_partnership: {
    recipients: 'self',
    build: (p) => ({
      title: `(광고) ${p.headline ?? '제휴'}와 함께해요`,
      body: [p.desc ?? '제휴 소식을 알려드려요.'],
      actions: ['자세히 보기'],
    }),
  },
  marketing_recommendation: {
    recipients: 'self',
    build: (p) => ({
      title: `(광고) ${p.headline ?? '추천'}`,
      body: [p.desc ?? '회원님을 위한 추천을 준비했어요.'],
      actions: ['보러 가기'],
    }),
  },
  schedule_reminder_prev_day: {
    recipients: 'self',
    build: (p) => ({
      title: '내일 수영 일정이 있어요',
      body: [
        `내일 ${p.time ? `${p.time} ` : ''}${p.pool ?? '수영장'}에서 수영 예정이에요 🏊`,
        '준비물 잘 챙기세요!',
      ],
    }),
  },
  schedule_reminder_1h: {
    recipients: 'self',
    build: (p) => ({
      title: '곧 수영이에요',
      body: [`1시간 후 ${p.pool ?? '수영장'}에서 수영이에요. 준비됐어요? 🏊`],
    }),
  },
  terms_updated: {
    recipients: 'self',
    build: (p) => ({
      title: '약관이 변경됩니다',
      body: [
        `${p.effectiveDate ?? '예정일'}부터 적용되는 약관 변경 사항을 안내드려요.`,
        '변경 내용을 확인하시고 동의 여부를 선택해주세요.',
      ],
      actions: ['약관 보기'],
    }),
  },
  nickname_changed_by_admin: {
    recipients: 'self',
    build: (p) => ({
      title: '닉네임이 변경되었어요',
      body: [
        `회원님의 닉네임이 운영진에 의해 “${p.newNickname ?? ''}”으로 변경되었어요.`,
        ...(p.reason ? [`이유: ${p.reason}`] : []),
        '프로필에서 새 닉네임을 확인하고, 원하시면 다시 변경하실 수 있어요.',
      ],
    }),
  },
  monthly_summary: {
    recipients: 'self',
    build: (p) => ({
      title: `${p.month ?? '지난'}월 수영 결산이 도착했어요`,
      body: [
        `${p.month ?? '지난'}월에 ${p.count ?? 0}번 풀에 다녀오셨네요!`,
        ...(p.favoritePool ? [`${p.favoritePool}을 가장 많이 찾으셨어요.`] : []),
        '이번 달도 시원하게 헤엄쳐봐요 🏊',
      ],
      actions: ['내 기록 보기'],
    }),
  },
  schedule_completion_prompt: {
    recipients: 'self',
    build: (p) => ({
      title: '오늘 수영 어땠어요?',
      body: [`${p.pool ?? '오늘 그 수영장'}에서 수영 잘 다녀오셨나요?`],
      actions: ['못 갔어요', '완료!'],
    }),
  },
  friend_schedule_overlap: {
    recipients: 'self',
    build: (p) => ({
      title: `${who(p)}도 같은 시간에 수영해요!`,
      body: [
        `${[p.date, p.time].filter(Boolean).join(' ')} ${p.pool ?? '같은 수영장'}에서 ${who(p)}도 수영 일정이 있어요.`,
        '함께 만나면 어때요? 🏊',
      ],
      actions: [`${who(p)}께 인사하기`],
    }),
  },
};
