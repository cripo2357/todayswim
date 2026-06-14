// 수영 일기 작성/수정 화면 — Figma 370:6133.
// 입력(레인·총거리·영법별 회수·실제 시간·노트) → swimCalories 엔진으로 통계/레포트
// 실시간 계산(저장값 아님). 저장 시 공개범위(나만/친구/모두) 선택 → useSwimDiaries.upsert.
// 시간 시트(372:10661)는 후속 — 현재는 일정 슬롯 시간 기본값.

import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Flame, Clock, ChevronDown } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { OptionSheet, type Option } from '@/components/ui/OptionSheet';
import {
  useSwimSchedules,
  type ScheduleVisibility,
} from '@/store/swimSchedule';
import { useSwimDiaries } from '@/store/swimDiary';
import { useProfile } from '@/store/profile';
import {
  computeSwimStats,
  buildSwimReport,
  resolveWeightKg,
  type StrokeKey,
} from '@/lib/swimCalories';
import { tokens } from '@/styles/tokens';
import { formatDateTime } from '@/lib/dateFormat';
import type { RootStackParamList } from '@/navigation/types';
import IconSwim from '@assets/icons/swim.svg';

const NAMED: StrokeKey[] = ['자유형', '배영', '접영', '평형'];
const ALL: StrokeKey[] = ['자유형', '배영', '접영', '평형', '기타'];

const VIS_OPTIONS: Option<ScheduleVisibility>[] = [
  { value: 'private', label: '나만 보기' },
  { value: 'friends', label: '친구들에게 일기 공유' },
  { value: 'public', label: '모든 사람에게 일기 공유' },
];

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function onlyDigits(v: string, max = 4): number | undefined {
  const s = v.replace(/[^0-9]/g, '').slice(0, max);
  return s ? Number(s) : undefined;
}

export function SwimDiaryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { scheduleId } =
    useRoute<RouteProp<RootStackParamList, 'SwimDiary'>>().params;
  const schedule = useSwimSchedules((s) =>
    s.schedules.find((x) => x.id === scheduleId),
  );
  const existing = useSwimDiaries((s) =>
    s.diaries.find((d) => d.scheduleId === scheduleId),
  );
  const upsert = useSwimDiaries((s) => s.upsert);
  const profile = useProfile((s) => s.profile);

  const [start] = React.useState(existing?.start ?? schedule?.start ?? '06:00');
  const [end] = React.useState(existing?.end ?? schedule?.end ?? '07:00');
  const [lane, setLane] = React.useState<number>(existing?.laneLength ?? 25);
  const [totalReps, setTotalReps] = React.useState<number | undefined>(() =>
    existing
      ? Math.round(
          Object.values(existing.reps).reduce((a, b) => a + (b || 0), 0),
        )
      : undefined,
  );
  const [reps, setReps] = React.useState<Partial<Record<StrokeKey, number>>>(
    () => {
      const r: Partial<Record<StrokeKey, number>> = {};
      NAMED.forEach((k) => {
        if (existing?.reps[k]) r[k] = existing.reps[k];
      });
      return r;
    },
  );
  const [note, setNote] = React.useState(existing?.note ?? '');
  const [saveOpen, setSaveOpen] = React.useState(false);

  React.useEffect(() => {
    if (!schedule) navigation.goBack();
  }, [schedule, navigation]);
  if (!schedule) return null;

  const namedSum = NAMED.reduce((a, k) => a + (reps[k] ?? 0), 0);
  const total = Math.max(totalReps ?? namedSum, namedSum);
  const engineReps: Partial<Record<StrokeKey, number>> = {
    ...reps,
    기타: Math.max(0, total - namedSum),
  };
  const weight = profile ? resolveWeightKg(profile) : 63;
  const durationMin = Math.max(0, toMin(end) - toMin(start));
  const stats = computeSwimStats(
    { laneLength: lane, reps: engineReps, durationMin },
    weight,
  );
  const report = buildSwimReport(stats, lane, !!profile?.weight);
  const maxDist = Math.max(1, ...stats.breakdown.map((b) => b.distance));

  const save = (visibility: ScheduleVisibility) => {
    setSaveOpen(false);
    void upsert({
      scheduleId,
      poolId: schedule.poolId,
      poolName: schedule.poolName,
      date: schedule.date,
      start,
      end,
      laneLength: lane,
      reps: engineReps,
      note: note.trim() || undefined,
      visibility,
    });
    navigation.goBack();
  };

  const whenLabel = (() => {
    const [y, m, d] = schedule.date.split('-').map(Number);
    const [hh, mm] = start.split(':').map(Number);
    return formatDateTime(new Date(y, m - 1, d, hh, mm));
  })();
  const durLabel = `${Math.floor(durationMin / 60)}시간${
    durationMin % 60 ? ` ${durationMin % 60}분` : ''
  }`;

  return (
    <ScreenContainer
      withHorizontalPadding={false}
      background={tokens.color.bgPaper}
    >
      <AppHeader title="수영 일기" background={tokens.color.bgPaper} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.cardInfo}>
              <Text style={styles.poolName} numberOfLines={1}>
                {schedule.poolName}
              </Text>
              <Text style={styles.when} numberOfLines={1}>
                {whenLabel}
              </Text>
            </View>
            {schedule.poolPhotoUrl ? (
              <Image
                source={{ uri: schedule.poolPhotoUrl }}
                style={styles.thumb}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <IconSwim width={22} height={22} />
          <Text style={styles.sectionLabel}>수영 기록</Text>
        </View>

        <Text style={styles.fieldLabel}>총 수영 시간</Text>
        <Pressable style={styles.inputBox} accessibilityLabel="수영 시간">
          <Text style={styles.inputValue}>
            {start} ~ {end}
          </Text>
          <Clock size={20} color="#94A3B8" strokeWidth={2} />
        </Pressable>

        <Text style={[styles.fieldLabel, styles.mt16]}>총 수영 거리</Text>
        <View style={styles.distRow}>
          <Pressable
            style={styles.laneBox}
            onPress={() => setLane((l) => (l === 25 ? 50 : 25))}
            accessibilityLabel="레인 길이"
          >
            <Text style={styles.inputValue}>{lane}m</Text>
            <ChevronDown size={20} color="#94A3B8" strokeWidth={2} />
          </Pressable>
          <View style={styles.repBox}>
            <TextInput
              value={totalReps != null ? String(totalReps) : ''}
              onChangeText={(v) => setTotalReps(onlyDigits(v))}
              keyboardType="number-pad"
              placeholder="00"
              placeholderTextColor="#94A3B8"
              style={styles.repInput}
              maxLength={4}
            />
            <Text style={styles.unit}>회</Text>
          </View>
        </View>

        <View style={[styles.strokeRow, styles.mt16]}>
          {NAMED.map((k) => (
            <View key={k} style={styles.strokeCell}>
              <Text style={styles.strokeLabel}>{k}</Text>
              <View style={styles.strokeBox}>
                <TextInput
                  value={reps[k] != null ? String(reps[k]) : ''}
                  onChangeText={(v) =>
                    setReps((r) => ({ ...r, [k]: onlyDigits(v) }))
                  }
                  keyboardType="number-pad"
                  placeholder="00"
                  placeholderTextColor="#94A3B8"
                  style={styles.strokeInput}
                  maxLength={4}
                />
                <Text style={styles.strokeUnit}>회</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.statCard, styles.mt24]}>
          <View style={styles.statTop}>
            <View style={styles.stat}>
              <IconSwim width={20} height={20} />
              <Text style={styles.statValue}>
                {stats.totalDistance.toLocaleString()}m
              </Text>
              <Text style={styles.statLabel}>거리</Text>
            </View>
            <View style={styles.stat}>
              <Flame size={20} color={tokens.color.red} strokeWidth={2} />
              <Text style={styles.statValue}>{stats.kcal}kcal</Text>
              <Text style={styles.statLabel}>칼로리</Text>
            </View>
            <View style={styles.stat}>
              <Clock size={20} color={tokens.color.pdBlue} strokeWidth={2} />
              <Text style={styles.statValue}>{durLabel}</Text>
              <Text style={styles.statLabel}>시간</Text>
            </View>
          </View>
          <View style={styles.breakdown}>
            {ALL.map((k) => {
              const dist =
                stats.breakdown.find((b) => b.stroke === k)?.distance ?? 0;
              return (
                <View key={k} style={styles.bdRow}>
                  <View style={styles.bdLabelWrap}>
                    <View
                      style={[
                        styles.bdBar,
                        { width: `${Math.round((dist / maxDist) * 100)}%` },
                        dist === 0 && styles.bdBarEmpty,
                      ]}
                    />
                    <View style={styles.bdLabelRow}>
                      <IconSwim width={16} height={16} />
                      <Text style={styles.bdLabel}>{k}</Text>
                    </View>
                  </View>
                  <Text style={styles.bdDist}>{dist.toLocaleString()}m</Text>
                </View>
              );
            })}
          </View>
        </View>

        {report ? (
          <View style={styles.mt16}>
            <Text style={styles.reportMain}>{report.main}</Text>
            <Text style={styles.reportNote}>{report.note}</Text>
          </View>
        ) : null}

        <Text style={[styles.fieldLabel, styles.mt24]}>수영 노트</Text>
        <View style={styles.noteBox}>
          <TextInput
            value={note}
            onChangeText={(v) => setNote(v.slice(0, 300))}
            placeholder="오늘 수영에서 느낀 점을 기록하세요."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={300}
            style={styles.noteInput}
          />
          <Text style={styles.noteCount}>{note.length}/300</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => setSaveOpen(true)}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="수영 일기 작성"
        >
          <Text style={styles.ctaLabel}>수영 일기 작성</Text>
        </Pressable>
      </View>

      <OptionSheet<ScheduleVisibility>
        visible={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="수영 일기 공개 범위"
        options={VIS_OPTIONS}
        value={existing?.visibility ?? schedule.visibility}
        onConfirm={save}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 8, paddingBottom: 24 },
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    ...tokens.shadow.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardInfo: { flex: 1, gap: 4 },
  poolName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  when: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#E2E8F0' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  inputValue: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  distRow: { flexDirection: 'row', gap: 8 },
  laneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 96,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  repBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  repInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
    padding: 0,
    textAlign: 'right',
  },
  unit: {
    marginLeft: 6,
    fontSize: 16,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  strokeRow: { flexDirection: 'row', gap: 8 },
  strokeCell: { flex: 1, gap: 6 },
  strokeLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  strokeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  strokeInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
    padding: 0,
    textAlign: 'right',
  },
  strokeUnit: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  statCard: {
    backgroundColor: tokens.color.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    ...tokens.shadow.lg,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  statLabel: { fontSize: 12, fontFamily: tokens.font.sans, color: '#94A3B8' },
  breakdown: { gap: 8 },
  bdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bdLabelWrap: { flex: 1, justifyContent: 'center', minHeight: 24 },
  bdBar: {
    position: 'absolute',
    left: 0,
    height: 20,
    borderRadius: 6,
    backgroundColor: tokens.color.pdByellow,
  },
  bdBarEmpty: { backgroundColor: 'transparent' },
  bdLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  bdLabel: {
    fontSize: 14,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  bdDist: { fontSize: 14, fontFamily: tokens.font.sans, color: '#4B5563' },
  reportMain: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  reportNote: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: tokens.font.sans,
    color: '#94A3B8',
  },
  noteBox: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    padding: 12,
  },
  noteInput: {
    fontSize: 16,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
    padding: 0,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  noteCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    fontFamily: tokens.font.sans,
    color: '#94A3B8',
  },
  footer: { padding: 16, backgroundColor: tokens.color.bgPaper },
  cta: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 16,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});