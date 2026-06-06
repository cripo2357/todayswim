// 수영 레슨 장소·시간 등록 — Figma 90:6622.
//
// 모델 변경: 레슨 받는 수영장 1곳(lessonPoolId/Name) + 시간 슬롯 여러 개.
// 흐름: 풀 선택(검색 float) → "+"로 요일(SwimClassDaySheet)→시간
// (SwimClassTimeSheet) 슬롯 추가 → "수영 레슨 정보 등록"(저장) /
// "레슨을 받지 않습니다"(해제). 공개 시 프로필 노출 + 지도 stack
// (showSwimClasses, mapProfileStacks). 뒤로=취소(저장 안 함).
//
// 수영장 검색: AddScheduleSheet(수영 일정 추가)의 검증된 패턴을 그대로
// 복제 — 별도 모달이 아니라 "트리거 + ScrollView 마지막 자식 absolute
// float". 인라인 float이라 포커스/키보드 정상(공통 BottomSheet 모달의
// TouchableWithoutFeedback 포커스 깨짐 회피). android_nested_modal_float.

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
import { logEvent } from '@/lib/analytics';
import HeartFilled from '@assets/icons/heart-filled.svg';
import IconUniversityHat from '@assets/icons/university-hat.svg';
import { tokens } from '@/styles/tokens';

export function SwimClassRegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);
  const { data: pools = [] } = usePools();
  const favIds = useFavorites((s) => s.ids);

  const [poolId, setPoolId] = React.useState<string | undefined>(
    profile?.lessonPoolId,
  );
  const [poolName, setPoolName] = React.useState<string | undefined>(
    profile?.lessonPoolName,
  );
  const [classes, setClasses] = React.useState<SwimClass[]>(
    profile?.swimClasses ?? [],
  );

  // 수영장 검색 — AddScheduleSheet와 동일 패턴(닫힘 트리거 / 열림 float).
  const [poolOpen, setPoolOpen] = React.useState(false);
  const [poolQuery, setPoolQuery] = React.useState('');
  // float 패널을 필드 위치에 정확히 띄우기 위한 y(스크롤 콘텐츠 기준).
  // 그룹 y + 트리거의 그룹내 offset → 매직넘버 없이 필드에 정렬.
  const [poolGroupY, setPoolGroupY] = React.useState(0);
  const [triggerOffsetY, setTriggerOffsetY] = React.useState(0);
  const poolSearchRef = React.useRef<TextInput>(null);
  React.useEffect(() => {
    if (!poolOpen) return;
    const t = setTimeout(() => poolSearchRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [poolOpen]);

  const [daySheet, setDaySheet] = React.useState(false);
  // 요일 선택 후 시간 시트 대상 요일 (null=시간시트 닫힘)
  const [timeDay, setTimeDay] = React.useState<DayOfWeek | null>(null);

  const grouped = groupByDay(classes);
  const orderedSlots = DAY_ORDER.flatMap((d) => grouped[d]);

  const addClass = (day: DayOfWeek, start: string, end: string) =>
    setClasses((prev) => [...prev, { id: genSwimClassId(), day, start, end }]);
  const removeClass = (id: string) =>
    setClasses((prev) => prev.filter((c) => c.id !== id));

  // 즐겨찾기 먼저(가나다), 그 다음 일반(가나다) — 모든 수영장 검색 공통 규칙
  const sortedPools = React.useMemo(() => {
    const favSet = new Set(favIds);
    const byKo = (a: Pool, b: Pool) => a.name.localeCompare(b.name, 'ko');
    return [
      ...pools.filter((p) => favSet.has(p.id)).sort(byKo),
      ...pools.filter((p) => !favSet.has(p.id)).sort(byKo),
    ];
  }, [pools, favIds]);
  const poolQ = poolQuery.trim().toLowerCase();
  const filteredPools = poolQ
    ? sortedPools.filter((p) => p.name.toLowerCase().includes(poolQ))
    : sortedPools;

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
    void logEvent('lesson_register_complete', { class_count: classes.length });
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
        scrollEnabled={!poolOpen}
        keyboardShouldPersistTaps="always"
      >
        <Text style={styles.heading}>
          {'수영 레슨 장소와 시간을\n등록하세요.'}
        </Text>

        {/* 레슨 받는 수영장 — 닫힘 트리거 / 열림 float(아래 마지막 자식).
            onLayout 2단(그룹 y + 트리거 그룹내 offset)으로 float를 필드
            위치에 정확히 정렬(매직넘버 없이). */}
        <View
          style={styles.group}
          onLayout={(e) => setPoolGroupY(e.nativeEvent.layout.y)}
        >
          <Text style={styles.label}>레슨 받는 수영장</Text>
          <View onLayout={(e) => setTriggerOffsetY(e.nativeEvent.layout.y)}>
            <Pressable
              onPress={() => setPoolOpen(true)}
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
              <ChevronDown
                size={20}
                color={tokens.color.ink400}
                strokeWidth={2}
              />
            </Pressable>
          </View>
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
            {/* baked SVG는 색 props 무효 → 라벨과 함께 opacity로 톤다운
                (button_icon_always_visible). */}
            <View style={!canRegister ? styles.ctaIconDisabled : undefined}>
              <IconUniversityHat width={20} height={20} />
            </View>
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

        {/* 수영장 검색 float — ScrollView 마지막 자식 = 트리 최상위라
            Android가 elevation/그림자 없이도 터치 우선
            (android_nested_modal_float). 열림 중 부모 ScrollView
            scrollEnabled=false → 내부 리스트 스크롤 정상. AddScheduleSheet
            122:7490·147:5323 구조 동일 복제. */}
        {poolOpen ? (
          <>
            <Pressable
              style={styles.poolBackdrop}
              onPress={() => setPoolOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="수영장 검색 닫기"
            />
            <View
              style={[
                styles.poolPanel,
                { top: poolGroupY + triggerOffsetY },
              ]}
            >
              {/* Figma 147:5406 — 검색칸 #F8FAFC 알약 */}
              <View style={styles.poolSearch}>
                <View style={styles.poolSearchInputWrap}>
                  <TextInput
                    ref={poolSearchRef}
                    autoFocus
                    value={poolQuery}
                    onChangeText={setPoolQuery}
                    style={styles.poolSearchInput}
                  />
                  {poolQuery.length === 0 ? (
                    <Text
                      style={styles.poolSearchPlaceholder}
                      pointerEvents="none"
                    >
                      수영장 이름
                    </Text>
                  ) : null}
                </View>
                {/* Figma 147:5413 — 입력값 있을 때만 clear */}
                {poolQuery.length > 0 ? (
                  <Pressable
                    onPress={() => setPoolQuery('')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="검색어 지우기"
                  >
                    <XCircle size={20} color="#94A3B8" strokeWidth={2} />
                  </Pressable>
                ) : null}
              </View>
              <ScrollView
                style={styles.poolList}
                contentContainerStyle={styles.poolListContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
                // iOS 바운스 끌림 방지 — 결과 적으면 고정.
                alwaysBounceVertical={false}
              >
                {filteredPools.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setPoolId(p.id);
                      setPoolName(p.name);
                      setPoolOpen(false);
                      setPoolQuery('');
                    }}
                    style={styles.poolItem}
                  >
                    <Text style={styles.poolItemText} numberOfLines={1}>
                      {p.name}
                    </Text>
                    {/* 즐겨찾기 표시(읽기 전용 — 상위 노출 규칙 인지용) */}
                    {favIds.includes(p.id) ? (
                      <HeartFilled width={20} height={20} />
                    ) : null}
                  </Pressable>
                ))}
                {filteredPools.length === 0 ? (
                  <Text style={styles.poolEmpty}>검색 결과가 없어요.</Text>
                ) : null}
              </ScrollView>
            </View>
          </>
        ) : null}
      </ScrollView>

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
  // baked SVG 아이콘 비활성 톤다운 — SheetCtaButton과 동일 정책(opacity 0.4).
  ctaIconDisabled: { opacity: 0.4 },
  // Figma 179:7282 — calendar-x + pd-blue 텍스트
  noLesson: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noLessonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.pdBlue,
  },

  // ── 수영장 검색 float (AddScheduleSheet 147:5326 구조 동일 복제) ──
  // 열림 시 스크롤 영역 덮는 투명 영역 — 탭하면 닫힘(패널은 그 위, 최상위)
  poolBackdrop: { ...StyleSheet.absoluteFillObject },
  // Figma 147:5326 — 흰 카드 border #E2E8F0 r14 p8 gap4 Shadow/lg.
  // ScrollView 마지막 자식 + absolute(top=필드 y) → 그림자/elevation 없이 최상위.
  poolPanel: {
    position: 'absolute',
    // 부모 ScrollView contentContainer paddingHorizontal:16 이 absolute
    // 자식의 padding box 기준이라 left:0/right:0 = 필드와 동일 가로 폭
    // (AddScheduleSheet와 동일 — 거긴 패딩이 ancestor sheet에 있음).
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  // Figma 147:5406 — 검색칸 #F8FAFC 알약 minH40 p8 gap8
  poolSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
  },
  poolSearchInputWrap: { flex: 1, justifyContent: 'center' },
  // Figma 147:5409 — Medium 16/22 -0.112 #4B5563
  poolSearchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    padding: 0,
  },
  // RN Android 커스텀폰트 placeholder 회피 — 빈 값 시 Text 오버레이
  poolSearchPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    includeFontPadding: false,
  },
  // 5개 노출 고정(아이템 minH40 + gap4 → 5*40 + 4*4 = 216, 여유 220)
  poolList: { height: 220 },
  poolListContent: { gap: 4 },
  // Figma 147:5330 — 아이템 알약 minH40 p8
  poolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
  },
  // Figma 163:10814 — Medium 16/22 -0.112 #4B5563.
  poolItemText: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  poolEmpty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
