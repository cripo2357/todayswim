// Figma 134:9643 — 내 정보 > 알림 탭.
//
// 최근/이전 그룹의 알림 카드 리스트. 백엔드 미연동 단계 — Figma 샘플 콘텐츠를
// 그대로 렌더(디자인 임의 생성 금지). 아이콘은 lucide 근사치(회색 톤);
// 추후 Figma export SVG 업로드 시 settings 아이콘처럼 교체 예정.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import {
  Mail, XCircle, CheckCircle2, Megaphone, Smile, X, Check,
} from 'lucide-react-native';
import { tokens } from '@/styles/tokens';

type Kind = 'invite' | 'reject' | 'accept' | 'announce' | 'welcome';
type Action = '거절' | '수락' | '초대 취소';

interface Notif {
  id: string;
  kind: Kind;
  title: string;
  time: string;
  lines: string[];
  actions?: Action[];
}

// Figma 134:9643 — 최근 그룹 (샘플 콘텐츠 그대로).
const RECENT: Notif[] = [
  {
    id: 'r1', kind: 'invite', title: '친구 추가', time: '26.05.11 오전 3:23',
    lines: ['강두형님이 친구가 되고 싶어합니다.', '서로 친구로 추가하겠습니까?'],
    actions: ['거절', '수락'],
  },
  {
    id: 'r2', kind: 'reject', title: '초대 자동 취소', time: '26.05.11 오전 3:23',
    lines: ['초대를 보낸지 72시간이 초과되어 초대가 자동 취소되었습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r3', kind: 'reject', title: '초대 거절 (영구킹)', time: '26.05.11 오전 3:23',
    lines: ['영구킹님이 내 초대를 거절했습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r4', kind: 'accept', title: '초대 수락 (영구킹)', time: '26.05.11 오전 3:23',
    lines: ['영구킹님이 내 초대를 수락했습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r5', kind: 'accept', title: '초대 취소 (영구킹)', time: '26.05.11 오전 3:23',
    lines: ['영구킹님에게 보낸 초대를 취소했습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r6', kind: 'invite', title: '수영 초대장 (영구킹)', time: '26.05.11 오전 3:23',
    lines: ['영구킹님에게 초대장을 보냈습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
    actions: ['초대 취소'],
  },
  {
    id: 'r7', kind: 'reject', title: '수영 일정 거절', time: '26.05.11 오전 3:23',
    lines: ['영구킹님의 초대를 거절했습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r8', kind: 'accept', title: '수영 일정 수락', time: '26.05.11 오전 3:23',
    lines: ['영구킹님의 초대를 수락했습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r9', kind: 'accept', title: '초대 취소 (영구킹)', time: '26.05.11 오전 3:23',
    lines: ['영구킹님이 보낸 초대를 취소했습니다.', '[관악구민체육센터] 26.08.21 오후 4:00'],
  },
  {
    id: 'r10', kind: 'invite', title: '수영 일정 초대', time: '26.05.11 오전 3:23',
    lines: ['영구킹님이 초대장을 보냈습니다.', '[관악구민체육센터] 26.08.21 오후 4:00', '초대를 수락하겠습니까?'],
    actions: ['거절', '수락'],
  },
  {
    id: 'r11', kind: 'announce', title: '수영장 정보 업데이트', time: '26.05.11',
    lines: ['A수영장 외 3곳 추가,', 'A수영장 외 19곳 정보 수정'],
  },
];

// Figma 134:9643 — 이전 그룹.
const PREVIOUS: Notif[] = [
  {
    id: 'p1', kind: 'welcome', title: 'Everyday is Pool’s day', time: '26.05.11 - 11:23',
    lines: ['오늘부터 풀스데이와 함께 수영해요.'],
  },
];

const ICON: Record<Kind, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  invite: Mail,
  reject: XCircle,
  accept: CheckCircle2,
  announce: Megaphone,
  welcome: Smile,
};

const ACTION_ICON: Record<Action, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  거절: X,
  수락: Check,
  '초대 취소': X,
};

export function NotificationsTab() {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Group title="최근" items={RECENT} />
      <Group title="이전" items={PREVIOUS} />
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
  const Icon = ICON[notif.kind];
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
              const AIcon = ACTION_ICON[a];
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
