// Figma: 37:6738 (시간표 작성하기 - 닉네임 입력)
//
// 흐름의 마지막 단계: Map → Write → Time(modal) → Nickname(이 화면) → Done.
// 닉네임 입력(또는 익명 선택) 시 draft 확정 → Supabase에 submit (TODO: Phase 2) → Done 화면.
// 헤딩 + 서브카피 + 닉네임 입력 + Primary "입력 완료" + Outline "표시 안해도 괜찮아요".

import React from 'react';
import {
  View, Text, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, TouchableWithoutFeedback, Pressable, Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowRight, MessageSquare } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useScheduleDraft } from '@/store/scheduleDraft';
import { useSubmitSchedule } from '@/hooks/useSubmitSchedule';
import type { RootStackParamList } from '@/navigation/types';
import { ANON_NICKNAME } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

export function ScheduleNicknameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useRoute<RouteProp<RootStackParamList, 'ScheduleNickname'>>();

  const draft = useScheduleDraft((s) => s.draft);
  const setNickname = useScheduleDraft((s) => s.setNickname);
  const reset = useScheduleDraft((s) => s.reset);

  const submitMutation = useSubmitSchedule();

  const [value, setValue] = React.useState('');
  const trimmed = value.trim();
  const canSubmit = trimmed.length >= 2 && trimmed.length <= 12;

  // 닉네임 확정 → schedule_submissions INSERT → draft reset → Done 화면.
  // 운영자가 Dashboard에서 검수 후 schedules 테이블에 반영.
  const submit = async (nick: string) => {
    Keyboard.dismiss();
    if (!draft) {
      Alert.alert('시간표 정보가 없어요', '시간표 작성을 다시 시도해주세요.');
      return;
    }
    setNickname(nick);
    try {
      await submitMutation.mutateAsync({
        poolId: draft.poolId,
        nickname: nick,
        byDay: draft.byDay,
        dayNotes: draft.dayNotes,
      });
      reset();
      navigation.navigate('ScheduleDone');
    } catch (e) {
      Alert.alert('등록 요청에 실패했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            {/* Figma 37:6969 — Top Nav heading block: p-16, gap-8 */}
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>닉네임을 입력하세요.</Text>
              <Text style={styles.sub}>
                시간표 작성에 대한 감사한 마음으로{'\n'}
                마지막 작성자 닉네임을 시간표 위에 표시해드립니다.
              </Text>
            </View>

            {/* Figma 37:6741 — Frame: px-16 py-32, gap-32 (input ↔ buttons) */}
            <View style={styles.mainFrame}>
              {/* Figma 37:6914 — Input Text: gap-8 (label ↔ input) */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>닉네임</Text>
                <Input
                  variant="jumbo"
                  placeholder="예) 수영맨"
                  autoFocus
                  maxLength={12}
                  value={value}
                  onChangeText={setValue}
                  returnKeyType="done"
                  onSubmitEditing={canSubmit ? () => submit(trimmed) : undefined}
                />
              </View>

              {/* Figma 76:1962 — buttons frame: gap-24 items-center */}
              <View style={styles.buttonsBlock}>
                <Button
                  label="닉네임 입력 완료"
                  onPress={() => submit(trimmed)}
                  disabled={!canSubmit || submitMutation.isPending}
                  loading={submitMutation.isPending}
                  size="lg"
                  fullWidth
                  iconRight={
                    <ArrowRight
                      size={20}
                      color={canSubmit ? tokens.color.white : tokens.color.pool300}
                      strokeWidth={2.2}
                    />
                  }
                />
                {/* Figma 76:1964 — skip은 border/bg 없이 inline icon + 파란 텍스트 */}
                <Pressable
                  onPress={() => submit(ANON_NICKNAME)}
                  disabled={submitMutation.isPending}
                  style={({ pressed }) => [
                    styles.skipBtn,
                    (pressed || submitMutation.isPending) && { opacity: 0.6 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="닉네임 입력 안할래요"
                >
                  <MessageSquare size={20} color={tokens.color.brandBlue} strokeWidth={2} />
                  <Text style={styles.skipLabel}>닉네임 입력 안할래요.</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Figma 37:6969 — Top Nav heading: p-16, gap-8 between title & sub
  headingBlock: {
    padding: 16,
    gap: 8,
  },
  // Figma I37:6969;...38961 — Bold 30/38 tracking -0.39 #1F2937 (Gray/80)
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma I37:6969;...38962 — Regular 16/1.6 (≈26) #4B5563 (Gray/60)
  sub: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // Figma 37:6741 — Frame px-16 py-32, gap-32
  mainFrame: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 32,
  },
  // Figma 37:6914 — Input Text gap-8 (label ↔ input)
  fieldWrap: {
    gap: 8,
  },
  // Figma 37:6916 — SemiBold 14/20 -0.084 #1F2937
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  // Figma 76:1962 — buttons block gap-24 items-center
  buttonsBlock: {
    gap: 24,
    alignItems: 'center',
    width: '100%',
  },
  // Figma 76:1964 — skip: gap-10, no border/bg, content-sized
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  // Figma I76:1964;...17335 — SemiBold 16/22 -0.112 #007AFF
  skipLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.brandBlue,
  },
});
