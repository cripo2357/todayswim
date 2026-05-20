// 내 정보 > 알림 탭 — Figma 134:9643 카드 UI.
//
// P2(2026-05-20~) 진입: useNotifications로 실 수신함 데이터 우선 표시.
// 서버 0건이면 mock 샘플 갤러리 폴백(데모/검증 매끄러움, useOtherSchedules
// 동일 패턴). 즉:
//   - 가입 직후·아무 액션 없음 → mock 갤러리 그대로(스펙 22트리거 미리보기)
//   - 액션 발생(친구 거절·초대 발송 등) → 실 row가 들어와 자동 전환
//
// 이미지(슬롯) — 스펙 "이미지 매핑" 그대로:
//   상대 행동 트리거 → 프로필 사진(번들 아바타 샘플)
//   본인 행동 / 시스템 / 다수 / 환영 등 → 명명 아이콘 (프로젝트 SVG 우선,
//                                              없는 것만 lucide 폴백)
// 카피는 lib/messages/rules.RULES 단일출처 — 서버 row의 title/body도 발송
// 시점에 RULES.build로 계산해 적재됐으므로 mock과 동일 형식.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SvgProps } from 'react-native-svg';
import { X, Check, ChevronRight } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { RULES, type MessageKind, type MessageParams } from '@/lib/messages/rules';
import { BUNDLE_AVATARS, type AvatarId } from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { RejectScheduleInviteModal } from '@/components/schedule/RejectScheduleInviteModal';
import { CancelScheduleInviteModal } from '@/components/schedule/CancelScheduleInviteModal';
import { useNotifications, type NotificationRow } from '@/hooks/useNotifications';
import { formatDateTime } from '@/lib/dateFormat';

// 프로젝트 SVG 아이콘 — 전부 announcement/ 회색톤(#1F2937)으로 통일.
// 알림 전용 사본(설정 메뉴 등 원본은 자기 색 유지 — sed로 fill만 치환한 복제).
import IconNewFeature from '@assets/icons/announcement/new-feature.svg';
import IconFeatureUpdate from '@assets/icons/announcement/feature-update.svg';
import IconEvent from '@assets/icons/announcement/event.svg';
import IconApproved from '@assets/icons/announcement/approved.svg'; // [승인]
import IconReport from '@assets/icons/announcement/report.svg'; // [리포트]
import IconInvite from '@assets/icons/announcement/invite.svg'; // [초대]
import IconRejected from '@assets/icons/announcement/rejected.svg'; // [반려]
import IconTerms from '@assets/icons/announcement/terms.svg'; // [약관]
import IconProfile from '@assets/icons/announcement/profile.svg'; // [프로필]
import IconReminder from '@assets/icons/announcement/reminder.svg'; // [리마인더]
import IconSwim from '@assets/icons/announcement/swim.svg'; // [수영]
import IconSchedule from '@assets/icons/announcement/schedule.svg'; // [시간표]
import IconWelcome from '@assets/icons/announcement/welcome.svg'; // [환영]
// 후원 감사 알림 — settings/piggy-bank 재사용(베이크 색은 #63CBE8 pdMint이라
// announcement 회색톤과 약간 다르지만 후원 슬롯 단일 자원 통일).
import IconPiggyBankSlot from '@assets/icons/settings/piggy-bank.svg';

type SvgIconCmp = React.FC<SvgProps>;

/** 카드 좌측 슬롯 — 프로필 사진 또는 명명 아이콘 (스펙 이미지 매핑).
 *  아바타 rel = profile_border_policy: 나=pd-byellow/친구=pd-mint/비친구=pd-gray.
 *  ⚠️ rel은 트리거 유형별 고정(REL_BY_KIND) — 런타임 친구목록 조회 X.
 *  트리거 자체가 발송 시점의 관계를 함축하므로, 시간이 흘러 관계가 바뀌어도
 *  카드는 그 시점의 관계를 보존(예: friend_request_received는 영구적으로
 *  '비친구' 테두리 — 그때 비친구였음의 기록). v0.6 정책. */
type AvatarRel = 'me' | 'friend' | 'stranger';
type Slot =
  | { type: 'avatar'; id: AvatarId }
  | { type: 'icon'; render: () => React.ReactNode };

interface Notif {
  id: string;
  /** 버튼/탭 액션 디스패치에 필요(handleAction/handleCardTap). */
  kind: MessageKind;
  slot: Slot;
  /** avatar slot일 때만 — relFor(kind)로 계산된 발송 시점 관계. */
  rel?: AvatarRel;
  title: string;
  time: string;
  lines: string[];
  actions?: string[];
  /** 확인 모달(거절/취소)에서 상대 표시명으로 사용 — params.name 그대로 전달. */
  name?: string;
}

interface SampleSpec {
  id: string;
  kind: MessageKind;
  params: MessageParams;
  slot: Slot;
}

// 슬롯 헬퍼
const svg = (Cmp: SvgIconCmp): Slot => ({
  type: 'icon',
  render: () => <Cmp width={20} height={20} />,
});
const lucide = (Cmp: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>): Slot => ({
  type: 'icon',
  render: () => <Cmp size={20} color="#4B5563" strokeWidth={2} />,
});
const avatar = (id: AvatarId): Slot => ({ type: 'avatar', id });

// 트리거 유형 → 발송 시점 관계 (테두리 색의 단일 출처). 누락 = 'friend' 기본.
// 트리거가 곧 관계를 함축 — 시간 지나도 그 시점 관계 보존.
const REL_BY_KIND: Partial<Record<MessageKind, AvatarRel>> = {
  friend_request_received: 'stranger', // 신청자 = 아직 친구 아님
  // friend_request_accepted: 'friend' (기본) — 방금 친구 됨
  // invite_received: 'friend' (기본) — 이미 친구라 초대받음
  // friend_schedule_overlap: 'friend' (기본) — 친구 일정 겹침
};
const relFor = (kind: MessageKind): AvatarRel => REL_BY_KIND[kind] ?? 'friend';

// 명명 아이콘 (스펙) → 프로젝트 SVG 슬롯 (재사용 편의)
const SLOT_INVITE = svg(IconInvite); // [초대]
const SLOT_REJECT = svg(IconRejected); // [반려]
const SLOT_NEW_FEATURE = svg(IconNewFeature); // [신기능]
const SLOT_VERSION_UP = svg(IconFeatureUpdate); // [업데이트]
const SLOT_SCHEDULE = svg(IconSchedule); // [시간표]
const SLOT_REMINDER = svg(IconReminder); // [리마인더]
const SLOT_TERMS = svg(IconTerms); // [약관]
const SLOT_PROFILE = svg(IconProfile); // [프로필]
const SLOT_WELCOME = svg(IconWelcome); // [환영]
const SLOT_SWIM = svg(IconSwim); // [수영]
const SLOT_EVENT = svg(IconEvent); // [이벤트] (marketing 3종 모두 — 스펙)
const SLOT_APPROVED = svg(IconApproved); // [승인]
const SLOT_REPORT = svg(IconReport); // [리포트]
const SLOT_DONATION_THANKS = svg(IconPiggyBankSlot); // [후원 감사]

// 공통 샘플 변수 (v0.5 어휘 + v0.6 통일 날짜·시각 포맷)
// 날짜·시각은 앱 전역 단일 포맷(YY.MM.DD(요일) 오전/오후 H:MM) — @/lib/dateFormat.
const P = '강남 스포츠센터';
const NM = '강두형';
const D = '26.05.28(목)';
const T = '오후 7:00';

// Figma 134:9643 — 최근/이전 2단 구성. 샘플 갤러리 분배 기준:
//   최근 = 사람 발신·시스템 안내·광고·자동필수 (active feed 성격)
//   이전 = 환영·월간 결산 (회고/단발성)
// 제외: schedule_completion_prompt — 스펙상 "푸시만(인앱은 일정 카드
//   자체에 완료 체크 UI)" → 인앱 알림 피드 미적재.
const GROUPS: { title: string; items: SampleSpec[] }[] = [
  {
    title: '최근',
    items: [
      // ── 유형 1. 사람 발신 ──
      // 상대 행동 → 프로필 사진 (테두리 색은 relFor(kind) 자동 결정)
      { id: 's1', kind: 'friend_request_received', slot: avatar('avatar-male-1'), params: { name: NM } },
      { id: 's2', kind: 'friend_request_accepted', slot: avatar('avatar-female-2'), params: { name: NM } },
      // 부정 성격(거절·취소·만료) → [반려] 아이콘으로 통일 (정책)
      { id: 's3', kind: 'friend_request_rejected', slot: SLOT_REJECT, params: { name: NM } },
      // 초대 받은 직후 → 초대자 프로필 (테두리: relFor 자동 = 친구)
      { id: 's4', kind: 'invite_received', slot: avatar('avatar-male-3'), params: { name: NM, pool: P, date: D, time: T } },
      // 본인 수락 → [초대] 아이콘 (긍정)
      { id: 's5', kind: 'invite_accepted', slot: SLOT_INVITE, params: { name: NM, date: D } },
      // 본인 거절 → [반려] 아이콘 (부정 통일)
      { id: 's6', kind: 'invite_rejected', slot: SLOT_REJECT, params: { name: NM, date: D } },
      // 상대가 취소 → [반려] 아이콘 (부정 통일)
      { id: 's7', kind: 'invite_canceled', slot: SLOT_REJECT, params: { name: NM, date: D } },
      // 시스템 만료(놓침) → [반려] 아이콘 (부정 통일)
      { id: 's8', kind: 'invite_auto_expired', slot: SLOT_REJECT, params: { name: NM, date: D } },
      // 본인 발송(1명/2명+) → [초대] 아이콘
      { id: 's9', kind: 'invite_sent', slot: SLOT_INVITE, params: { name: NM, pool: P, date: D, time: T } },
      { id: 's10', kind: 'invite_sent', slot: SLOT_INVITE, params: { count: 3, pool: P, date: D, time: T } },
      // 친구 일정 겹침 → 친구 프로필
      { id: 's11', kind: 'friend_schedule_overlap', slot: avatar('avatar-female-3'), params: { name: NM, pool: P, date: D, time: T } },

      // ── 유형 2. 시스템 안내 ──
      { id: 's12', kind: 'new_feature_announced', slot: SLOT_NEW_FEATURE, params: { featureName: '수영 번개모임' } },
      { id: 's13', kind: 'app_version_updated', slot: SLOT_VERSION_UP, params: { version: '1.2', featureName: '지도', bullets: ['지도 클러스터 개선', '시간표 시즌 표시'] } },
      { id: 's14', kind: 'pool_submission_approved', slot: SLOT_APPROVED, params: { pool: P } },
      { id: 's15', kind: 'pool_submission_rejected', slot: SLOT_REJECT, params: { pool: P } },
      { id: 's16', kind: 'schedule_submission_approved', slot: SLOT_SCHEDULE, params: { pool: P } },
      { id: 's17', kind: 'schedule_submission_rejected', slot: SLOT_REJECT, params: { pool: P } },

      // ── 유형 3. 운영자 발 이벤트 (광고) ──
      { id: 's18', kind: 'marketing_event', slot: SLOT_EVENT, params: { headline: '여름 수영 챌린지', desc: '7월 한 달 매일 수영 인증하고 굿즈 받아요.' } },
      { id: 's19', kind: 'marketing_partnership', slot: SLOT_EVENT, params: { headline: '○○스포츠', desc: '제휴 수영용품 할인 소식을 알려드려요.' } },
      { id: 's20', kind: 'marketing_recommendation', slot: SLOT_EVENT, params: { headline: '근처 새 수영장', desc: '회원님 동선에 맞는 수영장을 추천해요.' } },

      // ── 유형 4. 자동·필수 (schedule_completion_prompt 제외 — 인앱 피드 미적재) ──
      { id: 's21', kind: 'schedule_reminder_prev_day', slot: SLOT_REMINDER, params: { pool: P, time: T } },
      { id: 's22', kind: 'schedule_reminder_1h', slot: SLOT_REMINDER, params: { pool: P } },
      { id: 's23', kind: 'terms_updated', slot: SLOT_TERMS, params: { effectiveDate: '2026년 6월 5일' } },
      { id: 's24', kind: 'nickname_changed_by_admin', slot: SLOT_PROFILE, params: { newNickname: '물개수영', reason: '부적절한 표현' } },
      // 후원 감사 — 운영자가 donation_payments INSERT 시 트리거가 자동 발송(0070).
      { id: 's27', kind: 'donation_thanks', slot: SLOT_DONATION_THANKS, params: { name: NM } },

      // ── 변수 폴백(별도 그룹 X, 평소 케이스에 섞임) ──
      // friend_request_accepted with no name → "[탈퇴 회원]"
      { id: 's25', kind: 'friend_request_accepted', slot: avatar('avatar-male-5'), params: {} },
      // invite_received with no pool → "[수영장 정보 없음]"
      { id: 's26', kind: 'invite_received', slot: avatar('avatar-female-5'), params: { name: NM, date: D, time: T } },
    ],
  },
  {
    title: '이전',
    items: [
      // 환영 (가입 직후 1회) + 월간 결산 8변형 (회고형)
      { id: 'p1', kind: 'welcome', slot: SLOT_WELCOME, params: {} },
      { id: 'p2', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'first_month', month: '5', count2: 3 } },
      { id: 'p3', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'best_day', month: '5', bestDate: '5월 18일', bestMinutes: '90' } },
      { id: 'p4', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'new_pools', month: '5', newPoolCount: 3 } },
      { id: 'p5', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'with_friends', month: '5', percent: 60 } },
      { id: 'p6', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'total_hours', month: '5', totalHours: '12' } },
      { id: 'p7', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'pattern', month: '5', weekday: '화요일', timePeriod: '저녁' } },
      { id: 'p8', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'frequency', month: '5', count2: 8, favoritePool: P } },
      { id: 'p9', kind: 'monthly_summary', slot: SLOT_REPORT, params: { variant: 'idle', month: '5' } },
    ],
  },
];

// 샘플 갤러리라 공통 표기 시각 1개 (실제 적재 시 발송 시각으로 대체).
// 앱 전역 통일 포맷 — YY.MM.DD(요일) 오전/오후 H:MM.
const SAMPLE_TIME = '26.05.20(수) 오후 2:00';

function toNotif(s: SampleSpec): Notif {
  const c = RULES[s.kind].build(s.params);
  return {
    id: s.id,
    kind: s.kind,
    slot: s.slot,
    rel: s.slot.type === 'avatar' ? relFor(s.kind) : undefined,
    title: c.title,
    time: SAMPLE_TIME,
    lines: c.body.filter((l) => l.length > 0),
    actions: c.actions && c.actions.length > 0 ? c.actions : undefined,
    name: s.params.name,
  };
}

// 패턴 E (이력 표시 — 탭 동작 없음). 패턴 A(탭→이동), B(1버튼), C(2버튼)
// 와 구분하기 위해 명시적 화이트리스트(스펙 액션 패턴 요약 기준).
const E_TRIGGERS: Set<MessageKind> = new Set([
  'friend_request_rejected',
  'invite_rejected',
  'invite_canceled',
  'invite_auto_expired',
]);

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Phase 2 dead-link 가드용 메타 — notifications.related의 부분 형태.
 *  여기서는 mock이라 항상 undefined를 받고 가드는 결정만 시연한다.
 *  실 적재 시 dispatch가 채워주는 ID 참조(scheduleId/poolId/senderUserId/termsKey)를
 *  체크해 dead-link면 토스트만 띄우고 navigate 차단(스펙 §데이터 삭제·변경 대비 정책 6). */
interface DeadLinkMeta {
  scheduleAlive?: boolean; // 일정 살아있나
  poolAlive?: boolean; // 풀 살아있나
  senderAlive?: boolean; // 발신자/신청자 살아있나
  termsKeyValid?: boolean; // 약관 키 유효한가
}

/**
 * 버튼 액션 디스패치 — 스펙 §버튼 액션 정책 기준.
 * 샘플 갤러리는 mock 데이터라 상태 변경은 Alert 피드백, 이동은 실 navigation.
 * dead-link 가드(P2 정책): 액션 대상 entity가 살아있는지 확인 → 없으면 토스트.
 */
function handleAction(
  navigation: Nav,
  kind: MessageKind,
  label: string,
  meta: DeadLinkMeta = {},
) {
  // === 응답형(C 2버튼) — 상태 변경. 샘플: Alert 피드백 ===
  if (kind === 'friend_request_received') {
    // 신청자가 탈퇴했을 수 있음 — meta.senderAlive 가드 (스펙 §6, P2).
    if (meta.senderAlive === false) {
      return Alert.alert('[탈퇴 회원]의 신청은 만료됐어요', '카드는 자동 정리됩니다.');
    }
    if (label === '수락')
      return Alert.alert('친구 추가됨', '실 운영 시 친구 추가 + 양측 알림 발송.');
    if (label === '거절')
      return Alert.alert('친구 신청 거절', '실 운영 시 본인 이력만 기록. 상대 무알림.');
  }
  if (kind === 'invite_received') {
    // 일정 자체가 삭제됐을 수 있음 — meta.scheduleAlive 가드.
    if (meta.scheduleAlive === false) {
      return Alert.alert('삭제된 일정입니다', '카드는 자동 정리됩니다.');
    }
    if (label === '수락')
      return Alert.alert('초대 수락', '실 운영 시 일정 참여 + 발신자에게 알림.');
    // '거절'은 RejectScheduleInviteModal에서 처리(NotifCard.onActionPress 분기).
  }
  // '초대 취소'는 CancelScheduleInviteModal에서 처리(NotifCard.onActionPress 분기).
  // === 이동 액션 (B 1버튼 — 이동 강조) ===
  if (label === '약관 보기') {
    if (meta.termsKeyValid === false) {
      return Alert.alert('약관 키가 변경됐어요', '약관 목록으로 이동합니다.');
    }
    return navigation.navigate('TermsDetail', { termsKey: 'service' });
  }
  if (label === '일정 보기') {
    if (meta.scheduleAlive === false) {
      return Alert.alert('삭제된 일정입니다', '');
    }
    // 실 운영 시 ScheduleView(일정 id). 샘플은 mock id 없어 MyInfo로 안전 이동.
    return navigation.navigate('MyInfo');
  }
  if (label === '보기' || label === '근처 수영장 보기') {
    // "보기" = 풀 보기일 때 dead-link 가드 (pool_submission_approved 등).
    if (meta.poolAlive === false) {
      return Alert.alert('삭제된 수영장입니다', '');
    }
    return navigation.navigate('MapMain');
  }
  // 후원 감사 → 본인 응원글로 이동 (Donation 화면). 본인 카드는 dedup으로 최상단 노출.
  if (label === '내 응원글 보기' && kind === 'donation_thanks') {
    return navigation.navigate('Donation');
  }
  // 광고(참여) 등 미정 — Phase 2
}

/**
 * 카드 탭 동작(액션 패턴 A) — 버튼 없는 카드의 탭 시 이동.
 * E 트리거(이력)는 cardTappable=false라 호출되지 않음.
 * dead-link 가드: navigate 전 entity 존재 확인 (스펙 §6 정책 가이드).
 */
function handleCardTap(navigation: Nav, kind: MessageKind, meta: DeadLinkMeta = {}) {
  // 친구/프로필 관련 → MyInfo (실 운영 시 OtherUserProfile / 프로필탭)
  if (kind === 'friend_request_accepted' || kind === 'nickname_changed_by_admin') {
    if (meta.senderAlive === false) {
      return Alert.alert('탈퇴한 회원입니다', '');
    }
    return navigation.navigate('MyInfo');
  }
  // 일정 리마인더 → MyInfo (실 운영 시 ScheduleView with id)
  if (kind === 'schedule_reminder_prev_day' || kind === 'schedule_reminder_1h') {
    if (meta.scheduleAlive === false) {
      return Alert.alert('삭제된 일정입니다', '');
    }
    return navigation.navigate('MyInfo');
  }
  // 환영·결산 → MapMain
  if (kind === 'welcome' || kind === 'monthly_summary')
    return navigation.navigate('MapMain');
  // 정보형(앱 업데이트·제보 반려 등) — 탭 대상 미정, no-op
}

// 샘플 갤러리는 '읽지 않음' 개념 없음 — 빨간 배지 미노출.
export const UNREAD_SEED = 0;

const ACTION_ICON = (label: string): React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> => {
  if (label === '수락' || label === '완료') return Check;
  if (label === '거절' || label === '못 갔어요' || label === '초대 취소') return X;
  return ChevronRight; // 일정 보기 / 보기 / 참여 / 약관 보기 / 근처 수영장 보기 등 이동형
};

// 서버 row의 kind→slot 매핑 — mock GROUPS의 첫 등장 slot을 재사용.
// (avatar slot의 경우 mock의 default 아바타가 들어감 — 추후 row.related에
//  senderAvatar/senderUserId 박아 profiles lookup으로 갱신 가능. P2 첫 단계
//  단순화: kind만 알면 default slot 결정.)
const KIND_TO_SLOT: Map<MessageKind, Slot> = (() => {
  const m = new Map<MessageKind, Slot>();
  for (const g of GROUPS) {
    for (const s of g.items) {
      if (!m.has(s.kind)) m.set(s.kind, s.slot);
    }
  }
  return m;
})();

function rowToNotif(row: NotificationRow): Notif {
  const slot: Slot = KIND_TO_SLOT.get(row.kind) ?? lucide(ChevronRight);
  return {
    id: row.id,
    kind: row.kind,
    slot,
    rel: slot.type === 'avatar' ? relFor(row.kind) : undefined,
    title: row.title,
    // 통일 포맷 YY.MM.DD(요일) 오전/오후 H:MM (앱 전역, @/lib/dateFormat).
    time: formatDateTime(row.created_at),
    lines: (row.body ?? []).filter((l) => l.length > 0),
    actions: row.actions && row.actions.length > 0 ? row.actions : undefined,
    name: row.params?.name,
  };
}

export function NotificationsTab() {
  const { rows } = useNotifications();
  // 서버 row가 있으면 단일 "최근" 그룹으로 통합(시간 정렬은 fetch에서 desc).
  // 0건 → mock 갤러리 폴백(가입 직후·검증 매끄러움).
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {rows.length > 0 ? (
        <Group title="최근" items={rows.map(rowToNotif)} />
      ) : (
        GROUPS.map((g) => (
          <Group key={g.title} title={g.title} items={g.items.map(toNotif)} />
        ))
      )}
    </ScrollView>
  );
}

function Group({ title, items }: { title: string; items: Notif[] }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.list}>
        {items.map((n) => (
          <NotifCard key={n.id} notif={n} />
        ))}
      </View>
    </View>
  );
}

// 관계별 테두리 색 (profile_border_policy)
const REL_BORDER: Record<AvatarRel, string> = {
  me: tokens.color.pdByellow,
  friend: tokens.color.pdMint,
  stranger: tokens.color.pdGray,
};

function NotifSlot({ slot, rel }: { slot: Slot; rel?: AvatarRel }) {
  if (slot.type === 'avatar') {
    const Avatar = BUNDLE_AVATARS[slot.id];
    return (
      <View style={[styles.avatarWrap, { borderColor: REL_BORDER[rel ?? 'friend'] }]}>
        <Avatar width={40} height={40} />
      </View>
    );
  }
  return <View style={styles.iconCircle}>{slot.render()}</View>;
}

function NotifCard({ notif }: { notif: Notif }) {
  const navigation = useNavigation<Nav>();
  // 패턴 A(탭→이동) = 버튼 없고 E 트리거도 아닌 카드.
  const cardTappable = !notif.actions && !E_TRIGGERS.has(notif.kind);

  // 확인 모달 — invite_received '거절' / invite_sent '초대 취소'.
  // Alert.alert 대신 디자인된 모달(Figma 228:3787 / 230:4481)로 처리.
  const [rejectVisible, setRejectVisible] = React.useState(false);
  const [cancelVisible, setCancelVisible] = React.useState(false);

  const onActionPress = (label: string) => {
    if (notif.kind === 'invite_received' && label === '거절') {
      setRejectVisible(true);
      return;
    }
    if (notif.kind === 'invite_sent' && label === '초대 취소') {
      setCancelVisible(true);
      return;
    }
    handleAction(navigation, notif.kind, label);
  };

  const body = (
    <View style={styles.card}>
      <NotifSlot slot={notif.slot} rel={notif.rel} />
      <View style={styles.cardBody}>
        <View style={styles.cardHead}>
          <Text style={styles.title} numberOfLines={2}>
            {notif.title}
          </Text>
          <Text style={styles.time}>{notif.time}</Text>
        </View>
        <View style={styles.lines}>
          {notif.lines.map((l, i) => (
            <Text key={i} style={styles.line}>
              {l}
            </Text>
          ))}
        </View>
        {notif.actions ? (
          <View style={styles.actions}>
            {notif.actions.map((a) => {
              const AIcon = ACTION_ICON(a);
              return (
                <Pressable
                  key={a}
                  style={styles.badge}
                  onPress={() => onActionPress(a)}
                >
                  <AIcon size={16} color="#4B5563" strokeWidth={2} />
                  <Text style={styles.badgeLabel}>{a}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );

  const modals = (
    <>
      <RejectScheduleInviteModal
        visible={rejectVisible}
        name={notif.name ?? '[탈퇴 회원]'}
        onReject={() => {
          setRejectVisible(false);
          // 샘플 갤러리 — 실 운영 시 거절 기록 + 발신자에게 알림.
          Alert.alert('초대 거절', '실 운영 시 거절 기록 + 발신자에게 알림.');
        }}
        onLater={() => setRejectVisible(false)}
      />
      <CancelScheduleInviteModal
        visible={cancelVisible}
        onCancel={() => {
          setCancelVisible(false);
          // 샘플 갤러리 — 실 운영 시 받은 사람에게 알림.
          Alert.alert('초대 취소됨', '실 운영 시 받은 사람에게 알림.');
        }}
        onLater={() => setCancelVisible(false)}
      />
    </>
  );

  if (cardTappable) {
    return (
      <>
        <Pressable onPress={() => handleCardTap(navigation, notif.kind)}>
          {body}
        </Pressable>
        {modals}
      </>
    );
  }
  return (
    <>
      {body}
      {modals}
    </>
  );
}

const styles = StyleSheet.create({
  // Figma 134:9662 — padding 16, 그룹 간 gap 32
  scroll: { padding: 16, gap: 32 },

  group: { gap: 12 },
  // Section Header — Bold 14/20 -0.084 #1F2937
  groupTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  list: { gap: 12 },

  // Notification 카드 — white, r24, p16, Shadow/md, row gap12, items-start
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // Icon Container — 40 원, bg #F8FAFC (회색 원 안에 명명 아이콘)
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Avatar — 40 원, 그 자체가 원형 SVG. 관계별 테두리(borderColor 동적 적용):
  // 나=pd-byellow / 친구=pd-mint / 비친구=pd-gray (profile_border_policy).
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  cardBody: { flex: 1, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  // 제목 — SemiBold 14/20 -0.084 #1F2937
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  // 시각 — Regular 12/16 -0.06 #4B5563
  time: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  lines: { gap: 2 },
  // 본문 — Regular 14, lineHeight 1.6(≈22) #4B5563
  line: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  actions: { flexDirection: 'row', gap: 12 },
  // Badge Text — border #CBD5E1, r10, px12 py6, gap8
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // Medium 14/20 -0.084 #4B5563
  badgeLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
});
