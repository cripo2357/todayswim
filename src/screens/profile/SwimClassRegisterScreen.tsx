// 수영 레슨 장소·시간 등록 — Figma 90:6622.
//
// 모델 변경: 레슨 받는 수영장 1곳(lessonPoolId/Name) + 시간 슬롯 여러 개.
// 흐름: 풀 선택(검색 시트) → "+"로 요일(SwimClassDaySheet)→시간
// (SwimClassTimeSheet) 슬롯 추가 → "수영 레슨 정보 등록"(저장) /
// "레슨을 받지 않습니다"(해제). 공개 시 프로필 노출 + 지도 stack
// (showSwimClasses, mapProfileStacks). 뒤로=취소(저장 안 함).

import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle, Plus, ChevronDown, CalendarX } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { useProfile, type SwimClass } from '@/store/profile';
import { useFavorites } from '@/store/favorites';
import { usePools } from '@/hooks/usePools';
import type { Pool } from '@/types/pool';
import type { DayOfWeek } from '@/types/schedule';
import type { RootStackParamList } from '@/navigation/types';
import { genSwimClassId, groupByDay, DAY_ORDER } from '@/lib/swimClass';
import { SwimClassDaySheet } from '@/components/profile/SwimClassDaySheet';
import { SwimClassTimeSheet } from '@/components/profile/SwimClassTimeSheet';
import {
  BottomSheet,
  SheetCtaButton,
} from '@/components/ui/BottomSheet';
import IconUniversityHat from '@assets/icons/university-hat.svg';
import { tokens } from '@/styles/tokens';

/** 레슨 받는 수영장 검색 시트 (Figma 179:7117 — 검색 + 즐겨찾기 우선). */
function PoolPickerSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (p: Pool) => void;
}) {
  const { data: poolsData } = usePools();
  const favIds = useFavorites((s) => s.ids);
  const [q, setQ] = React.useState('');
  React.useEffect(() => {
    if (!visible) setQ('');
  }, [visible]);

  const list = React.useMemo(() => {
    const pools = poolsData ?? [];
    const query = q.trim().toLowerCase();
    const matched = query
      ? pools.filter((p) => p.name.toLowerCase().includes(query))
      : pools;
    const favSet = new Set(favIds);
    // 즐겨찾기 우선, 그 안에서 이름순
    return [...matched].sort((a, b) => {
      const fa = favSet.has(a.id) ? 0 : 1;
      const fb = favSet.has(b.id) ? 0 : 1;
      return fa - fb || a.name.localeCompare(b.name);
    });
  }, [poolsData, favIds, q]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="레슨 받는 수영장">
      <View style={styles.searchPill}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="수영장 이름"
          placeholderTextColor={tokens.color.ink700}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <ScrollView
        style={styles.poolList}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {list.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              onSelect(p);
              onClose();
            }}
            style={styles.poolRow}
            accessibilityRole="button"
          >
            <View style={styles.poolRowText}>
              <Text style={styles.poolName} numberOfLines={1}>
                {p.name}
                {favIds.includes(p.id) ? '  ❤️' : ''}
              </Text>
              <Text style={styles.poolAddr} numberOfLines={1}>
                {p.address}
              </Text>
            </View>
          </Pressable>
        ))}
        {list.length === 0 ? (
          <Text style={styles.poolEmpty}>검색 결과가 없습니다.</Text>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

export function SwimClassRegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);

  const [poolId, setPoolId] = React.useState<string | undefined>(
    profile?.lessonPoolId,
  );
  const [poolName, setPoolName] = React.useState<string | undefined>(
    profile?.lessonPoolName,
  );
  const [classes, setClasses] = React.useState<SwimClass[]>(
    profile?.swimClasses ?? [],
  );
  const [poolSheet, setPoolSheet] = React.useState(false);
  const [daySheet, setDaySheet] = React.useState(false);
  // 요일 선택 후 시간 시트 대상 요일 (null=시간시트 닫힘)
  const [timeDay, setTimeDay] = React.useState<DayOfWeek | null>(null);

  const grouped = groupByDay(classes);
  const orderedSlots = DAY_ORDER.flatMap((d) => grouped[d]);

  const addClass = (day: DayOfWeek, start: string, end: string) =>
    setClasses((prev) => [...prev, { id: genSwimClassId(), day, start, end }]);
  const removeClass = (id: string) =>
    setClasses((prev) => prev.filter((c) => c.id !== id));

  const canRegister = !!poolId && classes.length > 0;

  const onRegister = () => {
    const cur = useProfile.getState().profile;
    if (!cur || !poolId) return;
    saveProfile({
      ...cur,
      lessonPoolId: poolId,
      lessonPoolName: poolName,
      swimClasses: classes,
    });
    navigation.goBack();
  };

  const onClearLesson = () => {
    const cur = useProfile.getState().profile;
    if (cur) {
      saveProfile({
        ...cur,
        lessonPoolId: undefined,
        lessonPoolName: undefined,
        swimClasses: [],
      });
    }
    navigation.goBack();
  };

  return (
    <ScreenContainer
      withHorizontalPadding={false}
      background={tokens.color.bgPaper}
    >
      <AppHeader background={tokens.color.bgPaper} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          {'수영 레슨 장소와 시간을\n등록하세요.'}
        </Text>

        {/* 레슨 받는 수영장 */}
        <View style={styles.group}>
          <Text style={styles.label}>레슨 받는 수영장</Text>
          <Pressable
            onPress={() => setPoolSheet(true)}
            style={styles.poolField}
            accessibilityRole="button"
            accessibilityLabel="레슨 받는 수영장 선택"
          >
            <Text
              style={[styles.poolFieldText, !poolName && styles.poolFieldPh]}
              numberOfLines={1}
            >
              {poolName ?? '수영장 이름'}
            </Text>
            <ChevronDown size={20} color={tokens.color.ink400} strokeWidth={2} />
          </Pressable>
        </View>

        {/* 레슨 시간 */}
        <View style={styles.group}>
          <Text style={styles.label}>레슨 시간</Text>
          <View style={styles.slotWrap}>
            {orderedSlots.map((c) => (
              <View key={c.id} style={styles.slot}>
                <Text style={styles.slotText} numberOfLines={1}>
                  {c.day}요일 {c.start} ~ {c.end}
                </Text>
                <Pressable
                  onPress={() => removeClass(c.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.day}요일 ${c.start} ~ ${c.end} 삭제`}
                >
                  <XCircle size={20} color={tokens.color.ink700} strokeWidth={2} />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={() => setDaySheet(true)}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="레슨 시간 추가"
            >
              <Plus size={18} color={tokens.color.ink400} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <Pressable
            onPress={onRegister}
            disabled={!canRegister}
            style={({ pressed }) => [
              styles.cta,
              !canRegister && styles.ctaDisabled,
              pressed && canRegister && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[styles.ctaLabel, !canRegister && styles.ctaLabelDisabled]}
            >
              수영 레슨 정보 등록
            </Text>
            <IconUniversityHat width={20} height={20} />
          </Pressable>

          <Pressable
            onPress={onClearLesson}
            style={({ pressed }) => [
              styles.noLesson,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
          >
            <CalendarX size={20} color={tokens.color.pdBlue} strokeWidth={2} />
            <Text style={styles.noLessonText}>레슨을 받지 않습니다.</Text>
          </Pressable>
        </View>
      </ScrollView>

      <PoolPickerSheet
        visible={poolSheet}
        onClose={() => setPoolSheet(false)}
        onSelect={(p) => {
          setPoolId(p.id);
          setPoolName(p.name);
        }}
      />
      <SwimClassDaySheet
        visible={daySheet}
        onConfirm={(d) => {
          setDaySheet(false);
          setTimeDay(d);
        }}
        onClose={() => setDaySheet(false)}
      />
      <SwimClassTimeSheet
        visible={timeDay !== null}
        day={timeDay ?? '월'}
        onConfirm={(start, end) => {
          if (timeDay) addClass(timeDay, start, end);
        }}
        onClose={() => setTimeDay(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 32 },
  // Figma I166:8280 — Bold 30/38 -0.39 #1F2937
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  group: { gap: 8 },
  // Figma 179:5299 — SemiBold 14/20 -0.084 #4B5563
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  // Figma 179:5300 — _InputTextBase: border #94A3B8 r14 minH48 p12
  poolField: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: tokens.color.ink400,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  poolFieldText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  poolFieldPh: { color: tokens.color.ink700 },
  // Figma 179:7190 — 슬롯 wrap (gap 12, 줄바꿈)
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  // Figma 179:7191 — border #CBD5E1 r12 px16 py10
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  slotText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  // Figma 179:7196 — bg pd-bgray r10 40x40
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.color.pdBgray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaWrap: { gap: 24, alignItems: 'center' },
  cta: {
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaDisabled: { backgroundColor: tokens.color.pdBgray },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
  ctaLabelDisabled: { color: tokens.color.pdGray },
  // Figma 179:7282 — calendar-x + pd-blue 텍스트
  noLesson: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noLessonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.pdBlue,
  },
  // PoolPickerSheet
  searchPill: {
    minHeight: 44,
    borderRadius: tokens.radius.pill,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
    padding: 0,
  },
  poolList: { maxHeight: 320 },
  poolRow: { paddingVertical: 12, paddingHorizontal: 4, gap: 2 },
  poolRowText: { gap: 2 },
  poolName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  poolAddr: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  poolEmpty: {
    fontSize: 14,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink400,
    paddingVertical: 16,
    textAlign: 'center',
  },
});
