// Figma 90:7386 (create) / 90:7398 (edit) — 수영장 추가/수정 요청 (재기획 2026-05-13).
//
// 좌표는 사용자에게 받지 않음 (운영자 검수 시 처리).
// Create 필수: 수영장 이름 + 레인 길이 (라디오라 항상 값 있음 → 실질 name만 검증).
// Create 옵션: 레인 개수, 얕은/깊은 수심, 유아풀/다이빙풀/호텔 분류.

import React from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { useSubmitPool } from '@/hooks/useSubmitPool';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
// Figma 90:7386 — 폼 내 unselected 아이콘 색상 = #4B5563 (Gray/60)
import IconLifeBuoy from '@assets/icons/life-buoy-gray.svg';
// 버튼 활성: 검정 아이콘 / 비활성: 회색 아이콘 (Figma 90:7397 — disabled, 다른 활성 버튼들과 동일하게 검정)
import IconWrench from '@assets/icons/wrench-black.svg';
import IconWrenchGray from '@assets/icons/wrench-gray.svg';
import IconLaneCount from '@assets/icons/lane-count.svg';
import IconDepth from '@assets/icons/depth-gray.svg';
// 옵션 칩 — unselected: gray (#4B5563), selected: white (chip bg cyan)
import IconKids from '@assets/icons/facility-kids-gray.svg';
import IconDiving from '@assets/icons/facility-diving-gray.svg';
import IconHotel from '@assets/icons/facility-hotel-gray.svg';
import IconKidsWhite from '@assets/icons/facility-kids.svg';
import IconDivingWhite from '@assets/icons/facility-diving.svg';
import IconHotelWhite from '@assets/icons/facility-hotel.svg';
import { SingleWheelSheet, DualWheelSheet } from '@/components/pool-submit/NumberWheelSheet';

const DESC_MAX = 300;
// 레인 개수 1~50
const LANE_COUNTS = Array.from({ length: 50 }, (_, i) => i + 1);
// 수심 0.1~10.0m (0.1 step) — 총 100단계
const DEPTHS = Array.from({ length: 100 }, (_, i) => +(0.1 + i * 0.1).toFixed(1));

export function PoolNameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PoolName'>>();
  const isEdit = route.params?.mode === 'edit';

  return isEdit ? <EditForm poolId={route.params?.poolId} /> : <CreateForm />;
}

// ============================== CREATE ==============================
function CreateForm() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const submitMutation = useSubmitPool();

  const [name, setName] = React.useState('');
  const [laneCount, setLaneCount] = React.useState<number | null>(null); // null = 미입력
  const [poolLength, setPoolLength] = React.useState<25 | 50>(25);
  const [depthMin, setDepthMin] = React.useState<number | null>(null);
  const [depthMax, setDepthMax] = React.useState<number | null>(null);
  const [hasKids, setHasKids] = React.useState(false);
  const [hasDiving, setHasDiving] = React.useState(false);
  const [isHotel, setIsHotel] = React.useState(false);

  const [showLaneSheet, setShowLaneSheet] = React.useState(false);
  const [showDepthSheet, setShowDepthSheet] = React.useState(false);

  // 이름만 필수 (레인 길이는 라디오라 항상 값 있음).
  const canSubmit = name.trim().length > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    try {
      await submitMutation.mutateAsync({
        mode: 'create',
        poolName: name,
        laneCount: laneCount ?? undefined,
        poolLength,
        depthMin: depthMin ?? undefined,
        depthMax: depthMax ?? undefined,
        hasKidsPool: hasKids,
        hasDivingPool: hasDiving,
        isHotelPool: isHotel,
      });
      navigation.navigate('PoolDone', { mode: 'create' });
    } catch (e) {
      console.error('[PoolSubmit] 에러:', e);
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('요청 전송에 실패했어요', msg);
    }
  };

  return (
    <ScreenContainer withHorizontalPadding={false} background={tokens.color.bgPaper}>
      <AppHeader background={tokens.color.bgPaper} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>
            추가하고 싶은{'\n'}수영장 정보를 입력하세요.
          </Text>

          {/* 수영장 이름 (필수) */}
          <Field label="수영장 이름">
            <View style={styles.inputBox}>
              <IconLifeBuoy width={20} height={20} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="풀스데이 체육센터"
                placeholderTextColor={tokens.color.ink400}
                style={styles.inputText}
                maxLength={40}
                returnKeyType="done"
              />
            </View>
          </Field>

          {/* 레인 개수 — 휠 픽커 트리거 */}
          <Field label="레인 개수">
            <Pressable style={styles.inputBox} onPress={() => setShowLaneSheet(true)}>
              <IconLaneCount width={20} height={20} />
              <Text
                style={[
                  styles.inputText,
                  laneCount === null && { color: tokens.color.ink400 },
                ]}
              >
                {laneCount !== null ? `${laneCount}레인` : '레인 개수'}
              </Text>
              <ChevronDown size={18} color={tokens.color.ink500} />
            </Pressable>
          </Field>

          {/* 레인 길이 — 라디오 (필수, 기본 25m) */}
          <Field label="레인 길이">
            <View style={styles.radioRow}>
              <LengthChip
                label="25m"
                checked={poolLength === 25}
                onPress={() => setPoolLength(25)}
              />
              <LengthChip
                label="50m"
                checked={poolLength === 50}
                onPress={() => setPoolLength(50)}
              />
            </View>
          </Field>

          {/* 얕은/깊은 수심 — 듀얼 휠 트리거 */}
          <View style={styles.depthRow}>
            <Field label="얕은 수심" style={styles.flex1}>
              <Pressable style={styles.inputBox} onPress={() => setShowDepthSheet(true)}>
                <IconDepth width={20} height={20} />
                <Text
                  style={[
                    styles.inputText,
                    depthMin === null && { color: tokens.color.ink400 },
                  ]}
                >
                  {depthMin !== null ? `${depthMin.toFixed(1)}m` : '1.2m'}
                </Text>
                <ChevronDown size={18} color={tokens.color.ink500} />
              </Pressable>
            </Field>
            <Field label="깊은 수심" style={styles.flex1}>
              <Pressable style={styles.inputBox} onPress={() => setShowDepthSheet(true)}>
                <IconDepth width={20} height={20} />
                <Text
                  style={[
                    styles.inputText,
                    depthMax === null && { color: tokens.color.ink400 },
                  ]}
                >
                  {depthMax !== null ? `${depthMax.toFixed(1)}m` : '1.2m'}
                </Text>
                <ChevronDown size={18} color={tokens.color.ink500} />
              </Pressable>
            </Field>
          </View>

          {/* 옵션 — 유아풀/다이빙풀/호텔 */}
          <Field label="옵션">
            <View style={styles.optionsRow}>
              <OptionChip
                label="유아풀"
                checked={hasKids}
                onPress={() => setHasKids(!hasKids)}
                icon={hasKids ? <IconKidsWhite width={20} height={20} /> : <IconKids width={20} height={20} />}
              />
              <OptionChip
                label="다이빙풀"
                checked={hasDiving}
                onPress={() => setHasDiving(!hasDiving)}
                icon={hasDiving ? <IconDivingWhite width={20} height={20} /> : <IconDiving width={20} height={20} />}
              />
              <OptionChip
                label="호텔"
                checked={isHotel}
                onPress={() => setIsHotel(!isHotel)}
                icon={isHotel ? <IconHotelWhite width={20} height={20} /> : <IconHotel width={20} height={20} />}
              />
            </View>
          </Field>

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit || submitMutation.isPending}
            style={({ pressed }) => [
              styles.submitBtn,
              !canSubmit && styles.submitBtnDisabled,
              pressed && canSubmit && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.submitLabel,
                !canSubmit && styles.submitLabelDisabled,
              ]}
            >
              수영장 추가 요청
            </Text>
            {canSubmit
              ? <IconWrench width={20} height={20} />
              : <IconWrenchGray width={20} height={20} />}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SingleWheelSheet
        visible={showLaneSheet}
        title="레인 개수"
        ctaLabel="레인 개수 선택"
        options={LANE_COUNTS}
        format={(n) => `${n}`}
        initialIndex={laneCount !== null ? Math.max(0, LANE_COUNTS.indexOf(laneCount)) : 3}
        onConfirm={(i) => setLaneCount(LANE_COUNTS[i])}
        onClose={() => setShowLaneSheet(false)}
      />

      <DualWheelSheet
        visible={showDepthSheet}
        title="수심 범위"
        ctaLabel="수심 선택"
        options={DEPTHS}
        format={(n) => `${n.toFixed(1)}m`}
        leftLabel="얕은 수심"
        rightLabel="깊은 수심"
        leftInitialIndex={depthMin !== null ? findClosest(DEPTHS, depthMin) : findClosest(DEPTHS, 1.2)}
        rightInitialIndex={depthMax !== null ? findClosest(DEPTHS, depthMax) : findClosest(DEPTHS, 1.8)}
        onConfirm={(li, ri) => {
          setDepthMin(DEPTHS[li]);
          setDepthMax(DEPTHS[ri]);
        }}
        onClose={() => setShowDepthSheet(false)}
      />
    </ScreenContainer>
  );
}

// ============================== EDIT ==============================
function EditForm({ poolId }: { poolId?: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const submitMutation = useSubmitPool();

  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const canSubmit = name.trim().length > 0 && desc.trim().length > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    try {
      await submitMutation.mutateAsync({
        mode: 'edit',
        poolId,
        poolName: name,
        description: desc,
      });
      navigation.navigate('PoolDone', { mode: 'edit' });
    } catch (e) {
      console.error('[PoolSubmit] 에러:', e);
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('요청 전송에 실패했어요', msg);
    }
  };

  return (
    <ScreenContainer withHorizontalPadding={false} background={tokens.color.bgPaper}>
      <AppHeader background={tokens.color.bgPaper} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.heading}>수영장 수정 정보를{'\n'}입력하세요.</Text>

              <Field label="수영장 이름">
                <View style={styles.inputBox}>
                  <IconLifeBuoy width={20} height={20} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="풀스데이 체육센터"
                    placeholderTextColor={tokens.color.ink400}
                    style={styles.inputText}
                    maxLength={40}
                    returnKeyType="next"
                  />
                </View>
              </Field>

              <Field label="수정 요청">
                <View style={styles.textareaBox}>
                  <TextInput
                    multiline
                    placeholder="어떤 정보를 수정하고 싶은지 자세하게 작성 부탁드립니다."
                    placeholderTextColor={tokens.color.ink400}
                    style={styles.textareaInput}
                    value={desc}
                    onChangeText={setDesc}
                    maxLength={DESC_MAX}
                    textAlignVertical="top"
                  />
                  <Text style={styles.counterText}>{desc.length}/{DESC_MAX}</Text>
                </View>
              </Field>

              <Pressable
                onPress={onSubmit}
                disabled={!canSubmit || submitMutation.isPending}
                style={({ pressed }) => [
                  styles.submitBtn,
                  !canSubmit && styles.submitBtnDisabled,
                  pressed && canSubmit && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.submitLabel,
                    !canSubmit && styles.submitLabelDisabled,
                  ]}
                >
                  수영장 정보 수정 요청
                </Text>
                {canSubmit
                  ? <IconWrench width={20} height={20} />
                  : <IconWrenchGray width={20} height={20} />}
              </Pressable>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ============================== Helpers ==============================
function findClosest(arr: number[], target: number): number {
  let best = 0;
  let bestDiff = Math.abs(arr[0] - target);
  for (let i = 1; i < arr.length; i++) {
    const diff = Math.abs(arr[i] - target);
    if (diff < bestDiff) { best = i; bestDiff = diff; }
  }
  return best;
}

function Field({
  label, children, style,
}: {
  label: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function LengthChip({
  label, checked, onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.radioChip, checked ? styles.radioChipChecked : null]}
      accessibilityRole="radio"
      accessibilityState={{ checked }}
    >
      <Text
        style={[
          styles.radioChipLabel,
          checked ? styles.radioChipLabelChecked : null,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.radioCircle,
          checked ? styles.radioCircleChecked : styles.radioCircleUnchecked,
        ]}
      >
        {checked ? <Text style={styles.radioCircleCheck}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

function OptionChip({
  label, checked, onPress, icon,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionChip, checked ? styles.optionChipChecked : null]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      {icon}
      <Text
        style={[
          styles.optionLabel,
          checked ? styles.optionLabelChecked : null,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.radioCircle,
          checked ? styles.radioCircleChecked : styles.radioCircleUnchecked,
        ]}
      >
        {checked ? <Text style={styles.radioCircleCheck}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    marginBottom: 32,
  },
  field: { gap: 8, marginBottom: 24 },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  // 공통 input box (Figma — radius 14, border #CBD5E1, padding 12, gap 12, min-h 48)
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.bgPaper,
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

  // 레인 길이 라디오 (전체/25m/50m)
  radioRow: { flexDirection: 'row', gap: 8 },
  radioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.bgPaper,
  },
  // Figma 101:4848 — bg와 border 동색 pd-mint (외곽선 시각상 안 보임)
  radioChipChecked: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  radioChipLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  radioChipLabelChecked: { color: tokens.color.white },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleUnchecked: {
    backgroundColor: tokens.color.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  radioCircleChecked: { backgroundColor: tokens.color.pdBlue },
  radioCircleCheck: {
    fontSize: 12,
    lineHeight: 14,
    color: tokens.color.white,
    fontFamily: tokens.font.sansBold,
  },

  // 수심 row (얕은 + 깊은)
  depthRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },

  // 옵션 칩 (유아/다이빙/호텔)
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.bgPaper,
  },
  // Figma — bg/border 동색 pd-mint (외곽선 시각상 안 보임)
  optionChipChecked: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  optionLabelChecked: { color: tokens.color.white },

  // edit 모드 textarea
  textareaBox: {
    backgroundColor: tokens.color.bgPaper,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    minHeight: 180,
  },
  textareaInput: {
    flex: 1,
    fontFamily: tokens.font.sans,
    fontSize: 14,
    lineHeight: 22,
    color: tokens.color.ink900,
    padding: 0,
    minHeight: 140,
  },
  counterText: {
    alignSelf: 'flex-start',
    fontFamily: tokens.font.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    color: tokens.color.ink400,
    marginTop: 8,
  },

  // submit 버튼 (Figma — pd-byellow + 검정 Bold + wrench icon)
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    marginTop: 16,
  },
  submitBtnDisabled: { backgroundColor: tokens.color.pdBgray },
  submitLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
  submitLabelDisabled: {
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.pdGray,
  },
});
