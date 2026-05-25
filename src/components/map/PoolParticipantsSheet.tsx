// 자유수영 참여자 시트 (Figma 282:4900).
//
// 풀카드 "참여자 보기" 탭 → dim 백드롭 + 70% 뷰포트 높이 시트.
// 헤더: 제목 "자유수영 참여자" + 풀 이름 subtitle + 우측 close X.
// 본문: 슬롯카드(date/time + 참여자 칩) 스크롤 목록.
// 슬롯 데이터는 풀카드와 동일하게 buildPoolScheduleSlots — 가시 규칙 단일 출처.

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Plus } from 'lucide-react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SheetCloseButton } from '@/components/ui/SheetCloseButton';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/lib/dateFormat';
import { tokens } from '@/styles/tokens';
import {
  type PoolScheduleSlot,
  type VisibleParticipant,
} from '@/lib/poolScheduleSlots';

const SHEET_HEIGHT = Math.round(Dimensions.get('window').height * 0.7);

interface Props {
  visible: boolean;
  onClose: () => void;
  /** 헤더 subtitle 로 표시할 풀 이름 (Figma 282:5921). */
  poolName: string;
  slots: PoolScheduleSlot[];
  /** 미참여 슬롯에서 "나도 참여" 탭 시 호출 — caller 가 닫고 등록 시트 오픈. */
  onJoinSlot?: (slot: PoolScheduleSlot) => void;
}

export function PoolParticipantsSheet({
  visible,
  onClose,
  poolName,
  slots,
  onJoinSlot,
}: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      height={SHEET_HEIGHT}
      contentStyle={styles.sheetContent}
    >
      {/* Figma 282:5914 — Section Header: 좌 (제목 + 풀명, gap6) / 우 (close X) */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            자유수영 참여자
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {poolName}
          </Text>
        </View>
        <SheetCloseButton onPress={onClose} />
      </View>

      {slots.length === 0 ? (
        <Text style={styles.empty}>표시할 참여자가 없습니다.</Text>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {slots.map((slot) => (
            <SlotCard
              key={slot.key}
              slot={slot}
              onJoin={
                !slot.imParticipating && onJoinSlot
                  ? () => onJoinSlot(slot)
                  : undefined
              }
            />
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

function SlotCard({
  slot,
  onJoin,
}: {
  slot: PoolScheduleSlot;
  onJoin?: () => void;
}) {
  // datetime — YY.MM.DD(요일) 오전/오후 H:MM ([[datetime_format_unified]]).
  const isoLike = `${slot.date}T${slot.start}:00`;
  const dateTimeLabel = formatDateTime(isoLike);

  const me = slot.participants.find((p) => p.relation === 'me');
  const friends = slot.participants.filter((p) => p.relation === 'friend');
  const strangers = slot.participants.filter((p) => p.relation === 'stranger');

  return (
    <View style={styles.slotCard}>
      <View style={styles.headerRow}>
        <Text style={styles.dateTime}>{dateTimeLabel}</Text>
      </View>

      <View style={styles.participantsBlock}>
        <View style={styles.firstRow}>
          {me ? (
            <ParticipantChip p={me} />
          ) : onJoin ? (
            <Pressable
              style={styles.joinBtn}
              onPress={onJoin}
              accessibilityRole="button"
              accessibilityLabel="나도 참여"
            >
              <Text style={styles.joinLabel}>나도 참여</Text>
              <Plus size={12} color={tokens.color.pdBlue} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>

        {friends.length > 0 ? (
          <>
            <View style={styles.innerDivider} />
            <View style={styles.chipWrap}>
              {friends.map((p) => (
                <ParticipantChip key={p.id} p={p} />
              ))}
            </View>
          </>
        ) : null}

        {strangers.length > 0 ? (
          <>
            <View style={styles.innerDivider} />
            <View style={styles.chipWrap}>
              {strangers.map((p) => (
                <ParticipantChip key={p.id} p={p} />
              ))}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

function ParticipantChip({ p }: { p: VisibleParticipant }) {
  const avatarRel = p.relation === 'stranger' ? 'other' : p.relation;
  return (
    <View style={styles.chip}>
      <Avatar
        photoUri={p.avatar as string}
        size={24}
        relation={avatarRel}
        borderWidth={1}
      />
      <Text style={styles.chipLabel} numberOfLines={1}>
        {p.nickname}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // 70% 뷰포트 고정 — caller 내부 ScrollView 가 넘침 처리.
  // BottomSheet 기본 gap24 유지하면 헤더와 스크롤 사이 24 보장.
  sheetContent: { paddingBottom: 0 },

  // Figma 282:5914 — Section Header. row, gap16, items-start.
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  // Figma 282:5915 — flex-1 좌측, gap 6 (제목 ↔ 부제).
  headerText: { flex: 1, gap: 6 },
  // Figma 282:5917 — Bold 18/24 -0.144 #1F2937.
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma 282:5921 — Regular 12/16 -0.06 #1F2937 (pool name).
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },

  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 32,
  },
  // ScrollView 가 BottomSheet 의 고정 height(70%) 내에서 남는 공간을
  // 차지하고 내부 스크롤이 동작하려면 flex:1 필수. 없으면 콘텐츠 높이로
  // 자체 사이징 → 시트 밖으로 빠지거나 스크롤 비활성.
  scroll: { flex: 1 },
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },

  // Figma 282:5063/5064 — 슬롯카드: white bg + p16 + radius16 + shadow lg.
  slotCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...tokens.shadow.lg,
  },
  // Figma 282:5065 — header (dateTime 한 줄).
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  // Figma 282:5066 — Regular 12/16 -0.06 #1F2937.
  dateTime: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  // Figma 282:5067 — 참여자 블록 column gap 7.
  participantsBlock: { gap: 7 },
  firstRow: { flexDirection: 'row', alignItems: 'center' },
  // Figma 282:5369 — Badge Text: pd-blue outline + plus icon.
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
    backgroundColor: tokens.color.bgPaper,
  },
  joinLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },
  // Figma 282:5101 — hairline divider Gray/30 #CBD5E1.
  innerDivider: { height: 1, backgroundColor: '#CBD5E1' },
  // Figma 282:5102/5232 — wrap, gap 7. 3열 고정 (88×3 + 7×2 = 278 ≤ 311 콘텐츠폭).
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  // Figma 282:5069 등 — chip width 88, gap 4. (풀카드 안 nested 가 아니라 모달이라 88 유지)
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 88 },
  // Figma 282:5100 — Bold 10/14 -0.04 #1F2937.
  chipLabel: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
});
