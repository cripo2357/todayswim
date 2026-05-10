// Figma: 37:6738 (시간표 작성하기 - 닉네임 입력)
//
// 헤딩 + 서브카피 + 닉네임 입력 + Primary "입력 완료" + Outline "표시 안해도 괜찮아요".

import React from 'react';
import {
  View, Text, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowRight } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

const ANON_NICK = '익명의 수영러';

export function ScheduleNicknameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleNickname'>>();
  const { poolId } = route.params;

  const setNickname = useScheduleDraft((s) => s.setNickname);
  const [value, setValue] = React.useState('');
  const trimmed = value.trim();
  const canSubmit = trimmed.length >= 2 && trimmed.length <= 12;

  const goWrite = (nick: string) => {
    setNickname(nick);
    navigation.navigate('ScheduleWrite', { poolId, nickname: nick });
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
            <Text style={styles.heading}>닉네임을 입력하세요.</Text>
            <Text style={styles.sub}>
              시간표 작성에 대한 감사한 마음으로{'\n'}
              마지막 작성자 닉네임을 시간표 위에 표시해드립니다.
            </Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              <Input
                placeholder="예) 수영맨"
                autoFocus
                maxLength={12}
                value={value}
                onChangeText={setValue}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? () => goWrite(trimmed) : undefined}
              />
            </View>

            <View style={styles.actions}>
              <Button
                label="닉네임 입력 완료"
                onPress={() => goWrite(trimmed)}
                disabled={!canSubmit}
                size="lg"
                fullWidth
                iconRight={
                  canSubmit ? (
                    <ArrowRight size={18} color={tokens.color.white} strokeWidth={2.2} />
                  ) : undefined
                }
              />
              <Button
                label="닉네임 표시 안해도 괜찮아요."
                onPress={() => goWrite(ANON_NICK)}
                variant="outline"
                size="lg"
                fullWidth
              />
            </View>
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
    paddingTop: tokens.space[6],
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -1,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.4,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    marginTop: tokens.space[2],
  },
  fieldWrap: {
    marginTop: tokens.space[8],
    gap: tokens.space[2],
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.4,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  actions: {
    marginTop: tokens.space[6],
    gap: tokens.space[2],
  },
});
