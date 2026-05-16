// 내 정보 > 달력 탭 — Figma 120:3156.
// 주간 캘린더 + 선택일의 내 수영 일정 카드(공개범위 칩 + 참여자 + 친구 초대) + "수영 일정 추가".
//
// 친구/공개범위 실동작은 친구 시스템·Supabase 선행이라 Phase 2 —
// 공개범위 칩은 현재 값 표시(탭 inert), 참여자는 본인만, 친구 초대는 초대 플로우로 이동.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarCheck, ChevronDown, Plus, User } from 'lucide-react-native';
import { useProfile } from '@/store/profile';
import {
  useSwimSchedules,
  dateKey,
  type ScheduleVisibility,
} from '@/store/swimSchedule';
import { isBundleAvatar, BUNDLE_AVATARS } from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { WeekCalendar } from './WeekCalendar';
import { AddScheduleSheet } from './AddScheduleSheet';

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

const VIS_LABEL: Record<ScheduleVisibility, string> = {
  private: '일정 비공개',
  friends: '친구에게만 일정 공개',
  public: '모두에게 공개',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = DOW_KR[new Date(y, m - 1, d).getDay()];
  return `${y}년 ${m}월 ${d}일 ${dow}요일`;
}

export function CalendarTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

  const myName = profile?.name?.trim() || '내 닉네임';

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
            <Pressable
              key={s.id}
              onLongPress={() => onCancel(s.id)}
              style={styles.card}
            >
              {/* 상단: 풀명/일시/공개범위 + 썸네일 */}
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.poolName} numberOfLines={1}>
                    {s.poolName}
                  </Text>
                  <Text style={styles.when} numberOfLines={1}>
                    {formatDate(s.date)}, {s.start} ~ {s.end}
                  </Text>
                  <View style={styles.visChip}>
                    <Text style={styles.visChipLabel}>
                      {VIS_LABEL[s.visibility]}
                    </Text>
                    <ChevronDown
                      size={12}
                      color={tokens.color.pdBlue}
                      strokeWidth={2}
                    />
                  </View>
                </View>
                {s.poolPhotoUrl ? (
                  <Image source={{ uri: s.poolPhotoUrl }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]} />
                )}
              </View>

              <View style={styles.divider} />

              {/* 참여자 — 본인 + 친구 초대 (친구 목록은 Phase 2) */}
              <View style={styles.people}>
                <View style={styles.miniRow}>
                  <View style={[styles.miniAvatar, styles.miniMine]}>
                    {isBundleAvatar(profile?.photoUri) ? (
                      React.createElement(BUNDLE_AVATARS[profile.photoUri], {
                        width: 22,
                        height: 22,
                      })
                    ) : profile?.photoUri ? (
                      <Image
                        source={{ uri: profile.photoUri }}
                        style={styles.miniAvatarImg}
                      />
                    ) : (
                      <User
                        size={12}
                        color={tokens.color.ink400}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <Text style={styles.miniName} numberOfLines={1}>
                    {myName}
                  </Text>
                </View>

                <Pressable
                  onPress={() => navigation.navigate('InviteScheduleSelect')}
                  style={styles.inviteChip}
                >
                  <Plus size={14} color={tokens.color.pdMint} strokeWidth={2.4} />
                  <Text style={styles.inviteChipLabel}>친구 초대</Text>
                </Pressable>
              </View>
            </Pressable>
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

  // Figma 120:3156 일정 카드 — white r16 p16 Shadow/lg
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  cardInfo: { flex: 1, gap: 8 },
  poolName: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  when: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  visChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  visChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },
  thumb: { width: 80, height: 80, borderRadius: 6, backgroundColor: '#E2E8F0' },
  thumbEmpty: { backgroundColor: '#E2E8F0' },

  divider: { height: 1, backgroundColor: tokens.color.lineDefault },

  people: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMine: { borderColor: tokens.color.pdByellow },
  miniAvatarImg: { width: 22, height: 22 },
  miniName: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  inviteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inviteChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdMint,
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
