// 작성된 일기의 인라인 요약 — 달력 카드(Figma 372:11773). 노트 + 통계(거리/kcal/시간)
// + 영법별 거리 막대. 저장값 아닌 입력값으로 swimCalories 재계산.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Clock } from 'lucide-react-native';
import { useProfile } from '@/store/profile';
import {
  computeSwimStats,
  resolveWeightKg,
  type StrokeKey,
} from '@/lib/swimCalories';
import type { SwimDiary } from '@/store/swimDiary';
import { tokens } from '@/styles/tokens';
import IconSwim from '@assets/icons/swim.svg';

const ALL: StrokeKey[] = ['자유형', '배영', '접영', '평형', '기타'];
function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function DiarySummary({ diary }: { diary: SwimDiary }) {
  const profile = useProfile((s) => s.profile);
  const weight = profile ? resolveWeightKg(profile) : 63;
  const durationMin = Math.max(0, toMin(diary.end) - toMin(diary.start));
  const stats = computeSwimStats(
    { laneLength: diary.laneLength, reps: diary.reps, durationMin },
    weight,
  );
  const maxDist = Math.max(1, ...stats.breakdown.map((b) => b.distance));
  const durLabel = `${Math.floor(durationMin / 60)}시간${
    durationMin % 60 ? ` ${durationMin % 60}분` : ''
  }`;

  return (
    <View style={styles.root}>
      {diary.note ? <Text style={styles.note}>{diary.note}</Text> : null}
      <View style={styles.statRow}>
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
      <View style={styles.bars}>
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
  );
}

const styles = StyleSheet.create({
  root: { gap: 12, paddingTop: 4 },
  note: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  statLabel: { fontSize: 12, fontFamily: tokens.font.sans, color: '#94A3B8' },
  bars: { gap: 8 },
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
});