// Figma 90:6622 — 내 수영 수업시간 등록.
// 요일별(월~일) 수업 시간 알약 + 추가(+) 버튼. + 탭 → 시간 입력 시트.
// 변경은 로컬 작업본에 누적, [뒤로가기](헤더/하드웨어/스와이프) 시 프로필 저장.
//
// 목적: 정보 전용 — 친구가 프로필 보고 초대 시 참고. 시스템 연동 없음.

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle, Plus } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { useProfile, type SwimClass } from '@/store/profile';
import type { DayOfWeek } from '@/types/schedule';
import type { RootStackParamList } from '@/navigation/types';
import { DAY_ORDER, genSwimClassId, formatTimeRange, groupByDay } from '@/lib/swimClass';
import { SwimClassTimeSheet } from '@/components/profile/SwimClassTimeSheet';
import { tokens } from '@/styles/tokens';

export function SwimClassRegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);

  const [classes, setClasses] = React.useState<SwimClass[]>(
    profile?.swimClasses ?? [],
  );
  // 시간 입력 시트 대상 요일 (null = 닫힘)
  const [sheetDay, setSheetDay] = React.useState<DayOfWeek | null>(null);

  // [뒤로가기](헤더/하드웨어/스와이프) 시 변경분 프로필 저장.
  const classesRef = React.useRef(classes);
  classesRef.current = classes;
  React.useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      const cur = useProfile.getState().profile;
      if (!cur) return;
      saveProfile({ ...cur, swimClasses: classesRef.current });
    });
    return unsub;
  }, [navigation, saveProfile]);

  const grouped = groupByDay(classes);

  const addClass = (day: DayOfWeek, start: string, end: string) => {
    setClasses((prev) => [
      ...prev,
      { id: genSwimClassId(), day, start, end },
    ]);
  };
  const removeClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ScreenContainer withHorizontalPadding={false} background={tokens.color.bgPaper}>
      <AppHeader background={tokens.color.bgPaper} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>수업 시간을 등록하세요.</Text>

        {DAY_ORDER.map((day) => (
          <View key={day} style={styles.daySection}>
            <Text style={styles.dayLabel}>{day}요일</Text>
            <View style={styles.pillWrap}>
              {grouped[day].map((c) => (
                <View key={c.id} style={styles.pill}>
                  <Text style={styles.pillText} numberOfLines={1}>
                    {formatTimeRange(c)}
                  </Text>
                  <Pressable
                    onPress={() => removeClass(c.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${day}요일 ${formatTimeRange(c)} 삭제`}
                  >
                    <XCircle size={20} color="#4B5563" strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={() => setSheetDay(day)}
                style={({ pressed }) => [
                  styles.addBtn,
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${day}요일 수업 시간 추가`}
              >
                <Plus size={18} color="#94A3B8" strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <SwimClassTimeSheet
        visible={sheetDay !== null}
        day={sheetDay ?? '월'}
        onConfirm={(start, end) => {
          if (sheetDay) addClass(sheetDay, start, end);
        }}
        onClose={() => setSheetDay(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 32 },
  // Figma I166:8280 — Bold 30/38 -0.39 #1F2937
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
    marginBottom: 0,
  },
  // Figma 90:6648 — Section Header + 알약 wrap, gap 12
  daySection: { gap: 12 },
  // Figma I90:6649 — Bold 16/22 -0.112 #1F2937
  dayLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  // Figma 90:6651 — border #CBD5E1 r12 px16 py10 w156
  pill: {
    width: 156,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  // Figma 90:6653 — SemiBold 14/20 -0.084 #4B5563
  pillText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  // Figma 101:5818 — bg pd-bgray r10 40x40
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.color.pdBgray,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
