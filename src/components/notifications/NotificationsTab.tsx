// 내 정보 > 알림 탭 — Figma 134:9643 카드 UI.
//
// useNotifications로 실 수신함 데이터를 표시. 서버 0건이면 빈 상태 안내.
// (P3 prod, 2026-06-02): mock 샘플 갤러리 폴백 제거 — 신규 유저는 가짜
//  알림 없이 빈 상태에서 시작. kind→slot 매핑(KIND_TO_SLOT)만 보존.
//
// 이미지(슬롯) — 스펙 "이미지 매핑" 그대로:
//   상대 행동 트리거 → 프로필 사진(번들 아바타 샘플)
//   본인 행동 / 시스템 / 다수 / 환영 등 → 명명 아이콘 (프로젝트 SVG 우선,
//                                              없는 것만 lucide 폴백)
// 카피는 lib/messages/rules.RULES 단일출처 — 서버 row의 title/body도 발송
// 시점에 RULES.build로 계산해 적재됐으므로 mock과 동일 형식.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SvgProps } from 'react-native-svg';
import { X, Check, ChevronRight } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { type MessageKind } from '@/lib/messages/rules';
import { resolveAvatarUri } from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { RejectScheduleInviteModal } from '@/components/schedule/RejectScheduleInviteModal';
import { CancelScheduleInviteModal } from '@/components/schedule/CancelScheduleInviteModal';
import { useNotifications, type NotificationRow } from '@/hooks/useNotifications';
import { formatDateTime } from '@/lib/dateFormat';
import { logEvent } from '@/lib/analytics';
import { useFriends } from '@/store/friends';
import { useProfile } from '@/store/profile';
import { useSwimSchedules } from '@/store/swimSchedule';
import { dispatchMessage, dispatchMessageTo } from '@/lib/messages/dispatch';
import { respondInviteBySlot, cancelInvitesBySlot } from '@/lib/scheduleInvitesSync';

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
// avatar.value = 아바타 URL(소셜·업로드·번들) 또는 레거시 ID.
// resolveAvatarUri 로 정규화해 Image 렌더(NotifSlot).
type Slot =
  | { type: 'avatar'; value: string }
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
  /** related.senderUserId — 친구 신청·초대 보낸 사람 친구코드(=profiles.id). */
  senderUserId?: string;
  /** related.scheduleId — 리마인더 등 일정 포커스/dead-link용. */
  scheduleId?: string;
  /** related.senderAvatar — 카드에 보일 상대 아바타(번들 id 또는 사진 uri). 친구
   *  신청/초대 발송 시점에 저장된 실제 상대 아바타. NotifCard 액션에서 양측 적재에도 사용. */
  senderAvatar?: string;
  /** invite_received 슬롯 — 수락 시 내 일정 추가에 사용(related + params.pool). */
  inviteSlot?: {
    poolId: string;
    poolName: string;
    date: string; // YYYY-MM-DD
    start: string; // HH:MM
    end: string; // HH:MM
  };
  /** invite_sent 수신자 친구코드 목록 — 초대 취소 시 각자에게 invite_canceled. */
  inviteeIds?: string[];
  /** 표시용 날짜 문구(params.date) — invite_accepted/rejected 본문에 사용. */
  dateLabel?: string;
  /** 적재 시각(ms) — invite_received 72h 자동 만료 판정. */
  createdAtMs?: number;
  /** 미읽음 여부 — true 면 시간 옆에 노란 dot 표시. */
  read?: boolean;
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
const avatar = (value: string): Slot => ({ type: 'avatar', value });

// 트리거 유형 → 발송 시점 관계 (테두리 색의 단일 출처). 누락 = 'friend' 기본.
// 트리거가 곧 관계를 함축 — 시간 지나도 그 시점 관계 보존.
const REL_BY_KIND: Partial<Record<MessageKind, AvatarRel>> = {
  friend_request_received: 'stranger', // 신청자 = 아직 친구 아님
  friend_request_sent: 'stranger', // 내가 보낸 시점: 상대는 아직 친구 아님
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
const SLOT_EVENT = svg(IconEvent); // [이벤트] (marketing 3종 모두 — 스펙)
const SLOT_APPROVED = svg(IconApproved); // [승인]
const SLOT_REPORT = svg(IconReport); // [리포트]
const SLOT_DONATION_THANKS = svg(IconPiggyBankSlot); // [후원 감사]

// 서버 알림 row 의 kind → 카드 좌측 slot(아이콘/기본 아바타) 매핑.
// (P3 prod, 2026-06-02): 가짜 샘플 갤러리 제거. 이 맵은 실 알림의 아이콘
//  결정 용도로만 남는다. avatar slot 인 kind 는 실 적재 시 row.related 의
//  senderAvatar 로 갱신 예정 — 현재는 기본 아바타. 누락 kind 는 rowToNotif
//  에서 chevron 으로 폴백.
const KIND_TO_SLOT: Partial<Record<MessageKind, Slot>> = {
  // 상대 행동 트리거 → 프로필 사진(기본 아바타).
  friend_request_received: avatar('avatar-male-1'),
  friend_request_sent: avatar('avatar-female-3'),
  friend_request_accepted: avatar('avatar-female-2'),
  invite_received: avatar('avatar-male-3'),
  friend_schedule_overlap: avatar('avatar-female-3'),
  friend_joined_my_slot: avatar('avatar-male-3'),
  // 부정(거절·취소·만료·반려) → [반려] 통일.
  friend_request_rejected: SLOT_REJECT,
  invite_rejected: SLOT_REJECT,
  invite_canceled: SLOT_REJECT,
  invite_auto_expired: SLOT_REJECT,
  pool_submission_rejected: SLOT_REJECT,
  schedule_submission_rejected: SLOT_REJECT,
  // 긍정(초대) → [초대].
  invite_accepted: SLOT_INVITE,
  invite_sent: SLOT_INVITE,
  // 시스템 안내.
  new_feature_announced: SLOT_NEW_FEATURE,
  app_version_updated: SLOT_VERSION_UP,
  pool_submission_approved: SLOT_APPROVED,
  schedule_submission_approved: SLOT_SCHEDULE,
  // 운영자 발 이벤트(광고) 3종 → [이벤트].
  marketing_event: SLOT_EVENT,
  marketing_partnership: SLOT_EVENT,
  marketing_recommendation: SLOT_EVENT,
  // 자동·필수.
  schedule_reminder_prev_day: SLOT_REMINDER,
  schedule_reminder_1h: SLOT_REMINDER,
  terms_updated: SLOT_TERMS,
  nickname_changed_by_admin: SLOT_PROFILE,
  donation_thanks: SLOT_DONATION_THANKS,
  // 회고·환영.
  welcome: SLOT_WELCOME,
  monthly_summary: SLOT_REPORT,
};

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
  focusDate?: string; // 일정 보기 시 달력을 열 날짜(YYYY-MM-DD)
  scheduleId?: string; // 일정 포커스용 id(리마인더 카드 탭)
  senderUserId?: string; // 상대 프로필 진입용 친구코드(친구 카드 탭)
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
  void logEvent('notification_tap', { kind, label });
  // === 응답형(C 2버튼) — 상태 변경 ===
  // friend_request_received(수락/거절) / invite_received(수락) / invite_sent(취소)
  // 는 NotifCard.onActionPress·모달에서 related(senderUserId/inviteSlot/inviteeIds)
  // 를 쥐고 실제 그래프·일정 갱신 + 알림으로 처리. (handleAction은 이동 액션 전담)
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
    // 달력 탭으로 이동 + 슬롯 날짜로 포커스(focusDate=YYYY-MM-DD). 없으면 오늘.
    return navigation.navigate('MyInfo', {
      initialTab: '달력',
      ...(meta.focusDate ? { focusDate: meta.focusDate } : {}),
    });
  }
  if (label === '보기' || label === '근처 수영장 보기') {
    // "보기" = 풀 보기일 때 dead-link 가드 (pool_submission_approved 등).
    if (meta.poolAlive === false) {
      return Alert.alert('삭제된 수영장입니다', '');
    }
    return navigation.navigate('MapMain');
  }
  // 후원 감사 → 본인 응원글로 이동 + 본인 카드 위치로 자동 스크롤.
  // 본인 카드는 dedupe 로 1장이라 정확히 그 카드로.
  if (label === '응원글 보기' && kind === 'donation_thanks') {
    return navigation.navigate('Donation', { scrollToMine: true });
  }
  // 광고(참여) 등 미정 — Phase 2
}

/**
 * 카드 탭 동작(액션 패턴 A) — 버튼 없는 카드의 탭 시 이동.
 * E 트리거(이력)는 cardTappable=false라 호출되지 않음.
 * dead-link 가드: navigate 전 entity 존재 확인 (스펙 §6 정책 가이드).
 */
function handleCardTap(navigation: Nav, kind: MessageKind, meta: DeadLinkMeta = {}) {
  // 친구 신청 수락 → 그 친구 프로필. senderUserId 없으면(구 알림) 내 정보 폴백.
  if (kind === 'friend_request_accepted') {
    if (meta.senderAlive === false) {
      return Alert.alert('탈퇴한 회원입니다', '');
    }
    return meta.senderUserId
      ? navigation.navigate('OtherUserProfile', { userId: meta.senderUserId })
      : navigation.navigate('MyInfo');
  }
  // 닉네임 변경(내 닉네임 = 본인 건) → 내 정보.
  if (kind === 'nickname_changed_by_admin') {
    return navigation.navigate('MyInfo');
  }
  // 일정 리마인더 → 달력을 그 일정 날짜로 포커스(scheduleId). 없으면 오늘.
  if (kind === 'schedule_reminder_prev_day' || kind === 'schedule_reminder_1h') {
    if (meta.scheduleAlive === false) {
      return Alert.alert('삭제된 일정입니다', '');
    }
    return navigation.navigate('MyInfo', {
      initialTab: '달력',
      ...(meta.scheduleId ? { focusScheduleId: meta.scheduleId } : {}),
    });
  }
  // 환영·결산 → MapMain
  if (kind === 'welcome' || kind === 'monthly_summary')
    return navigation.navigate('MapMain');
  // 정보형(앱 업데이트·제보 반려 등) — 탭 대상 미정, no-op
}

// P3-A5: 읽음 처리는 서버 notifications.read 컬럼 + 탭 진입 시 markAllRead
// (MyInfoScreen) 가 처리. 본 컴포넌트는 표시·액션 디스패치 전용.

const ACTION_ICON = (label: string): React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> => {
  if (label === '수락' || label === '완료') return Check;
  if (label === '거절' || label === '못 갔어요' || label === '초대 취소') return X;
  return ChevronRight; // 일정 보기 / 보기 / 참여 / 약관 보기 / 근처 수영장 보기 등 이동형
};

function rowToNotif(row: NotificationRow): Notif {
  const baseSlot: Slot = KIND_TO_SLOT[row.kind] ?? lucide(ChevronRight);
  const senderAvatar =
    typeof row.related?.senderAvatar === 'string'
      ? row.related.senderAvatar
      : undefined;
  // avatar 카드면 발송 시 저장된 실제 상대 아바타로 교체(없으면 기본 샘플 폴백 — 구 알림).
  const slot: Slot =
    baseSlot.type === 'avatar' && senderAvatar
      ? avatar(senderAvatar)
      : baseSlot;
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
    senderUserId:
      typeof row.related?.senderUserId === 'string'
        ? row.related.senderUserId
        : undefined,
    senderAvatar,
    scheduleId:
      typeof row.related?.scheduleId === 'string'
        ? row.related.scheduleId
        : undefined,
    inviteSlot: inviteSlotFromRow(row),
    inviteeIds: Array.isArray(row.related?.inviteeIds)
      ? (row.related.inviteeIds as unknown[]).filter(
          (x): x is string => typeof x === 'string',
        )
      : undefined,
    dateLabel:
      typeof row.params?.date === 'string'
        ? row.params.date
        : typeof row.related?.date === 'string'
          ? (row.related.date as string)
          : undefined,
    createdAtMs: row.created_at ? Date.parse(row.created_at) : undefined,
    read: row.read,
  };
}

// 받은 초대 자동 만료 — 72h 무응답이면 수락/거절 불가(스펙 invite_auto_expired).
const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

/** invite_received row → 일정 추가용 슬롯. related(poolId/date/start/end) +
 *  params.pool(발송 시점 풀명 스냅샷)이 모두 있어야 유효. 하나라도 없으면 undefined. */
function inviteSlotFromRow(row: NotificationRow): Notif['inviteSlot'] {
  if (row.kind !== 'invite_received' && row.kind !== 'invite_sent')
    return undefined;
  const r = row.related ?? {};
  const poolId = typeof r.poolId === 'string' ? r.poolId : undefined;
  const date = typeof r.date === 'string' ? r.date : undefined;
  const start = typeof r.start === 'string' ? r.start : undefined;
  const end = typeof r.end === 'string' ? r.end : undefined;
  const poolName = row.params?.pool?.trim();
  if (!poolId || !date || !start || !end || !poolName) return undefined;
  return { poolId, poolName, date, start, end };
}

export function NotificationsTab() {
  const { rows } = useNotifications();
  React.useEffect(() => {
    void logEvent('notification_tab_open', { unread_count: 0 });
  }, []);
  // 서버 row가 있으면 단일 "최근" 그룹으로 통합(시간 정렬은 fetch에서 desc).
  // 0건 → 빈 상태 안내(신규 유저 / 알림 없음).
  return (
    <ScrollView
      contentContainerStyle={
        rows.length > 0 ? styles.scroll : styles.scrollEmpty
      }
      showsVerticalScrollIndicator={false}
    >
      {rows.length > 0 ? (
        <Group title="최근" items={rows.map(rowToNotif)} />
      ) : (
        <Text style={styles.empty}>아직 도착한 메시지가 없습니다.</Text>
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
    // value = 아바타 URL(업로드·소셜·번들) 또는 레거시 ID — resolveAvatarUri 통일.
    const border = { borderColor: REL_BORDER[rel ?? 'friend'] };
    return (
      <View style={[styles.avatarWrap, border]}>
        <Image
          source={{ uri: resolveAvatarUri(slot.value, { size: 40 }) }}
          style={styles.avatarImg}
        />
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
  // 친구 신청 수락/거절 처리 후 — 액션 버튼 숨기고 상태 문구 노출(중복 탭 방지).
  const [handledMsg, setHandledMsg] = React.useState<string | null>(null);
  // 받은 초대 72h 무응답 → 자동 만료(수락/거절 버튼 숨기고 안내). 서버 cron 없이
  // 표시 시점 계산 — 만료된 초대는 어차피 의미 없으므로 버튼만 비활성.
  const inviteExpired =
    notif.kind === 'invite_received' &&
    !!notif.createdAtMs &&
    Date.now() - notif.createdAtMs > INVITE_TTL_MS;

  const onActionPress = async (label: string) => {
    if (notif.kind === 'invite_received' && label === '거절') {
      setRejectVisible(true);
      return;
    }
    if (notif.kind === 'invite_sent' && label === '초대 취소') {
      setCancelVisible(true);
      return;
    }
    // 친구 신청 수락/거절 — 실제 친구 그래프 갱신 + 양측 알림(FriendsTab 패턴).
    if (
      notif.kind === 'friend_request_received' &&
      (label === '수락' || label === '거절')
    ) {
      void logEvent('notification_tap', { kind: notif.kind, label });
      const requesterId = notif.senderUserId;
      if (!requesterId) {
        // 신청자 식별 불가(senderUserId 없는 구 알림) — 친구 탭에서 처리하도록 안내.
        Alert.alert(
          '친구 탭에서 확인해주세요',
          '이 신청은 친구 탭에서 수락하거나 거절할 수 있어요.',
        );
        return;
      }
      const my = useProfile.getState().profile;
      if (label === '수락') {
        useFriends.getState().accept(requesterId);
        // 본인 이력(내 카드: "{신청자}와 친구가 됐어요") — 아바타=신청자(받은 카드에 저장된 값)
        void dispatchMessage(
          'friend_request_accepted',
          { name: notif.name ?? '' },
          notif.senderAvatar ? { senderAvatar: notif.senderAvatar } : {},
        );
        // 신청자 알림(상대 카드: "{내 닉}과 친구가 됐어요") — 아바타=나 + OS 푸시
        if (my?.name) {
          void dispatchMessageTo(
            requesterId,
            'friend_request_accepted',
            { name: my.name },
            { senderUserId: my.id, senderAvatar: my.photoUri },
          );
        }
        setHandledMsg('친구가 됐어요');
      } else {
        // 거절 — 본인 이력만 기록(정책: 상대 무알림).
        useFriends.getState().reject(requesterId);
        void dispatchMessage('friend_request_rejected', { name: notif.name ?? '' });
        setHandledMsg('신청을 거절했어요');
      }
      return;
    }
    // 일정 초대 수락 — 그 슬롯에 내 일정 추가(참여) + 양측 invite_accepted.
    if (notif.kind === 'invite_received' && label === '수락') {
      void logEvent('notification_tap', { kind: notif.kind, label });
      void logEvent('invite_accepted');
      const slot = notif.inviteSlot;
      if (!slot) {
        // 슬롯 정보 없는 구 알림 — 캘린더에서 직접 추가하도록 안내.
        Alert.alert(
          '일정을 불러올 수 없어요',
          '초대 정보가 없어 캘린더에서 직접 추가해주세요.',
        );
        return;
      }
      // 같은 슬롯(풀+날짜+시작/끝) 이미 있으면 중복 추가 방지.
      const dup = useSwimSchedules
        .getState()
        .schedules.some(
          (s) =>
            s.poolId === slot.poolId &&
            s.date === slot.date &&
            s.start === slot.start &&
            s.end === slot.end,
        );
      let acceptedId: string | undefined;
      if (!dup) {
        // 초대 수락 = 초대자(친구)에게 보이도록 기본 '친구 공개'로 참여.
        acceptedId = await useSwimSchedules.getState().add({
          poolId: slot.poolId,
          poolName: slot.poolName,
          date: slot.date,
          start: slot.start,
          end: slot.end,
          visibility: 'friends',
        });
      }
      const my = useProfile.getState().profile;
      // 서버 초대 상태 전이(수락) — (초대자,나,슬롯) 자연키. best-effort.
      if (notif.senderUserId && my?.id) {
        void respondInviteBySlot(
          notif.senderUserId,
          my.id,
          { poolId: slot.poolId, date: slot.date, start: slot.start },
          'accepted',
          acceptedId,
        );
      }
      // 본인 이력: "{초대한 사람}님과 … 함께해요"
      void dispatchMessage('invite_accepted', {
        name: notif.name ?? '',
        date: notif.dateLabel,
      });
      // 초대한 사람에게: "{내 닉}님과 … 함께해요" + OS 푸시
      if (notif.senderUserId && my?.name) {
        void dispatchMessageTo(
          notif.senderUserId,
          'invite_accepted',
          { name: my.name, date: notif.dateLabel },
          {
            senderUserId: my.id,
            poolId: slot.poolId,
            date: slot.date,
            start: slot.start,
            end: slot.end,
          },
        );
      }
      setHandledMsg('일정에 참여했어요');
      return;
    }
    handleAction(navigation, notif.kind, label, {
      focusDate: notif.inviteSlot?.date ?? notif.dateLabel,
    });
  };

  const body = (
    <View style={styles.card}>
      <NotifSlot slot={notif.slot} rel={notif.rel} />
      <View style={styles.cardBody}>
        <View style={styles.cardHead}>
          <Text style={styles.title} numberOfLines={2}>
            {notif.title}
          </Text>
          {/* 미읽음 dot — read=false 일 때만. mock 갤러리는 read=true 라 노출 X.
           *  탭 진입 시 markAllRead 가 모든 read=true 갱신해 dot 즉시 사라짐. */}
          {notif.read === false ? (
            <View style={styles.unreadDot} accessibilityLabel="미읽음" />
          ) : null}
          <Text style={styles.time}>{notif.time}</Text>
        </View>
        <View style={styles.lines}>
          {notif.lines.map((l, i) => (
            <Text key={i} style={styles.line}>
              {l}
            </Text>
          ))}
        </View>
        {notif.actions && !handledMsg && !inviteExpired ? (
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
        {handledMsg ? (
          <Text style={styles.handledNote}>{handledMsg}</Text>
        ) : inviteExpired ? (
          <Text style={styles.handledNote}>초대가 만료됐어요</Text>
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
          void logEvent('invite_rejected');
          setRejectVisible(false);
          // 서버 초대 상태 전이(거절) — (초대자,나,슬롯) 자연키. best-effort.
          const myR = useProfile.getState().profile;
          if (notif.senderUserId && myR?.id && notif.inviteSlot) {
            void respondInviteBySlot(
              notif.senderUserId,
              myR.id,
              {
                poolId: notif.inviteSlot.poolId,
                date: notif.inviteSlot.date,
                start: notif.inviteSlot.start,
              },
              'rejected',
            );
          }
          // 본인 이력만 기록(정책: 발신자 무알림 — friend reject와 일관).
          void dispatchMessage('invite_rejected', {
            name: notif.name ?? '',
            date: notif.dateLabel,
          });
          setHandledMsg('초대를 거절했어요');
        }}
        onLater={() => setRejectVisible(false)}
      />
      <CancelScheduleInviteModal
        visible={cancelVisible}
        onCancel={() => {
          void logEvent('invite_canceled');
          setCancelVisible(false);
          const my = useProfile.getState().profile;
          // 서버 초대 상태 전이(취소) — (나,피초대자들,슬롯) 자연키. best-effort.
          if (my?.id && notif.inviteeIds?.length && notif.inviteSlot) {
            void cancelInvitesBySlot(
              my.id,
              notif.inviteeIds,
              {
                poolId: notif.inviteSlot.poolId,
                date: notif.inviteSlot.date,
                start: notif.inviteSlot.start,
              },
            );
          }
          // 초대받은 친구들에게 invite_canceled 발송(각자 알림함 + 푸시).
          if (my?.name && notif.inviteeIds?.length) {
            for (const toId of notif.inviteeIds) {
              void dispatchMessageTo(toId, 'invite_canceled', {
                name: my.name,
                date: notif.dateLabel,
              });
            }
          }
          setHandledMsg('초대를 취소했어요');
        }}
        onLater={() => setCancelVisible(false)}
      />
    </>
  );

  if (cardTappable) {
    return (
      <>
        <Pressable
          onPress={() =>
            handleCardTap(navigation, notif.kind, {
              scheduleId: notif.scheduleId,
              senderUserId: notif.senderUserId,
            })
          }
        >
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
  // 빈 상태 — 화면 중앙 정렬.
  scrollEmpty: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
  },

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
    ...tokens.shadow.md,
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
  // 사진(uri) 아바타 — 원형 테두리 안을 채움(wrap의 overflow:hidden이 라운드 클립).
  avatarImg: { width: 40, height: 40 },
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
  // 미읽음 dot — Figma 패턴: 시간 옆 8px 노란 원. 탭 진입 시 일괄 read 처리되어 사라짐.
  // marginTop 4 로 시각 행 baseline 살짝 위에 떠 보이게 (시각 fontSize 12 lineHeight 16 의 중앙 정렬).
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.pdByellow,
    marginTop: 4,
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
  // 친구 신청 처리 후 상태 문구 — 액션 버튼 자리 대체.
  handledNote: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
  },
});
