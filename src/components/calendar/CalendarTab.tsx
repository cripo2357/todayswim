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
  isSchedulePast,
  type ScheduleVisibility,
} from '@/store/swimSchedule';
import { isBundleAvatar, BUNDLE_AVATARS } from '@/lib/avatars';
import { usePrefs } from '@/store/prefs';
import { resolveParticipants } from '@/lib/scheduleParticipants';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { WeekCalendar } from './WeekCalendar';
import { AddScheduleSheet } from './AddScheduleSheet';
import { OptionSheet, type Option } from '@/components/ui/OptionSheet';

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

const VIS_LABEL: Record<ScheduleVisibility, string> = {
  private: '비공개',
  friends: '친구에게만 공개',
  public: '전체 공개',
};
// 일정 관리 시트 액션 — 공개여부 3종 + 일정 취소(맨 위)
type ManageAction = ScheduleVisibility | 'cancel';
const MANAGE_OPTIONS: Option<ManageAction>[] = [
  { value: 'cancel', label: '일정 취소' },
  { value: 'private', label: VIS_LABEL.private },
  { value: 'friends', label: VIS_LABEL.friends },
  { value: 'public', label: VIS_LABEL.public },
];

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
  const setVisibility = useSwimSchedules((s) => s.setVisibility);
  const viewPref = usePrefs((s) => s.othersScheduleView);
  const [date, setDate] = React.useState(new Date());
  const [sheetOpen, setSheetOpen] = React.useState(false);
  // 공개여부 변경 시트 대상 일정 id (null = 닫힘)
  const [visEditId, setVisEditId] = React.useState<string | null>(null);
  // 시간표 더블탭(프리필) 진입은 전역 GlobalAddScheduleSheet가 처리 —
  // 여기 시트는 "수영 일정 추가" 버튼의 수동 추가 전용(빈 상태).

  const markedKeys = React.useMemo(
    () => new Set(schedules.map((s) => s.date)),
    [schedules],
  );
  const selKey = dateKey(date);
  const dayList = schedules
    .filter((s) => s.date === selKey)
    .sort((a, b) => a.start.localeCompare(b.start));

  const myName = profile?.name?.trim() || '내 닉네임';

  // 달력 조회 범위: 지난 6개월 ~ 앞으로 90일 (무제한 아님)
  const calMin = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - 6);
    return d;
  }, []);
  const calMax = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 90);
    return d;
  }, []);

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
            minDate={calMin}
            maxDate={calMax}
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
                  {(() => {
                    const past = isSchedulePast(s);
                    return (
                      <Pressable
                        onPress={() => !past && setVisEditId(s.id)}
                        disabled={past}
                        style={[styles.visChip, past && styles.visChipDisabled]}
                        accessibilityRole="button"
                        accessibilityLabel="일정 공개여부 변경"
                        accessibilityState={{ disabled: past }}
                      >
                        <Text
                          style={[
                            styles.visChipLabel,
                            past && styles.visChipLabelDisabled,
                          ]}
                        >
                          {VIS_LABEL[s.visibility]}
                        </Text>
                        <ChevronDown
                          size={12}
                          color={past ? tokens.color.ink400 : tokens.color.pdBlue}
                          strokeWidth={2}
                        />
                      </Pressable>
                    );
                  })()}
                </View>
                {s.poolPhotoUrl ? (
                  <Image source={{ uri: s.poolPhotoUrl }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]} />
                )}
              </View>

              <View style={styles.divider} />

              {/* 참여자 — Figma 120:3156. 같은 슬롯 참여자를 공개여부·관계·
                  내 설정으로 필터. 비공개=나만 / 친구공개=나+친구+초대 /
                  전체공개=+다른사람(설정 '다른 사람 일정 보기' 시) */}
              {(() => {
                const pg = resolveParticipants(s, viewPref);
                return (
                  <View style={styles.participants}>
                    {/* 나 */}
                    <View style={styles.ptCell}>
                      <View style={[styles.ptAvatar, styles.ptAvatarMine]}>
                        {isBundleAvatar(profile?.photoUri) ? (
                          React.createElement(
                            BUNDLE_AVATARS[profile.photoUri],
                            { width: 24, height: 24 },
                          )
                        ) : profile?.photoUri ? (
                          <Image
                            source={{ uri: profile.photoUri }}
                            style={styles.ptAvatarImg}
                          />
                        ) : (
                          <User
                            size={12}
                            color={tokens.color.ink400}
                            strokeWidth={2}
                          />
                        )}
                      </View>
                      <Text style={styles.ptName} numberOfLines={1}>
                        {myName}
                      </Text>
                    </View>

                    {/* 친구 섹션 (비공개 아니면) — 친구 + 친구초대(마지막) */}
                    {pg.showInvite ? (
                      <>
                        <View style={styles.divider} />
                        <View style={styles.ptGrid}>
                          {pg.friends.map((o) => (
                            <View key={o.id} style={styles.ptCell}>
                              <View style={styles.ptAvatar}>
                                {React.createElement(
                                  BUNDLE_AVATARS[o.avatar],
                                  { width: 24, height: 24 },
                                )}
                              </View>
                              <Text style={styles.ptName} numberOfLines={1}>
                                {o.name}
                              </Text>
                            </View>
                          ))}
                          <Pressable
                            onPress={() =>
                              navigation.navigate('InviteScheduleSelect')
                            }
                            style={styles.ptCell}
                            accessibilityRole="button"
                            accessibilityLabel="친구 초대"
                          >
                            <View style={styles.ptInviteAvatar}>
                              <Plus
                                size={13}
                                color={tokens.color.pdMint}
                                strokeWidth={2.4}
                              />
                            </View>
                            <Text
                              style={styles.ptInviteName}
                              numberOfLines={1}
                            >
                              친구 초대
                            </Text>
                          </Pressable>
                        </View>
                      </>
                    ) : null}

                    {/* 다른 사람 섹션 (전체공개 + 설정 '다른 사람 일정 보기') */}
                    {pg.others.length > 0 ? (
                      <>
                        <View style={styles.divider} />
                        <View style={styles.ptGrid}>
                          {pg.others.map((o) => (
                            <View key={o.id} style={styles.ptCell}>
                              <View style={styles.ptAvatar}>
                                {React.createElement(
                                  BUNDLE_AVATARS[o.avatar],
                                  { width: 24, height: 24 },
                                )}
                              </View>
                              <Text style={styles.ptName} numberOfLines={1}>
                                {o.name}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </>
                    ) : null}
                  </View>
                );
              })()}
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
        initialDate={date}
      />

      {/* 일정 관리 — 지난 일정은 칩 자체가 비활성이라 여기 안 열림.
          '일정 취소' 선택 시 confirm Alert → 삭제, 그 외는 공개여부 변경. */}
      <OptionSheet<ManageAction>
        visible={visEditId !== null}
        onClose={() => setVisEditId(null)}
        title="일정 관리"
        options={MANAGE_OPTIONS}
        value={
          schedules.find((x) => x.id === visEditId)?.visibility ?? null
        }
        onConfirm={(v) => {
          if (!visEditId) return;
          if (v === 'cancel') onCancel(visEditId);
          else setVisibility(visEditId, v);
        }}
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
  // 지난 일정 — 공개여부 변경 불가(톤다운, chevron 아이콘은 유지)
  visChipDisabled: { borderColor: tokens.color.ink400 },
  visChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },
  visChipLabelDisabled: { color: tokens.color.ink400 },
  thumb: { width: 80, height: 80, borderRadius: 6, backgroundColor: '#E2E8F0' },
  thumbEmpty: { backgroundColor: '#E2E8F0' },

  divider: { height: 1, backgroundColor: tokens.color.lineDefault },

  // Figma 120:3156 — 참여자 영역(나 / 친구그리드+초대 / 다른사람그리드)
  participants: { gap: 12 },
  // 1행 3명 고정 — 고정폭(px) 대신 정확히 1/3 폭이라 화면 너비와
  // 무관하게 항상 3열(좁은 기기서 2열로 무너지던 버그 해결).
  ptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  ptCell: {
    width: '33.333%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8, // 열 간격(내부 패딩으로 — 1/3 폭 유지)
  },
  ptAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptAvatarMine: {
    borderWidth: 1,
    borderColor: tokens.color.pdByellow,
  },
  ptAvatarImg: { width: 24, height: 24 },
  ptName: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: '#1F2937',
  },
  // 친구 초대 칸 — 참여자 칩과 동일 형태(원형 + ⊕ + 라벨)
  ptInviteAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptInviteName: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdMint,
  },

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
