// Figma: 38:610 (수영장 추가 요청 - 이름 입력) / 38:719 (수영장 정보 수정 요청 - 이름 입력)
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
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

export function PoolNameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PoolName'>>();
  const isEdit = route.params?.mode === 'edit';

  const [name, setName] = React.useState('');
  const canSubmit = name.trim().length >= 2;

  const heading = isEdit
    ? '정보를 수정하고 싶은\n수영장 이름을 입력하세요.'
    : '추가하고 싶은\n수영장 이름을 입력하세요.';
  const ctaLabel = isEdit ? '수영장 정보 수정 요청' : '수영장 추가 요청';

  const onSubmit = () => {
    navigation.navigate('PoolDone', { mode: isEdit ? 'edit' : 'create' });
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
            <Text style={styles.heading}>{heading}</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>수영장 이름</Text>
              <Input
                placeholder="예) 관악구민종합체육센터"
                autoFocus
                maxLength={40}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? onSubmit : undefined}
              />
            </View>

            <Button
              label={ctaLabel}
              onPress={onSubmit}
              disabled={!canSubmit}
              size="lg"
              fullWidth
              style={styles.submitBtn}
              iconRight={
                canSubmit ? (
                  <ArrowRight size={18} color={tokens.color.white} strokeWidth={2.2} />
                ) : undefined
              }
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
    paddingTop: tokens.space[6],
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -1,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
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
  submitBtn: {
    marginTop: tokens.space[6],
  },
});
