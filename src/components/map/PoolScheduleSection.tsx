// 풀 카드 하단 일정 카드 섹션 (Figma 265:3158).
//
// 표시 규칙 (lib/poolScheduleSlots):
//  · 풀에 있는 모든 슬롯 — 내·친구·사람들 일정 union.
//  · 슬롯당 가시 참여자 ≥ 1 일 때만 카드 노출 (내 prefs 기반).
//  · 카드 안 참여자 칩 = 아바타 + 닉네임. me 우선, 관계별 outline 색.
//  · 내가 미참여 → 카드 상단에 [나도 참여] 버튼 (intent 셋팅 + AddScheduleSheet).
//  · 내가 참여 → 내 프로필 칩이 첫번째 자리.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

import { tokens } from '@/styles/tokens';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/lib/dateFormat';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useFriends } from '@/store/friends';
import { useProfile } from '@/store/profile';
import { usePrefs } from '@/store/prefs';
import { MOCK_OTHER_SCHEDULES } from '@/lib/mockData';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
import {
  buildPoolScheduleSlots,
  type PoolScheduleSlot,
  type VisibleParticipant,
} from '@/lib/poolScheduleSlots';

interface Props {
  poolId: string;
}

export function PoolScheduleSection({ poolId }: Props) {
  const profile = useProfile((s) => s.profile);
  const mySchedules = useSwimSchedules((s) => s.schedules);
  const blockedIds = useFriends((s) => s.blocked);
  const othersScheduleView = usePrefs((s) => s.othersScheduleView);
  const setIntent = useAddScheduleIntent((s) => s.setIntent);

  const slots = React.useMemo(
    () =>
      buildPoolScheduleSlots({
        poolId,
        me: {
          id: profile?.id,
          nickname: profile?.name,
          avatar: profile?.photoUri,
        },
        mySchedules,
        otherSchedules: MOCK_OTHER_SCHEDULES,
        blockedIds,
        othersScheduleView,
      }),
    [poolId, profile?.id, profile?.name, profile?.photoUri, mySchedules, blockedIds, othersScheduleView],
  );

  if (slots.length === 0) return null;

  const onJoin = (slot: PoolScheduleSlot) => {
    // 일정 추가 intent — GlobalAddScheduleSheet 가 시트 자동 오픈.
    // 풀명·사진은 등록 시트가 풀 store 에서 조회.
    setIntent({
      poolId,
      date: slot.date,
      start: slot.start,
      end: slot.end,
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.divider} />
      {slots.map((slot) => (
        <SlotCard
          key={slot.key}
          slot={slot}
          onJoin={!slot.imParticipating ? () => onJoin(slot) : undefined}
        />
      ))}
    </View>
  );
}

function SlotCard({
  slot,
  onJoin,
}: {
  slot: PoolScheduleSlot;
  onJoin?: () => void;
}) {
  // datetime 표기 — YY.MM.DD(요일) 오전/오후 H:MM ([[datetime_format_unified]]).
  // slot.date+start 합쳐 ISO 만들어 dateFormat 에 넘김.
  const isoLike = `${slot.date}T${slot.start}:00`;
  const dateTimeLabel = formatDateTime(isoLike);

  return (
    <View style={styles.slot}>
      <View style={styles.headerRow}>
        <Text style={styles.dateTime}>{dateTimeLabel}</Text>
        {onJoin ? (
          <Pressable
            style={styles.joinBtn}
            onPress={onJoin}
            accessibilityRole="button"
            accessibilityLabel="나도 참여"
          >
            <Plus size={14} color="#1F2937" strokeWidth={2} />
            <Text style={styles.joinLabel}>나도 참여</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.participants}>
        {slot.participants.map((p) => (
          <ParticipantChip key={p.id} p={p} />
        ))}
      </View>
    </View>
  );
}

function ParticipantChip({ p }: { p: VisibleParticipant }) {
  // VisibleParticipant.relation('stranger') → Avatar relation('other') 매핑.
  const avatarRel = p.relation === 'stranger' ? 'other' : p.relation;
  return (
    <View style={styles.chip}>
      <Avatar
        photoUri={p.avatar as string}
        size={24}
        relation={avatarRel}
        borderWidth={1.5}
      />
      <Text style={styles.chipLabel} numberOfLines={1}>
        {p.nickname}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  // 풀 카드 본문과의 시각 구분 — 옅은 가로선.
  divider: {
    height: 1,
    backgroundColor: tokens.color.bgSubtle,
    marginVertical: 4,
  },
  slot: { gap: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  // 날짜·시각 — 12/16 Regular #4B5563 ([[figma_color_token_mismatch]] 톤)
  dateTime: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // [나도 참여] — outline 작은 배지. pdByellow 강조 X (시각 노이즈 회피),
  // 일반 gray outline + plus 아이콘.
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.bgPaper,
  },
  joinLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: tokens.font.sansMedium,
    color: '#1F2937',
  },
  // 참여자 — wrap row. 각 칩 = avatar + nickname 가로 정렬.
  participants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    // 닉네임 클리핑 방지 — 칩 자체에 maxWidth 없이 wrap 으로 처리.
  },
  chipLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: '#1F2937',
    maxWidth: 96,
  },
});
