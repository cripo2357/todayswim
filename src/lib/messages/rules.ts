// 메시지 발송 Rule 레지스트리 (코드 단일 출처).
//
// Rule = 4요소: 언제(MessageKind 트리거) → 누구에게(recipients) →
// 무슨 문구(build → title/body/actions) → 어떤 액션.
// 정책 추가/수정은 이 파일 한 곳에서. 실제 적재는 dispatchMessage(./dispatch).
//
// 카피·폴백 = docs/notification-triggers-spec-v0.5.md 확정본.
//  - 카피 규칙: 이모지 금지, 과한 높임 제거(~하셨→~했), 종결어미→마침표·
//    명사 끝→마침표 없음, 순서 장소→날짜→시간, 풀→수영장.
//
// 변수 갱신 정책 (v0.6 — 스펙 §변수 갱신 방식)
//  - **{nickname} = 정체성(identity), live lookup + 폴백.**
//    탈퇴/삭제된 사용자는 "[탈퇴 회원]". `nick()` 헬퍼가 폴백을 담당.
//    P2에서는 params.user_id로 user 테이블 lookup → 결과를 params.name에
//    채워 build()를 호출(렌더 시점). P1은 mock string 그대로 사용.
//
//  - **{pool} = 사실 기록(fact-snapshot), 발송 시점 값 보존.**
//    `poolName()`의 "[수영장 정보 없음]" 폴백은 **dispatch 시점**에만 의미
//    있음(그 때도 풀이 없었음). dispatch가 정규화한 문자열을 params에
//    저장하므로, 이후 운영자가 풀명 변경/풀 삭제해도 옛 카드는 옛 이름 유지.
//    build()는 render에서도 호출되지만, params.pool이 이미 snapshot이라
//    poolName() 폴백이 다시 트리거될 일은 없음(빈/공백 방어 가드로만 잔존).
//
// recipients: 이 메시지가 향하는 대상(역할). Phase 1은 'self'(액션을 한
// 로컬 본인) 행만 적재. 'other'/'both' 광역 팬아웃·상태 전이·카드 자동
// 삭제·크론·실제 푸시(FCM/APNS) 발송은 서버 사이드 = Phase 2 (스펙대로).

export type MessageKind =
  | 'friend_request_received' // 나에게 친구 신청이 옴
  | 'friend_request_sent' // 내가 친구 신청을 보냄 (본인 이력) — invite_sent 패턴과 일관
  | 'friend_request_rejected' // 내가 친구 신청을 거절함 (본인 이력)
  | 'friend_request_accepted' // 친구 신청 수락됨 (양측)
  | 'invite_sent' // 내가 수영 일정 초대를 보냄 (본인 이력)
  | 'invite_received' // 나에게 수영 일정 초대가 옴 (상태 1)
  | 'invite_accepted' // 초대 수락 (invite 상태 2)
  | 'invite_rejected' // 초대 거절 (invite 상태 3)
  | 'invite_canceled' // 초대 취소 (invite 상태 4/5)
  | 'invite_auto_expired' // 미응답 72h 자동 만료 (invite 상태 5)
  | 'welcome' // 가입 환영
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
  | 'monthly_summary' // 월간 수영 결산 (8변형)
  | 'schedule_completion_prompt' // 일정 종료 후 완료 확인
  | 'friend_schedule_overlap' // (본인) 내가 등록한 슬롯에 이미 친구가 있음
  | 'friend_joined_my_slot' // (친구) 내 슬롯에 친구가 새로 합류함
  | 'donation_thanks'; // 후원 입금 확인 — 운영자 처리 후 자동 감사 인사

export type MessageRecipient = 'self' | 'other' | 'both';

/** monthly_summary 변형 (스펙 §21 선택 알고리즘 — 서버/크론이 선택, 여기선 렌더만) */
export type MonthlySummaryVariant =
  | 'first_month'
  | 'best_day'
  | 'new_pools'
  | 'with_friends'
  | 'total_hours'
  | 'pattern'
  | 'frequency'
  | 'idle';

export interface MessageParams {
  /** 상대/본인 닉네임 (2~6자). 없거나 탈퇴 → "[탈퇴 회원]" */
  name?: string;
  /** 다수 대상 인원 수 (invite_sent 2명 이상 분기) */
  count?: number;
  /** 수영장 이름. 없거나 삭제 → "[수영장 정보 없음]" */
  pool?: string;
  /** (레거시) 일시 문구 — 신규 트리거는 date/time 사용 */
  when?: string;
  /** 일정 날짜 표현 (예: "5월 28일(수)" / "내일") */
  date?: string;
  /** 일정 시작 시간 (HH:MM). 종료 시간은 본문 미표시 */
  time?: string;
  /** 기능 이름 (new_feature/app_version) */
  featureName?: string;
  /** 앱 버전 (예: "1.2") */
  version?: string;
  /** 변경사항 불릿 (app_version_updated) */
  bullets?: string[];
  /** 약관 시행일 (예: "2026년 6월 5일") */
  effectiveDate?: string;
  /** 운영자가 새로 부여한 닉네임 */
  newNickname?: string;
  /** 사유 (닉네임 강제 변경 등) */
  reason?: string;
  /** 월간 결산 대상 월 (예: "5") */
  month?: string;
  /** 최다 방문 수영장 (monthly frequency). 삭제 → "[수영장 정보 없음]" */
  favoritePool?: string;
  /** 마케팅 제목 / 제휴사명 / 추천 제목 */
  headline?: string;
  /** 마케팅·추천·이벤트 설명 본문 */
  desc?: string;
  /** (레거시) 마케팅 혜택 문구 */
  benefit?: string;
  // ── monthly_summary 변형용 (스펙 §21) ──
  /** monthly_summary 변형 키 (서버/크론이 선택) */
  variant?: MonthlySummaryVariant;
  /** 완료 일정 수 */
  count2?: number;
  /** best_day 날짜 (예: "5월 18일") */
  bestDate?: string;
  /** best_day 분 (예: "90") */
  bestMinutes?: string;
  /** new_pools 신규 방문 수영장 수 */
  newPoolCount?: number;
  /** with_friends 친구 동행 비율(%) */
  percent?: number;
  /** total_hours 누적 수영 시간 */
  totalHours?: string;
  /** pattern 요일 (예: "화요일") */
  weekday?: string;
  /** pattern 시간대 (아침/낮/저녁/밤) */
  timePeriod?: string;
}

export interface MessageContent {
  title: string;
  /** 본문 줄 배열 */
  body: string[];
  /** 알림 카드 액션 버튼 (없으면 표시 안 함 — 패턴 A/E) */
  actions?: string[];
}

interface Rule {
  recipients: MessageRecipient;
  build: (p: MessageParams) => MessageContent;
}

// ── 변수 폴백 헬퍼 (스펙 §변수 갱신 방식) ──
/** {nickname} — identity, live lookup + 폴백.
 *  탈퇴/삭제된 사용자는 "[탈퇴 회원]". P2: dispatch가 params.name을
 *  user_id 기반으로 매번 갱신해 build()에 넘긴다. P1은 mock name 그대로. */
function nick(p: MessageParams): string {
  const n = p.name?.trim();
  return n && n.length > 0 ? n : '[탈퇴 회원]';
}
/** {pool} — fact-snapshot. params.pool은 dispatch 시점 정규화된 문자열.
 *  여기서의 "[수영장 정보 없음]" 폴백은 dispatch가 빈 값을 그대로 박아둔
 *  방어 케이스용(정상 적재 시엔 트리거 안 됨). 풀명 변경/풀 삭제는 옛
 *  카드에 영향 없음 — render는 snapshot 문자열만 사용. */
function poolName(p: MessageParams): string {
  const v = p.pool?.trim();
  return v && v.length > 0 ? v : '[수영장 정보 없음]';
}
/** "장소 날짜 시간" 순서 한 줄 (스펙 §카피 [순서]) — 있는 것만 공백 결합 */
function venueLine(p: MessageParams): string {
  return [poolName(p), p.date, p.time].filter(Boolean).join(' ');
}

export const RULES: Record<MessageKind, Rule> = {
  // ── 유형 1. 사람 발신 ──
  friend_request_received: {
    recipients: 'self',
    build: (p) => ({
      title: '친구 신청',
      body: [`${nick(p)}님이 친구를 신청했어요.`],
      actions: ['거절', '수락'],
    }),
  },
  // 발송자 본인 이력 — invite_sent 와 일관. actions 없음(취소는 별도 경로).
  friend_request_sent: {
    recipients: 'self',
    build: (p) => ({
      title: '친구 신청',
      body: [`${nick(p)}님에게 친구 신청을 보냈어요.`],
    }),
  },
  friend_request_accepted: {
    recipients: 'both',
    build: (p) => ({
      title: '새로운 친구',
      body: [`${nick(p)}님과 친구가 됐어요.`],
    }),
  },
  friend_request_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '친구 신청 거절',
      body: [`${nick(p)}님의 친구 신청을 거절했어요.`],
    }),
  },
  // invite_received = 스펙 상태 1 (받은 직후, 2버튼)
  invite_received: {
    recipients: 'self',
    build: (p) => ({
      title: '수영 일정 초대',
      body: [venueLine(p), `${nick(p)}님이 초대했어요.`],
      actions: ['거절', '수락'],
    }),
  },
  // invite 상태 2 (본인 수락) — 1버튼
  invite_accepted: {
    recipients: 'self',
    build: (p) => ({
      title: '초대 수락',
      body: [
        `${nick(p)}님과 ${p.date ?? ''} 수영 일정에 함께해요.`.replace(
          /\s+/g,
          ' ',
        ),
      ],
      actions: ['일정 보기'],
    }),
  },
  // invite 상태 3 (본인 거절) — 이력
  invite_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '초대 거절',
      body: [
        `${nick(p)}님의 ${p.date ?? ''} 수영 일정 초대를 거절했어요.`.replace(
          /\s+/g,
          ' ',
        ),
      ],
    }),
  },
  // invite 상태 4·5 (취소) — 받은쪽/보낸쪽 공통(자세한 분기는 Phase 2 서버)
  invite_canceled: {
    recipients: 'both',
    build: (p) => ({
      title: '초대 취소',
      body: [
        `${nick(p)}님이 ${p.date ?? ''} 수영 일정 초대를 취소했어요.`.replace(
          /\s+/g,
          ' ',
        ),
      ],
    }),
  },
  // invite 상태 5 (72h 자동 만료) — 받은쪽
  invite_auto_expired: {
    recipients: 'both',
    build: (p) => ({
      title: '초대 만료',
      body: [
        `${nick(p)}님의 ${p.date ?? ''} 수영 일정 초대를 놓쳤어요.`.replace(
          /\s+/g,
          ' ',
        ),
      ],
    }),
  },
  // invite_sent = 스펙 상태 1-A(1명)/1-B(2명+) — 1버튼 [초대 취소]
  invite_sent: {
    recipients: 'self',
    build: (p) => {
      const many = (p.count ?? 0) >= 2;
      const head = many
        ? `${p.count}명에게 수영 일정 초대를 보냈어요.`
        : `${nick(p)}님에게 수영 일정 초대를 보냈어요.`;
      return {
        title: many ? `수영 일정 초대(${p.count}명)` : '수영 일정 초대',
        body: [head, venueLine(p)],
        actions: ['초대 취소'],
      };
    },
  },
  // 본인 알림 — 내가 등록한 슬롯에 이미 친구가 있을 때. count=겹친 친구 수.
  friend_schedule_overlap: {
    recipients: 'self',
    build: (p) => {
      const extra = (p.count ?? 1) - 1;
      const who =
        extra > 0
          ? `${nick(p)}님 외 ${extra}명도 이 시간에 수영해요.`
          : `${nick(p)}님도 이 시간에 수영해요.`;
      return {
        title: '같은 수영 일정',
        body: [venueLine(p), who],
        actions: ['일정 보기'],
      };
    },
  },
  // 친구 알림 — 내 슬롯에 친구(=발신자 본인)가 새로 합류. dispatchMessageTo로 발송.
  friend_joined_my_slot: {
    recipients: 'self',
    build: (p) => ({
      title: '같은 수영 일정',
      body: [venueLine(p), `${nick(p)}님도 이 시간에 수영해요.`],
      actions: ['일정 보기'],
    }),
  },

  // 후원 입금 확인 — 운영자가 donation_payments INSERT → 트리거가 자동 발송.
  // {name} = 입금자 닉네임 스냅샷(트리거가 발송 시점에 박음). 본인 알림함.
  // 액션 '응원글 보기' = NotificationsTab.handleAction이 Donation 화면 navigate.
  // 라벨 톤: '일정 보기', '약관 보기' 와 결 맞춰 '{대상} 보기' 패턴.
  donation_thanks: {
    recipients: 'self',
    build: (p) => ({
      title: '후원 감사 인사',
      body: [
        `${nick(p)}님의 후원이 도착했어요.`,
        "Pool's day 운영에 소중히 쓸게요. 고맙습니다.",
      ],
      actions: ['응원글 보기'],
    }),
  },

  // ── 유형 2. 시스템 안내 ──
  new_feature_announced: {
    recipients: 'self',
    build: (p) => ({
      title: '신규 기능',
      body: [`${p.featureName ?? '새'} 기능이 추가됐어요.`],
      actions: ['보기'],
    }),
  },
  app_version_updated: {
    recipients: 'self',
    build: (p) => ({
      title: p.version ? `v${p.version} 업데이트` : '업데이트',
      body: [
        `${p.featureName ?? '일부'} 기능이 개선됐어요.`,
        ...(p.bullets ?? []).map((b) => `• ${b}`),
      ],
    }),
  },
  pool_submission_approved: {
    recipients: 'self',
    build: (p) => ({
      title: '수영장 추가 승인',
      body: [`${poolName(p)}이 추가됐어요.`],
      actions: ['보기'],
    }),
  },
  pool_submission_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '수영장 추가 거절',
      body: [`${poolName(p)} 제보가 반영되지 않았어요.`],
    }),
  },
  schedule_submission_approved: {
    recipients: 'self',
    build: (p) => ({
      title: '시간표 수정 승인',
      body: [`${poolName(p)} 시간표 제보가 등록됐어요.`],
      actions: ['보기'],
    }),
  },
  schedule_submission_rejected: {
    recipients: 'self',
    build: (p) => ({
      title: '시간표 수정 거절',
      body: [`${poolName(p)} 시간표 제보가 반영되지 않았어요.`],
    }),
  },

  // ── 유형 3. 운영자 발 이벤트 (광고 — 본문/제목 앞 "(광고)" 의무) ──
  marketing_event: {
    recipients: 'self',
    build: (p) => ({
      title: `(광고) ${p.headline ?? '이벤트'}`,
      body: [p.desc ?? '새 이벤트가 열렸어요.'],
      actions: ['참여'],
    }),
  },
  marketing_partnership: {
    recipients: 'self',
    build: (p) => ({
      title: `(광고) ${p.headline ?? '제휴'}와 함께해요`,
      body: [p.desc ?? '제휴 소식을 알려드려요.'],
      actions: ['보기'],
    }),
  },
  marketing_recommendation: {
    recipients: 'self',
    build: (p) => ({
      title: `(광고) ${p.headline ?? '추천'}`,
      body: [p.desc ?? '회원님을 위한 추천을 준비했어요.'],
      actions: ['보기'],
    }),
  },

  // ── 유형 4. 자동·필수 ──
  schedule_reminder_prev_day: {
    recipients: 'self',
    build: (p) => ({
      title: '내일 수영 일정',
      body: [[poolName(p), p.time].filter(Boolean).join(' ')],
    }),
  },
  schedule_reminder_1h: {
    recipients: 'self',
    build: (p) => ({
      title: '곧 수영 일정',
      body: [poolName(p)],
    }),
  },
  terms_updated: {
    recipients: 'self',
    build: (p) => ({
      title: '약관 변경 안내',
      body: [`${p.effectiveDate ?? '예정일'}부터 적용됩니다.`],
      actions: ['약관 보기'],
    }),
  },
  nickname_changed_by_admin: {
    recipients: 'self',
    build: (p) => ({
      title: '닉네임 변경 안내',
      body: [
        `"${p.newNickname ?? ''}"으로 변경됐어요.`,
        ...(p.reason ? [`사유: ${p.reason}`] : []),
        '프로필에서 다시 변경할 수 있어요.',
      ],
    }),
  },

  // ── 유형 5. 환영·축하 ──
  welcome: {
    recipients: 'self',
    build: () => ({
      title: '반가워요',
      body: ["Pool's day에 오신 걸 환영해요.", '가까운 수영장부터 둘러봐요.'],
    }),
  },
  monthly_summary: {
    recipients: 'self',
    build: (p) => {
      const m = p.month ?? '지난';
      const c = p.count2 ?? p.count ?? 0;
      switch (p.variant) {
        case 'first_month':
          return {
            title: "Pool's day 첫 달 리포트",
            body: [`${m}월 첫 수영, ${c}번 다녀왔어요.`],
          };
        case 'best_day':
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [
              `${p.bestDate ?? ''}, ${p.bestMinutes ?? ''}분 수영했어요.`,
              '이번 달 장시간 수영',
            ],
          };
        case 'new_pools':
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [`새 수영장 ${p.newPoolCount ?? 0}곳에 다녀왔어요.`],
          };
        case 'with_friends':
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [`${m}월의 ${p.percent ?? 0}%는 친구와 수영했어요.`],
          };
        case 'total_hours':
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [`${m}월에 ${p.totalHours ?? '0'}시간 수영했어요.`],
          };
        case 'pattern':
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [`${p.weekday ?? ''} ${p.timePeriod ?? ''}마다 수영했네요.`],
          };
        case 'idle':
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [`${m}월엔 한 번도 못 만났네요.`, '가까운 수영장이 기다리고 있어요.'],
            actions: ['근처 수영장 보기'],
          };
        case 'frequency':
        default:
          return {
            title: `${m}월 Pool's day 리포트`,
            body: [
              `${m}월에 ${c}번 다녀왔어요.`,
              `자주 간 수영장: ${p.favoritePool?.trim() || '[수영장 정보 없음]'}`,
            ],
          };
      }
    },
  },
  schedule_completion_prompt: {
    recipients: 'self',
    build: (p) => ({
      title: '오늘 수영 어땠어요?',
      body: [poolName(p)],
      actions: ['못 갔어요', '완료'],
    }),
  },
};
