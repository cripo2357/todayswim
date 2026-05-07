// Figma: 5:16341 (수영장 등록 또는 정보 수정 - 수영장 이름 입력)
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
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

export function PoolNameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PoolName'>>();
  const isEdit = route.params?.mode === 'edit';

  const [name, setName] = React.useState('');
  const canSubmit = name.trim().length >= 2;

  const onSubmit = () => {
    // TODO: 백엔드 등록 (지금은 더미 → 바로 완료 화면)
    navigation.navigate('PoolDone');
  };

  return (
    <ScreenContainer withHorizontalPadding={false}>
      <AppHeader title={isEdit ? '수영장 정보 수정' : '수영장 등록 요청'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.body}>
            <Text style={styles.heading}>
              어떤 수영장인가요?
            </Text>
            <Text style={styles.sub}>
              정확한 시설명을 적어주시면 관리자가 확인 후 등록해드릴게요.
            </Text>

            <View style={styles.inputWrap}>
              <Input
                variant="jumbo"
                placeholder="예) 잠실종합운동장 수영장"
                autoFocus
                maxLength={40}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? onSubmit : undefined}
              />
            </View>

            <View style={styles.spacer} />

            <Button
              label={isEdit ? '수정 요청' : '등록 요청'}
              onPress={onSubmit}
              disabled={!canSubmit}
              size="lg"
              fullWidth
              style={styles.submitBtn}
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
  heading: { ...tokens.text.h1, color: tokens.color.ink900 },
  sub: { ...tokens.text.body, color: tokens.color.ink500, marginTop: tokens.space[2] },
  inputWrap: { marginTop: tokens.space[8] },
  spacer: { flex: 1 },
  submitBtn: { marginBottom: tokens.space[6] },
});
