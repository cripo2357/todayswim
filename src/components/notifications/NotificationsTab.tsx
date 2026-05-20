// 내 정보 > 알림 탭 — Figma 134:9643 카드 UI.
//
// P1: 백엔드(크론·푸시·서버 팬아웃) 미연동. 본 탭은 **모든 메시지 트리거의
// 샘플 갤러리**다 — docs/notification-triggers-spec-v0.5.md 의 22트리거 +
// invite 상태 + monthly 8변형 + 변수 폴백을, 실제 카드 UI(NotifCard)로
// 렌더한다. 카피는 lib/messages/rules.RULES 단일출처 → 스펙과 자동 일치
// (여기서 문구를 따로 적지 않는다).
//
// 이미지(슬롯) — 스펙 "이미지 매핑" 그대로:
//   상대 행동 트리거 → 프로필 사진(번들 아바타 샘플)
//   본인 행동 / 시스템 / 다수 / 환영 등 → 명명 아이콘 (프로젝트 SVG 우선,
//                                              없는 것만 lucide 폴백)
// Phase 2: 실제 notifications 적재/수신으로 데이터 소스만 교체.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { X, Check, ChevronRight } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { RULES, type MessageKind, type MessageParams } from '@/lib/messages/rules';
import { BUNDLE_AVATARS, type AvatarId } from '@/lib/avatars';

// 프로젝트 SVG 아이콘 — 스펙 명명 아이콘에 1:1 매핑.
import IconNewFeature from '@assets/icons/announcement/new-feature.svg';
import IconFeatureUpdate from '@assets/icons/announcement/feature-update.svg';
import IconEvent from '@assets/icons/announcement/event.svg';
import IconApproved from '@assets/icons/announcement/approved.svg'; // [승인]
import IconReport from '@assets/icons/announcement/report.svg'; // [리포트]
import IconEnvelope from '@assets/icons/settings/envelope.svg'; // [초대]
import IconCloseCircle from '@assets/icons/close-circle.svg'; // [반려]
import IconGavel from '@assets/icons/settings/gavel.svg'; // [약관]
import IconProfile from '@assets/icons/settings/profile.svg'; // [프로필]
import IconBell from '@assets/icons/settings/bell.svg'; // [리마인더]
import IconUserDouble from '@assets/icons/user-double.svg'; // [친구]
import IconSwim from '@assets/icons/swim.svg'; // [수영]
import IconCalendarCheck from '@assets/icons/settings/calendar-check.svg'; // [시간표]
import IconOverjoyed from '@assets/icons/emotion-overjoyed.svg'; // [환영]
import IconMegaphone from '@assets/icons/megaphone.svg'; // [이벤트] 대안

type SvgIconCmp = React.FC<SvgProps>;

/** 카드 좌측 슬롯 — 프로필 사진 또는 명명 아이콘 (스펙 이미지 매핑).
 *  아바타 rel = 관계별 테두리(profile_border_policy):
 *  나=pd-byellow / 친구=pd-mint / 비친구=pd-gray. */
type AvatarRel = 'me' | 'friend' | 'stranger';
type Slot =
  | { type: 'avatar'; id: AvatarId; rel: AvatarRel }
  | { type: 'icon'; render: () => React.ReactNode };

interface Notif {
  id: string;
  slot: Slot;
  title: string;
  time: string;
  lines: string[];
  actions?: string[];
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
// 기본 rel='friend' — 알림 카드 프로필 사진은 대부분 친구 관계.
// 친구신청 받음은 'stranger'로 명시.
const avatar = (id: AvatarId, rel: AvatarRel = 'friend'): Slot => ({ type: 'avatar', id, rel });

// 명명 아이콘 (스펙) → 프로젝트 SVG 슬롯 (재사용 편의)
const SLOT_FRIEND = svg(IconUserDouble); // [친구]
const SLOT_INVITE = svg(IconEnvelope); // [초대]
const SLOT_REJECT = svg(IconCloseCircle); // [반려]
const SLOT_NEW_FEATURE = svg(IconNewFeature); // [신기능]
const SLOT_VERSION_UP = svg(IconFeatureUpdate); // [업데이트]
const SLOT_SCHEDULE = svg(IconCalendarCheck); // [시간표]
const SLOT_REMINDER = svg(IconBell); // [리마인더]
const SLOT_TERMS = svg(IconGavel); // [약관]
const SLOT_PROFILE = svg(IconProfile); // [프로필]
const SLOT_WELCOME = svg(IconOverjoyed); // [환영]
const SLOT_SWIM = svg(IconSwim); // [수영]
const SLOT_EVENT = svg(IconEvent); // [이벤트]
const SLOT_PARTNER = svg(IconMegaphone); // [이벤트] 변형 — 제휴/광고용
const SLOT_APPROVED = svg(IconApproved); // [승인]
const SLOT_REPORT = svg(IconReport); // [리포트]

// 공통 샘플 변수 (v0.5 어휘)
const P = '강남 스포츠센터';
const NM = '강두형';
const D = '5월 28일(수)';
const T = '19:00';

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
      // 상대 행동 → 프로필 사진
      // friend_request_received: 신청자 = 아직 친구 아님 → stranger 테두리(pd-gray)
      { id: 's1', kind: 'friend_request_received', slot: avatar('avatar-male-1', 'stranger'), params: { name: NM } },
      { id: 's2', kind: 'friend_request_accepted', slot: avatar('avatar-female-2'), params: { name: NM } },
      // 본인 행동 → [친구] 아이콘
      { id: 's3', kind: 'friend_request_rejected', slot: SLOT_FRIEND, params: { name: NM } },
      // 초대 받은 직후 → 초대자 프로필
      { id: 's4', kind: 'invite_received', slot: avatar('avatar-male-3'), params: { name: NM, pool: P, date: D, time: T } },
      // 본인 응답(수락/거절) → [초대] 아이콘
      { id: 's5', kind: 'invite_accepted', slot: SLOT_INVITE, params: { name: NM, date: D } },
      { id: 's6', kind: 'invite_rejected', slot: SLOT_INVITE, params: { name: NM, date: D } },
      // 보낸 사람이 취소(받은 입장) → 초대자 프로필
      { id: 's7', kind: 'invite_canceled', slot: avatar('avatar-male-4'), params: { name: NM, date: D } },
      // 시스템 만료 → [초대] 아이콘
      { id: 's8', kind: 'invite_auto_expired', slot: SLOT_INVITE, params: { name: NM, date: D } },
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
      { id: 's19', kind: 'marketing_partnership', slot: SLOT_PARTNER, params: { headline: '○○스포츠', desc: '제휴 수영용품 할인 소식을 알려드려요.' } },
      { id: 's20', kind: 'marketing_recommendation', slot: SLOT_EVENT, params: { headline: '근처 새 수영장', desc: '회원님 동선에 맞는 수영장을 추천해요.' } },

      // ── 유형 4. 자동·필수 (schedule_completion_prompt 제외 — 인앱 피드 미적재) ──
      { id: 's21', kind: 'schedule_reminder_prev_day', slot: SLOT_REMINDER, params: { pool: P, time: T } },
      { id: 's22', kind: 'schedule_reminder_1h', slot: SLOT_REMINDER, params: { pool: P } },
      { id: 's23', kind: 'terms_updated', slot: SLOT_TERMS, params: { effectiveDate: '2026년 6월 5일' } },
      { id: 's24', kind: 'nickname_changed_by_admin', slot: SLOT_PROFILE, params: { newNickname: '물개수영', reason: '부적절한 표현' } },

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
const SAMPLE_TIME = '26.05.20 오후 2:00';

function toNotif(s: SampleSpec): Notif {
  const c = RULES[s.kind].build(s.params);
  return {
    id: s.id,
    slot: s.slot,
    title: c.title,
    time: SAMPLE_TIME,
    lines: c.body.filter((l) => l.length > 0),
    actions: c.actions && c.actions.length > 0 ? c.actions : undefined,
  };
}

// 샘플 갤러리는 '읽지 않음' 개념 없음 — 빨간 배지 미노출.
export const UNREAD_SEED = 0;

const ACTION_ICON = (label: string): React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> => {
  if (label === '수락' || label === '완료') return Check;
  if (label === '거절' || label === '못 갔어요' || label === '초대 취소') return X;
  return ChevronRight; // 일정 보기 / 보기 / 참여 / 약관 보기 / 근처 수영장 보기 등 이동형
};

export function NotificationsTab() {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {GROUPS.map((g) => (
        <Group key={g.title} title={g.title} items={g.items.map(toNotif)} />
      ))}
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

function NotifSlot({ slot }: { slot: Slot }) {
  if (slot.type === 'avatar') {
    const Avatar = BUNDLE_AVATARS[slot.id];
    return (
      <View style={[styles.avatarWrap, { borderColor: REL_BORDER[slot.rel] }]}>
        <Avatar width={40} height={40} />
      </View>
    );
  }
  return <View style={styles.iconCircle}>{slot.render()}</View>;
}

function NotifCard({ notif }: { notif: Notif }) {
  return (
    <View style={styles.card}>
      <NotifSlot slot={notif.slot} />
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
                <Pressable key={a} style={styles.badge}>
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
