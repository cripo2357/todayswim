// 내 정보 > 달력 탭 — Figma 120:3156.
// 주간 캘린더 + 선택일의 내 수영 일정 카드 리스트 + "수영 일정 추가".
//
// 친구/모르는사람 목록은 친구 시스템(사람들 탭)·Supabase 선행이라 Phase 2 —
// 지금은 본인 아바타만 표시.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Image, Alert,
} from 'react-native';
import { CalendarCheck, Mail } from 'lucide-react-native';
import { useProfile } from '@/store/profile';
import { useSwimSchedules, dateKey } from '@/store/swimSchedule';
import { isBundleAvatar, BUNDLE_AVATARS } from '@/lib/avatars';
import { tokens } from '@/styles/tokens';
import { WeekCalendar } from './WeekCalendar';
import { AddScheduleSheet } from './AddScheduleSheet';

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = DOW_KR[new Date(y, m - 1, d).getDay()];
  return `${y}년 ${m}월 ${d}일 ${dow}요일`;
}

export function CalendarTab() {
  const profile = useProfile((s) => s.profile);
  const schedules = useSwimSchedules((s) => s.schedules);
  const remove = useSwimSchedules((s) => s.remove);
  const [date, setDate] = React.useState(new Date());
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const markedKeys = React.useMemo(
    () => new Set(schedules.map((s) => s.date)),
    [schedules],
  );
  const selKey = dateKey(date);
  const dayList = schedules
    .filter((s) => s.date === selKey)
    .sort((a, b) => a.start.localeCompare(b.start));

  const onCancel = (id: string) => {
    Alert.alert('수영 취소', '이 수영 일정을 취소할까요?', [
      { text: '닫기', style: 'cancel' },
      { text: '취소하기', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calBox}>
          <WeekCalendar
            selectedDate={date}
            onSelectDate={setDate}
            markedKeys={markedKeys}
          />
        </View>

        {dayList.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              이 날짜에 등록된 수영 일정이 없어요.
            </Text>
          </View>
        ) : (
          dayList.map((s) => (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.cardHeadText}>
                  <Text style={styles.poolName}>{s.poolName}</Text>
                  <View style={styles.metaRow}>
                    <CalendarCheck size={16} color={tokens.color.ink500} />
                    <Text style={styles.metaText}>{formatDate(s.date)}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      {s.start} ~ {s.end}
                    </Text>
                  </View>
                </View>
                {s.poolPhotoUrl ? (
                  <Image
                    source={{ uri: s.poolPhotoUrl }}
                    style={styles.thumb}
                  />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]} />
                )}
              </View>

              {/* 참여자 — 본인만 (친구/모르는사람은 Phase 2) */}
              <View style={styles.meRow}>
                <View style={styles.avatarSm}>
                  {isBundleAvatar(profile?.photoUri) ? (
                    React.createElement(BUNDLE_AVATARS[profile.photoUri], {
                      width: 28,
                      height: 28,
                    })
                  ) : profile?.photoUri ? (
                    <Image
                      source={{ uri: profile.photoUri }}
                      style={styles.avatarSmImg}
                    />
                  ) : (
                    <View style={styles.avatarSmImg} />
                  )}
                </View>
                <Text style={styles.meName}>내 닉네임</Text>
              </View>

              <View style={styles.cardBtns}>
                <Pressable
                  onPress={() => onCancel(s.id)}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.cancelLabel}>수영 취소</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      '친구 초대',
                      '친구 초대는 친구 기능 준비 후 제공됩니다.',
                    )
                  }
                  style={({ pressed }) => [
                    styles.inviteBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.inviteLabel}>친구 초대</Text>
                  <Mail size={18} color={tokens.color.black} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.addLabel}>수영 일정 추가</Text>
          <CalendarCheck size={20} color={tokens.color.black} strokeWidth={2} />
        </Pressable>
      </View>

      <AddScheduleSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
  calBox: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.lineDefault,
  },

  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyText: {
    fontSize: 14,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },

  card: {
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    backgroundColor: tokens.color.white,
  },
  cardHead: { flexDirection: 'row', gap: 12 },
  cardHeadText: { flex: 1, gap: 6 },
  poolName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  thumb: { width: 72, height: 56, borderRadius: 12, backgroundColor: '#E2E8F0' },
  thumbEmpty: { backgroundColor: '#E2E8F0' },

  meRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarSm: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmImg: { width: 28, height: 28 },
  meName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
  },

  cardBtns: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  inviteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
  },
  inviteLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.color.lineDefault,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
  },
  addLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});
