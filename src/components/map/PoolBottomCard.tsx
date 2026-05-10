import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import type { Pool } from '@/types/pool';
import { tokens } from '@/styles/tokens';
import Swimmer from '@assets/icons/swimmer.svg';
import ArrowH from '@assets/icons/arrow-horizontal.svg';
import ArrowV from '@assets/icons/arrow-vertical.svg';
import MapPin from '@assets/icons/map-pin.svg';

interface Props {
  pool: Pool;
  /** 시간표 데이터 존재 여부 — 있으면 1버튼 "보기", 없으면 2버튼 split (작성/정보없음) */
  hasSchedule: boolean;
  /** 우상단 핀 버튼: 외부 지도앱으로 길찾기 */
  onPressDirections?: () => void;
  onPressScheduleAction?: () => void;
}

/**
 * 메인 지도 화면 하단의 풀 정보 카드.
 * Figma 5:11479 (small/has) / 5:19049 (big 50m+) / 5:12919 (small/no-schedule split).
 */
export function PoolBottomCard({
  pool,
  hasSchedule,
  onPressDirections,
  onPressScheduleAction,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.textCol}>
          <Text style={styles.name} numberOfLines={1}>{pool.name}</Text>
          <Text style={styles.addr}>{pool.address}</Text>
          {pool.phone ? <Text style={styles.phone}>{pool.phone}</Text> : null}
          {pool.pricePerSession ? (
            <Text style={styles.price}>
              1회 {pool.pricePerSession.toLocaleString('ko-KR')}원
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onPressDirections}
          style={({ pressed }) => [styles.dirBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="지도앱으로 길찾기"
          hitSlop={6}
        >
          <MapPin width={22} height={22} />
        </Pressable>
      </View>

      <View style={styles.specRow}>
        {pool.laneCount ? (
          <View style={styles.spec}>
            <Swimmer width={20} height={20} />
            <Text style={styles.specText}>{pool.laneCount} 레인</Text>
          </View>
        ) : null}
        {pool.poolLength ? (
          <View style={styles.spec}>
            <ArrowH width={20} height={20} />
            <Text style={styles.specText}>{pool.poolLength}m</Text>
          </View>
        ) : null}
        {pool.depthMin && pool.depthMax ? (
          <View style={styles.spec}>
            <ArrowV width={20} height={20} />
            <Text style={styles.specText}>
              {pool.depthMin}~{pool.depthMax}m
            </Text>
          </View>
        ) : null}
      </View>

      {hasSchedule ? (
        <Button
          label="자유수영 시간표 보기"
          onPress={onPressScheduleAction}
          size="lg"
          variant="primary"
          fullWidth
          style={styles.cta}
        />
      ) : (
        <View style={styles.splitRow}>
          <Pressable
            onPress={onPressScheduleAction}
            style={({ pressed }) => [
              styles.writeBtn,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.writeBtnLabel}>시간표 작성</Text>
          </Pressable>
          <View
            style={styles.noScheduleBtn}
            accessibilityRole="text"
          >
            <Pencil size={14} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.noScheduleLabel}>자유수영 시간표 정보 없음</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: tokens.radius.xl,
    padding: tokens.space[5],
    marginHorizontal: tokens.layout.pagePadMobile,
    marginBottom: tokens.space[4],
    ...tokens.shadow.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  textCol: { flex: 1 },
  name: { ...tokens.text.h3, color: tokens.color.ink900 },
  addr: { ...tokens.text.bodySm, color: tokens.color.ink700, marginTop: tokens.space[1] },
  phone: { ...tokens.text.bodySm, color: tokens.color.ink500 },
  price: { ...tokens.text.bodySm, color: tokens.color.ink700, marginTop: 2 },
  dirBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: tokens.color.brandBlue,
    alignItems: 'center', justifyContent: 'center',
    ...tokens.shadow.md,
  },
  specRow: { flexDirection: 'row', gap: tokens.space[5], marginTop: tokens.space[3] },
  spec: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[1] },
  specText: { ...tokens.text.bodySm, color: tokens.color.ink900 },
  cta: { marginTop: tokens.space[4] },
  splitRow: {
    flexDirection: 'row',
    gap: tokens.space[2],
    marginTop: tokens.space[4],
  },
  writeBtn: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeBtnLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.6,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
  noScheduleBtn: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.md,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.space[1],
  },
  noScheduleLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.4,
    fontFamily: tokens.font.sansSemibold,
    color: '#94A3B8',
  },
});
