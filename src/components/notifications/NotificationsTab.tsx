// 내 정보 > 알림 탭 — Figma 134:9643 카드 UI.
//
// P1: 백엔드(크론·푸시·서버 팬아웃) 미연동. 본 탭은 **모든 메시지 트리거의
// 샘플 갤러리**다 — docs/notification-triggers-spec-v0.5.md 의 22트리거 +
// invite 상태 + monthly 8변형 + 변수 폴백을, 실제 카드 UI(NotifCard)로
// 렌더한다. 카피는 lib/messages/rules.RULES 단일출처 → 스펙과 자동 일치
// (여기서 문구를 따로 적지 않는다). 아이콘은 lucide 근사치(회색 톤);
// Figma export SVG 확정 시 settings 아이콘처럼 교체 예정(디자인 임의생성 X).
// Phase 2: 실제 notifications 적재/수신으로 데이터 소스만 교체.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import {
  Mail, XCircle, CheckCircle2, Megaphone, Smile, X, Check,
  UserPlus, Users, Sparkles, ArrowUpCircle, FileText, User,
  Clock, Waves, BarChart3, ChevronRight, Ban,
} from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { RULES, type MessageKind, type MessageParams } from '@/lib/messages/rules';

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface Notif {
  id: string;
  Icon: IconCmp;
  title: string;
  time: string;
  lines: string[];
  actions?: string[];
}

/** 샘플 1건 정의 — kind+params를 RULES로 빌드해 실제 카드 문구 생성 */
interface SampleSpec {
  id: string;
  kind: MessageKind;
  Icon: IconCmp;
  params: MessageParams;
  /** 부가 설명(상태/변형 구분용, 카드 외 그룹 가독성엔 영향 없음 — 미사용) */
  note?: string;
}

// 공통 샘플 변수 (v0.5 어휘)
const P = '강남 스포츠센터';
const NM = '강두형';
const D = '5월 28일(수)';
const T = '19:00';

const GROUPS: { title: string; items: SampleSpec[] }[] = [
  {
    title: '유형 1. 사람 발신',
    items: [
      { id: 's1', kind: 'friend_request_received', Icon: User, params: { name: NM } },
      { id: 's2', kind: 'friend_request_accepted', Icon: UserPlus, params: { name: NM } },
      { id: 's3', kind: 'friend_request_rejected', Icon: UserPlus, params: { name: NM } },
      { id: 's4', kind: 'invite_received', Icon: User, params: { name: NM, pool: P, date: D, time: T } },
      { id: 's5', kind: 'invite_accepted', Icon: Mail, params: { name: NM, date: D } },
      { id: 's6', kind: 'invite_rejected', Icon: Mail, params: { name: NM, date: D } },
      { id: 's7', kind: 'invite_canceled', Icon: User, params: { name: NM, date: D } },
      { id: 's8', kind: 'invite_auto_expired', Icon: Mail, params: { name: NM, date: D } },
      { id: 's9', kind: 'invite_sent', Icon: Mail, params: { name: NM, pool: P, date: D, time: T } },
      { id: 's10', kind: 'invite_sent', Icon: Mail, params: { count: 3, pool: P, date: D, time: T } },
      { id: 's11', kind: 'friend_schedule_overlap', Icon: User, params: { name: NM, pool: P, date: D, time: T } },
    ],
  },
  {
    title: '유형 2. 시스템 안내',
    items: [
      { id: 's12', kind: 'new_feature_announced', Icon: Sparkles, params: { featureName: '수영 번개모임' } },
      { id: 's13', kind: 'app_version_updated', Icon: ArrowUpCircle, params: { version: '1.2', featureName: '지도', bullets: ['지도 클러스터 개선', '시간표 시즌 표시'] } },
      { id: 's14', kind: 'pool_submission_approved', Icon: CheckCircle2, params: { pool: P } },
      { id: 's15', kind: 'pool_submission_rejected', Icon: XCircle, params: { pool: P } },
      { id: 's16', kind: 'schedule_submission_approved', Icon: Waves, params: { pool: P } },
      { id: 's17', kind: 'schedule_submission_rejected', Icon: XCircle, params: { pool: P } },
    ],
  },
  {
    title: '유형 3. 운영자 발 이벤트 (광고)',
    items: [
      { id: 's18', kind: 'marketing_event', Icon: Megaphone, params: { headline: '여름 수영 챌린지', desc: '7월 한 달 매일 수영 인증하고 굿즈 받아요.' } },
      { id: 's19', kind: 'marketing_partnership', Icon: Megaphone, params: { headline: '○○스포츠', desc: '제휴 수영용품 할인 소식을 알려드려요.' } },
      { id: 's20', kind: 'marketing_recommendation', Icon: Megaphone, params: { headline: '근처 새 수영장', desc: '회원님 동선에 맞는 수영장을 추천해요.' } },
    ],
  },
  {
    title: '유형 4. 자동·필수',
    items: [
      { id: 's21', kind: 'schedule_reminder_prev_day', Icon: Clock, params: { pool: P, time: T } },
      { id: 's22', kind: 'schedule_reminder_1h', Icon: Clock, params: { pool: P } },
      { id: 's23', kind: 'terms_updated', Icon: FileText, params: { effectiveDate: '2026년 6월 5일' } },
      { id: 's24', kind: 'nickname_changed_by_admin', Icon: User, params: { newNickname: '물개수영', reason: '부적절한 표현' } },
    ],
  },
  {
    title: '유형 5. 환영·축하',
    items: [
      { id: 's25', kind: 'welcome', Icon: Smile, params: {} },
      { id: 's26', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'first_month', month: '5', count2: 3 } },
      { id: 's27', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'best_day', month: '5', bestDate: '5월 18일', bestMinutes: '90' } },
      { id: 's28', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'new_pools', month: '5', newPoolCount: 3 } },
      { id: 's29', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'with_friends', month: '5', percent: 60 } },
      { id: 's30', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'total_hours', month: '5', totalHours: '12' } },
      { id: 's31', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'pattern', month: '5', weekday: '화요일', timePeriod: '저녁' } },
      { id: 's32', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'frequency', month: '5', count2: 8, favoritePool: P } },
      { id: 's33', kind: 'monthly_summary', Icon: BarChart3, params: { variant: 'idle', month: '5' } },
      { id: 's34', kind: 'schedule_completion_prompt', Icon: Waves, params: { pool: P } },
    ],
  },
  {
    title: '변수 폴백',
    items: [
      { id: 's35', kind: 'friend_request_accepted', Icon: Ban, params: {} }, // name 없음 → [탈퇴 회원]
      { id: 's36', kind: 'invite_received', Icon: Ban, params: { name: NM, date: D, time: T } }, // pool 없음 → [수영장 정보 없음]
    ],
  },
];

// 샘플 갤러리라 공통 표기 시각 1개 (실제 적재 시 발송 시각으로 대체).
const SAMPLE_TIME = '26.05.20 오후 2:00';

function toNotif(s: SampleSpec): Notif {
  const c = RULES[s.kind].build(s.params);
  return {
    id: s.id,
    Icon: s.Icon,
    title: c.title,
    time: SAMPLE_TIME,
    lines: c.body.filter((l) => l.length > 0),
    actions: c.actions && c.actions.length > 0 ? c.actions : undefined,
  };
}

// 샘플 갤러리는 '읽지 않음' 개념 없음 — 빨간 배지 미노출.
export const UNREAD_SEED = 0;

const ACTION_ICON = (label: string): IconCmp => {
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

function NotifCard({ notif }: { notif: Notif }) {
  const Icon = notif.Icon;
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Icon size={20} color="#4B5563" strokeWidth={2} />
      </View>
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
  // Icon Container — 40 원, bg #F8FAFC
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
