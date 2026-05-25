// 풀 카드 하단 일정 카드 섹션 (Figma 265:3822 / 슬롯카드 266:5770).
//
// 표시 규칙 (lib/poolScheduleSlots):
//  · 풀에 있는 모든 슬롯 — 내·친구·사람들 일정 union.
//  · 슬롯당 가시 참여자 ≥ 1 일 때만 카드 노출 (내 prefs 기반).
//  · 슬롯카드 = 자체 white bg + shadow lg + radius 16 (풀카드 안 nested).
//  · 카드 안 구조 (Figma 266:5772):
//     - dateTime header (12/16 Regular #1F2937)
//     - 1행: me 칩 (참여중) OR [나도 참여] pd-blue 배지 (미참여)
//     - hairline divider (lineSubtle)
//     - 친구 칩 wrap (있을 때만 — divider+wrap 쌍)
//     - hairline divider (lineSubtle)
//     - 비친구 칩 wrap (있을 때만 — divider+wrap 쌍)
//  · 칩 = 아바타 24(border=관계색,1px) + 닉네임 Bold 10/14 #1F2937, w 88 numberOfLines 1.

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
    setIntent({
      poolId,
      date: slot.date,
      start: slot.start,
      end: slot.end,
    });
  };

  return (
    <View style={styles.section}>
      {/* 풀카드 본문과의 시각 구분 — 옅은 가로선 (Figma 266:3895) */}
      <View style={styles.outerDivider} />
      <View style={styles.cardsList}>
        {slots.map((slot) => (
          <SlotCard
            key={slot.key}
            slot={slot}
            onJoin={!slot.imParticipating ? () => onJoin(slot) : undefined}
          />
        ))}
      </View>
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
  const isoLike = `${slot.date}T${slot.start}:00`;
  const dateTimeLabel = formatDateTime(isoLike);

  // 관계별 그룹 — me 한 명 + friends wrap + strangers wrap.
  const me = slot.participants.find((p) => p.relation === 'me');
  const friends = slot.participants.filter((p) => p.relation === 'friend');
  const strangers = slot.participants.filter((p) => p.relation === 'stranger');

  return (
    <View style={styles.slotCard}>
      {/* Figma 266:5773 — header (dateTime 만) */}
      <View style={styles.headerRow}>
        <Text style={styles.dateTime}>{dateTimeLabel}</Text>
      </View>

      {/* Figma 266:5775 — 참여자 블록, gap 7. 첫 행에 me 칩 또는 [나도 참여] 배지. */}
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
  // VisibleParticipant.relation('stranger') → Avatar relation('other') 매핑.
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
  section: { gap: 16 },
  // Figma 266:3895 — 풀카드 본문/CTA 와 일정 카드 사이 옅은 hairline.
  outerDivider: {
    height: 1,
    backgroundColor: tokens.color.lineSubtle,
  },
  // Figma 266:6369 — 카드 컨테이너, gap 16 between cards.
  cardsList: { gap: 16 },

  // Figma 266:5770 — 슬롯카드: white bg + p 16 + radius 16 + shadow lg.
  // 풀카드(white) 안 nested 라 그림자가 카드 분리감 만들어줌.
  slotCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...tokens.shadow.lg,
  },

  // Figma 266:5773 — header: dateTime 한 줄.
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Figma 266:5774 — Plus Jakarta Regular 12/16 -0.06 #1F2937.
  dateTime: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },

  // Figma 266:5775 — 참여자 블록, 그룹 사이 gap 7 (divider 포함).
  participantsBlock: { gap: 7 },

  // Figma 266:5776 — me 칩 / [나도 참여] 배지 위치 한 줄.
  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Figma 266:6747 — pd-blue outline 배지: px 8 py 4 radius 8 border 1.
  // 텍스트 먼저 → plus 아이콘 (Figma 266:6749 frame 순서).
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
  // Figma 266:6751 — Plus Jakarta Medium 12/16 -0.06 #6890CB.
  joinLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },

  // Figma 266:5808/5938/6467/6601 — 그룹 사이 hairline.
  innerDivider: {
    height: 1,
    backgroundColor: tokens.color.lineSubtle,
  },

  // Figma 266:5809/5939 — content-start flex-wrap gap 7.
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  // Figma 266:6389/5810 — 칩: 아바타 24 + 닉네임. Figma 88 이지만 풀카드+슬롯
  // 카드 padding 누적으로 좁은 폰(360dp)에서 3개 안 들어가 80 으로 축소.
  // 80*3 + 7*2 = 254 → 360dp 폰 슬롯 content 264 안에 들어감.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  // Figma 266:6420 — Plus Jakarta Bold 10/14 -0.04 #1F2937. numberOfLines 1.
  chipLabel: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
});
