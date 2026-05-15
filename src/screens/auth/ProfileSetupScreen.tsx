// Figma 101:4367 — 프로필 등록 (회원가입 단계).
// 이미지 등록은 별도 다음 화면에서 처리. 여기는 이름·성별·생년월일·수영 정보만.

import React from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, Modal, Animated, Dimensions, PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ChevronDown, X, Check, Calendar as LucideCalendar } from 'lucide-react-native';

import { useProfile, type Gender, type Stroke } from '@/store/profile';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import IconUser from '@assets/icons/user-profile.svg';
import IconGenderMale from '@assets/icons/gender-male.svg';
import IconLock from '@assets/icons/lock-secure.svg';
import IconSectionBasic from '@assets/icons/section-basic.svg';
import IconLaneCount from '@assets/icons/lane-count.svg';
import { CalendarSheet } from '@/components/auth/CalendarSheet';

const ALL_STROKES: Stroke[] = ['자유형', '배영', '접영', '평영'];
const EXP_MAX = 30;

export function ProfileSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const saveProfile = useProfile((s) => s.save);

  const [name, setName] = React.useState('');
  const [gender, setGender] = React.useState<Gender | null>(null);
  const [birthDate, setBirthDate] = React.useState(''); // YYYY-MM-DD
  const [exp, setExp] = React.useState(10);
  const [strokes, setStrokes] = React.useState<Set<Stroke>>(new Set(['자유형']));
  const [showGenderSheet, setShowGenderSheet] = React.useState(false);
  const [showCalendarSheet, setShowCalendarSheet] = React.useState(false);

  // 필수 — 닉네임 + 성별 + 생년월일.
  const canSubmit = name.trim().length >= 1 && !!gender && !!birthDate;

  const toggleStroke = (s: Stroke) => {
    setStrokes((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const onStart = async () => {
    if (!canSubmit) return;
    await saveProfile({
      name: name.trim(),
      gender: gender!,
      birthDate,
      experienceYears: exp,
      strokes: Array.from(strokes),
      // 이미지는 다음 단계(ProfileImage 화면)에서 추가.
      createdAt: new Date().toISOString(),
    });
    // 프로필 저장 → 이미지 등록 단계 → Welcome.
    navigation.replace('ProfileImage');
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>프로필 등록</Text>

          {/* 기본 정보 */}
          <SectionHeader label="기본 정보" icon={<IconSectionBasic width={20} height={20} />} />
          <Field label="닉네임">
            <View style={styles.inputBox}>
              <IconUser width={20} height={20} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="수영러버"
                placeholderTextColor={tokens.color.ink400}
                style={styles.inputText}
                maxLength={20}
              />
            </View>
          </Field>

          <Field label="성별">
            <Pressable
              onPress={() => setShowGenderSheet(true)}
              style={styles.inputBox}
            >
              <IconGenderMale width={20} height={20} />
              <Text
                style={[
                  styles.inputText,
                  !gender && { color: tokens.color.ink400 },
                ]}
              >
                {gender === 'male' ? '남성' : gender === 'female' ? '여성' : '성별'}
              </Text>
              <ChevronDown size={18} color={tokens.color.ink500} />
            </Pressable>
          </Field>

          <Field label="생년월일">
            <Pressable
              onPress={() => setShowCalendarSheet(true)}
              style={styles.inputBox}
            >
              <LucideCalendar size={20} color={tokens.color.ink900} strokeWidth={2} />
              <Text
                style={[
                  styles.inputText,
                  !birthDate && { color: tokens.color.ink400 },
                ]}
              >
                {birthDate
                  ? birthDate.replace(/-/g, '.') + '.'
                  : '1990.01.01.'}
              </Text>
            </Pressable>
          </Field>

          <View style={styles.divider} />

          {/* 수영 실력 */}
          <SectionHeader label="수영 실력" icon={<IconLaneCount width={20} height={20} />} />

          <Text style={styles.subLabel}>수영 경력</Text>
          <ExperienceSlider value={exp} onChange={setExp} max={EXP_MAX} />

          <Text style={[styles.subLabel, { marginTop: 16 }]}>가능한 수영 영법</Text>
          <View style={styles.strokeRow}>
            {ALL_STROKES.map((s) => {
              const checked = strokes.has(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => toggleStroke(s)}
                  style={[styles.strokeChip, checked && styles.strokeChipChecked]}
                >
                  <Text style={[styles.strokeLabel, checked && styles.strokeLabelChecked]}>
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Pressable
            onPress={onStart}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.cta,
              !canSubmit && styles.ctaDisabled,
              pressed && canSubmit && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.ctaLabel, !canSubmit && styles.ctaLabelDisabled]}>
              서비스 시작
            </Text>
            <ArrowRight
              size={20}
              color={canSubmit ? tokens.color.black : tokens.color.pdGray}
              strokeWidth={2}
            />
          </Pressable>

          <View style={styles.privacyNotice}>
            <IconLock width={16} height={16} />
            <Text style={styles.privacyText}>
              사용자 정보는 안전하며 절대 누구와도 공유하지 않습니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GenderSheet
        visible={showGenderSheet}
        value={gender}
        onConfirm={(g) => setGender(g)}
        onClose={() => setShowGenderSheet(false)}
      />

      <CalendarSheet
        visible={showCalendarSheet}
        initial={birthDate || '1990-01-01'}
        onConfirm={(iso) => setBirthDate(iso)}
        onClose={() => setShowCalendarSheet(false)}
      />
    </View>
  );
}

/** 성별 입력 바텀시트 — Figma 110:4477. 남성/여성 2개 옵션. */
function GenderSheet({
  visible, value, onConfirm, onClose,
}: {
  visible: boolean;
  value: Gender | null;
  onConfirm: (g: Gender) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = React.useState<Gender | null>(value);
  const slideY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      setDraft(value);
      Animated.timing(slideY, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideY.setValue(Dimensions.get('window').height);
    }
  }, [visible, value, slideY]);

  const close = () => {
    Animated.timing(slideY, {
      toValue: Dimensions.get('window').height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const submit = () => {
    if (draft) onConfirm(draft);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={sheetStyles.root}>
        <Pressable onPress={close} style={sheetStyles.backdrop} />
        <Animated.View style={[sheetStyles.sheetWrap, { transform: [{ translateY: slideY }] }]}>
          <SafeAreaView edges={['bottom']}>
            <View style={sheetStyles.handleWrap}><View style={sheetStyles.handle} /></View>
            <View style={sheetStyles.sheet}>
              <View style={sheetStyles.titleRow}>
                <Text style={sheetStyles.title}>성별</Text>
                <Pressable onPress={close} hitSlop={8}>
                  <X size={24} color={tokens.color.ink900} strokeWidth={1.5} />
                </Pressable>
              </View>

              <View style={sheetStyles.options}>
                <GenderOption label="남성" selected={draft === 'male'} onPress={() => setDraft('male')} />
                <GenderOption label="여성" selected={draft === 'female'} onPress={() => setDraft('female')} />
              </View>

              <Pressable
                onPress={submit}
                style={({ pressed }) => [sheetStyles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={sheetStyles.ctaLabel}>선택</Text>
                <Check size={20} color={tokens.color.black} strokeWidth={2.4} />
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function GenderOption({
  label, selected, onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[sheetStyles.optionPill, selected && sheetStyles.optionPillSelected]}
    >
      <Text style={[sheetStyles.optionLabel, selected && sheetStyles.optionLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      {icon ?? null}
      <Text style={styles.sectionHeaderLabel}>{label}</Text>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

/** 수영 경력 슬라이더 — 0~30년 (총 31단계), 0=1년 미만, 30=30년 이상.
 *  PanResponder로 thumb 드래그 + 트랙 탭 점프 + Pressable +/- 미세조정. */
function ExperienceSlider({
  value, onChange, max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const pct = Math.max(0, Math.min(1, value / max));

  // 드래그 중 같은 값 onChange 반복 호출 방지용 마지막 값 ref.
  // pageX 기반 — locationX는 Android에서 뷰 밖으로 나가면 예측 불가 값을 줄 수 있어 30→0 점프 버그가 발생.
  const trackRef = React.useRef<View | null>(null);
  const trackWidthRef = React.useRef(0);
  const trackPageXRef = React.useRef(0);
  const lastValueRef = React.useRef(value);
  React.useEffect(() => {
    lastValueRef.current = value;
  }, [value]);

  const measureTrack = React.useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, w) => {
      trackPageXRef.current = x;
      trackWidthRef.current = w;
    });
  }, []);

  const setFromPageX = React.useCallback(
    (pageX: number) => {
      const w = trackWidthRef.current;
      if (w <= 0) return;
      const local = pageX - trackPageXRef.current;
      const ratio = Math.max(0, Math.min(1, local / w));
      const v = Math.round(ratio * max);
      if (v !== lastValueRef.current) {
        lastValueRef.current = v;
        onChange(v);
      }
    },
    [max, onChange],
  );

  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          measureTrack();
          setFromPageX(e.nativeEvent.pageX);
        },
        onPanResponderMove: (e) => setFromPageX(e.nativeEvent.pageX),
      }),
    [setFromPageX, measureTrack],
  );

  return (
    <View style={sliderStyles.wrap}>
      <View style={sliderStyles.trackRow}>
        {/* Figma 101:4367 — ±버튼 없이 트랙만. 드래그로만 조정. */}
        <View
          ref={trackRef}
          style={sliderStyles.trackTouchWrap}
          onLayout={measureTrack}
          {...pan.panHandlers}
        >
          <View style={sliderStyles.track} pointerEvents="none">
            <View style={[sliderStyles.fill, { width: `${pct * 100}%` }]} />
            <View style={[sliderStyles.thumb, { left: `${pct * 100}%` }]} />
          </View>
        </View>
      </View>
      <View style={sliderStyles.labelRow}>
        <Text style={sliderStyles.endLabel}>{formatExp(value, max)}</Text>
        <Text style={sliderStyles.endLabel}>{max}년 이상</Text>
      </View>
    </View>
  );
}

function formatExp(value: number, max: number): string {
  if (value <= 0) return '1년 미만';
  if (value >= max) return `${max}년 이상`;
  return `${value}년`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.36,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 12 },
  sectionHeaderIcon: { fontSize: 16, color: tokens.color.ink900 },
  sectionHeaderLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },

  field: { gap: 6, marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  subLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
    marginBottom: 8,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.bgPaper,
  },
  inputIconText: {
    fontSize: 16,
    color: tokens.color.ink500,
    width: 18,
    textAlign: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    padding: 0,
  },

  divider: { height: 1, backgroundColor: tokens.color.lineDefault, marginVertical: 20 },

  // 영법 칩
  strokeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  strokeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.bgPaper,
  },
  strokeChipChecked: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  strokeLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink900,
  },
  strokeLabelChecked: { color: tokens.color.white },

  // CTA
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    marginTop: 8,
  },
  ctaDisabled: { backgroundColor: tokens.color.pdBgray },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
  ctaLabelDisabled: { color: tokens.color.pdGray },

  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
  },
});

// Figma 110:4477 — 성별 바텀시트 스타일
const sheetStyles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheetWrap: {
    backgroundColor: tokens.color.bgPaper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...tokens.shadow.pop,
  },
  handleWrap: { paddingTop: 12, alignItems: 'center' },
  handle: { width: 64, height: 5, borderRadius: 1234, backgroundColor: '#E2E8F0' },
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  options: { gap: 12, paddingVertical: 8, alignItems: 'center' },
  optionPill: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  optionPillSelected: { backgroundColor: tokens.color.pdMint },
  optionLabel: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  optionLabelSelected: { color: tokens.color.white },
  cta: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});

const sliderStyles = StyleSheet.create({
  wrap: { gap: 8 },
  trackRow: { flexDirection: 'row', alignItems: 'center' },
  // 드래그 hit 영역 — 트랙 6px만으로는 손가락이 너무 작아서 36px wrapper로 확장.
  trackTouchWrap: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: tokens.color.bgSubtle,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: tokens.color.pdMint,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: tokens.color.pdByellow,
    borderWidth: 2,
    borderColor: tokens.color.pdMint,
    marginLeft: -9,
    top: -6,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  endLabel: { fontSize: 12, color: tokens.color.ink500, fontFamily: tokens.font.sans },
});
