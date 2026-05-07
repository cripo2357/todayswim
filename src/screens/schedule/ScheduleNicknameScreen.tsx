// Figma: 5:14808 (시간표 작성하기 - 닉네임 입력)
//
// 단일 큰 인풋 + Primary 버튼 + 키보드 회피.
// 메모리 §feedback_keyboard_avoidance: TextInput 화면은 KeyboardAvoidingView 필수.

import React from 'react';
import {
  View, Text, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

export function ScheduleNicknameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleNickname'>>();
  const { poolId } = route.params;

  const setNickname = useScheduleDraft((s) => s.setNickname);
  const [value, setValue] = React.useState('');
  const canSubmit = value.trim().length >= 2 && value.trim().length <= 12;

  const onNext = () => {
    const trimmed = value.trim();
    setNickname(trimmed);
    navigation.navigate('ScheduleWrite', { poolId, nickname: trimmed });
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.body}>
            <Text style={styles.heading}>닉네임을 정해주세요</Text>
            <Text style={styles.sub}>
              다른 사용자가 시간표를 볼 때 함께 표시돼요.
            </Text>

            <View style={styles.inputWrap}>
              <Input
                variant="jumbo"
                placeholder="예) 수영맨"
                autoFocus
                maxLength={12}
                value={value}
                onChangeText={setValue}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? onNext : undefined}
              />
            </View>

            <View style={styles.spacer} />

            <Button
              label="다음"
              onPress={onNext}
              disabled={!canSubmit}
              size="lg"
              fullWidth
              style={styles.nextBtn}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: tokens.layout.pagePadMobile,
    paddingTop: tokens.space[12],
  },
  heading: {
    ...tokens.text.h1,
    color: tokens.color.ink900,
  },
  sub: {
    ...tokens.text.body,
    color: tokens.color.ink500,
    marginTop: tokens.space[2],
  },
  inputWrap: { marginTop: tokens.space[8] },
  spacer: { flex: 1 },
  nextBtn: { marginBottom: tokens.space[6] },
});
