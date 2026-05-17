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
  | 'welcome'; // 가입 환영

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
};
