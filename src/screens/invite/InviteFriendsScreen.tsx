// Figma 150:8692 / 154:3850 — 친구 초대 (일정 확정 상태 → 초대 대상만 추가).
// 바텀시트: "초대 일정" 카드(읽기전용) + "초대 친구" 멀티선택 + 초대장 보내기.
// 일정 선택 단계 없음(이미 확정). 백엔드 미연동 — 친구 풀은 mockData.

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail } from 'lucide-react-native';

import type { RootStackParamList } from '@/navigation/types';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import { SearchMultiSelect } from '@/components/ui/SearchMultiSelect';
import { MOCK_FRIENDS, type MockAccount } from '@/lib/mockData';
import { BUNDLE_AVATARS } from '@/lib/avatars';
import { tokens } from '@/styles/tokens';

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

/** "2026년 1월 23일 목요일, 오전 3시10분" (일정 확정 — date + 시작시각 12h) */
function formatScheduleLine(iso: string, start: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = DOW_KR[new Date(y, m - 1, d).getDay()];
  const [hhStr, mm] = start.split(':');
  const hh = Number(hhStr);
  const ampm = hh < 12 ? '오전' : '오후';
  const h12 = hh % 12 || 12;
  return `${y}년 ${m}월 ${d}일 ${dow}요일, ${ampm} ${h12}시${mm}분`;
}

export function InviteFriendsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { poolName, poolPhotoUrl, date, start } =
    useRoute<RouteProp<RootStackParamList, 'InviteFriends'>>().params;

  const [selected, setSelected] = React.useState<MockAccount[]>([]);

  const send = () => {
    if (selected.length === 0) return;
    navigation.navigate('InviteDone', { count: selected.length });
  };

  return (
    <BottomSheet
      visible
      onClose={() => navigation.goBack()}
      title="친구 초대"
      contentStyle={styles.sheet}
    >
      {/* 초대 일정 — 확정된 일정 카드(읽기 전용) */}
      <View style={styles.section}>
        <Text style={styles.label}>초대 일정</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleInfo}>
            <Text style={styles.poolName} numberOfLines={1}>
              {poolName}
            </Text>
            <Text style={styles.when} numberOfLines={1}>
              {formatScheduleLine(date, start)}
            </Text>
          </View>
          {poolPhotoUrl ? (
            <Image source={{ uri: poolPhotoUrl }} style={styles.thumb} />
          ) : null}
        </View>
      </View>

      {/* 초대 친구 — 멀티선택 (공통 SearchMultiSelect) */}
      <View style={styles.section}>
        <Text style={styles.label}>
          초대 친구{selected.length > 0 ? ` (${selected.length})` : ''}
        </Text>
        <SearchMultiSelect
          items={MOCK_FRIENDS}
          selected={selected}
          onChange={setSelected}
          keyOf={(f) => f.id}
          labelOf={(f) => f.name}
          subLabelOf={(f) => f.status}
          renderAvatar={(f, size) =>
            React.createElement(BUNDLE_AVATARS[f.avatar], {
              width: size,
              height: size,
            })
          }
          placeholder="닉네임"
        />
      </View>

      <SheetCtaButton
        label="초대장 보내기"
        onPress={send}
        disabled={selected.length === 0}
        icon={<Mail size={20} color={tokens.color.black} strokeWidth={2} />}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // BottomSheet 기본 gap 24 유지(섹션 간격)
  sheet: { gap: 24 },
  section: { gap: 8 },
  // Figma 150:9110 — SemiBold 14/20 -0.084 #4B5563
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  // Figma 150:9129 — 흰 카드 r16 h72 p16 Shadow/lg (보더 없음)
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 72,
    padding: 16,
    borderRadius: 16,
    backgroundColor: tokens.color.white,
    ...tokens.shadow.lg,
  },
  scheduleInfo: { flex: 1, gap: 4 },
  // Figma 150:9134 — Bold 14/20 -0.084 #1F2937
  poolName: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma 150:9136 — Regular 12/16 -0.06 #1F2937
  when: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  // Figma 150:9137 — image 40x40 r6
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
});
