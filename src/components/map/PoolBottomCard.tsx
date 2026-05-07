import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Waves, MoveHorizontal, MoveVertical, Navigation, Pencil, Heart } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import type { Pool } from '@/types/pool';
import { tokens } from '@/styles/tokens';

interface Props {
  pool: Pool;
  /** 시간표 데이터 존재 여부 — 있으면 "보기", 없으면 "작성하기" 버튼 */
  hasSchedule: boolean;
  /** 찜 여부 (시각적 강조) */
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onPressDirections?: () => void;
  onPressScheduleAction?: () => void;
}

/**
 * 메인 지도 화면 하단의 풀 정보 카드.
 *
 * Figma 5:12919 (작성하기 버튼) + 5:11479 (보기 버튼) + 5:19049 (찜)에서 공통.
 * 마커 탭 시 등장.
 */
export function PoolBottomCard({
  pool, hasSchedule, favorited, onToggleFavorite, onPressDirections, onPressScheduleAction,
}: Props) {
  return (
    <View style={[styles.card, favorited && styles.cardFavorite]}>
      <View style={styles.headerRow}>
        <View style={styles.textCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{pool.name}</Text>
            <Pressable
              onPress={onToggleFavorite}
              hitSlop={8}
              style={({ pressed }) => [styles.heartBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel={favorited ? '찜 해제' : '또 가고 싶은 곳에 담기'}
              accessibilityState={{ selected: !!favorited }}
            >
              <Heart
                size={22}
                color={favorited ? tokens.color.warmCoral : tokens.color.ink400}
                fill={favorited ? tokens.color.warmCoral : 'transparent'}
                strokeWidth={1.8}
              />
            </Pressable>
          </View>
          <Text style={styles.addr}>{pool.address}</Text>
          {pool.phone ? <Text style={styles.phone}>{pool.phone}</Text> : null}
        </View>
        <Pressable
          onPress={onPressDirections}
          style={({ pressed }) => [styles.dirBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="길찾기"
        >
          <Navigation size={22} color={tokens.color.white} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.specRow}>
        {pool.laneCount ? (
          <View style={styles.spec}>
            <Waves size={16} color={tokens.color.ink900} strokeWidth={1.8} />
            <Text style={styles.specText}>{pool.laneCount} 레인</Text>
          </View>
        ) : null}
        {pool.poolLength ? (
          <View style={styles.spec}>
            <MoveHorizontal size={16} color={tokens.color.ink900} strokeWidth={1.8} />
            <Text style={styles.specText}>{pool.poolLength}m</Text>
          </View>
        ) : null}
        {pool.depthMin && pool.depthMax ? (
          <View style={styles.spec}>
            <MoveVertical size={16} color={tokens.color.ink900} strokeWidth={1.8} />
            <Text style={styles.specText}>
              {pool.depthMin}~{pool.depthMax}m
            </Text>
          </View>
        ) : null}
      </View>

      <Button
        label={hasSchedule ? '자유수영 시간표 보기' : '자유수영 시간표 작성하기'}
        onPress={onPressScheduleAction}
        size="lg"
        variant="primary"
        fullWidth
        iconLeft={
          hasSchedule ? undefined : <Pencil size={18} color={tokens.color.white} strokeWidth={2} />
        }
        style={{ marginTop: tokens.space[4] }}
      />
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
  cardFavorite: {
    borderLeftWidth: 4,
    borderLeftColor: tokens.color.foolYellow,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.space[3],
  },
  textCol: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space[2],
  },
  name: { ...tokens.text.h3, color: tokens.color.ink900, flex: 1 },
  heartBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addr: { ...tokens.text.bodySm, color: tokens.color.ink700, marginTop: tokens.space[1] },
  phone: { ...tokens.text.bodySm, color: tokens.color.ink500 },
  dirBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: tokens.color.pool500,
    alignItems: 'center', justifyContent: 'center',
    ...tokens.shadow.md,
  },
  specRow: { flexDirection: 'row', gap: tokens.space[5], marginTop: tokens.space[3] },
  spec: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[1] },
  specText: { ...tokens.text.bodySm, color: tokens.color.ink900 },
});
