// Figma: 38:610 (수영장 추가 요청 - 이름 입력) / 38:719 (수영장 정보 수정 요청 - 이름+수정요청)
//
// 좌표 입력은 사용자에게 부담/리스크가 커서 받지 않음 (사용자에게 일 시키지 않는다 원칙).
// 운영자가 검수 단계에서 네이버 지도로 직접 좌표 확인 후 pools 테이블에 INSERT.
import React from 'react';
import {
  View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowRight } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSubmitPool } from '@/hooks/useSubmitPool';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

const DESC_MAX = 300;

export function PoolNameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PoolName'>>();
  const isEdit = route.params?.mode === 'edit';

  const submitMutation = useSubmitPool();

  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  // 입력값이 있기만 하면 활성화. edit 모드는 이름 + 수정 요청 둘 다.
  const nameOk = name.trim().length > 0;
  const canSubmit = isEdit ? nameOk && desc.trim().length > 0 : nameOk;

  const heading = isEdit
    ? '정보를 수정하고 싶은\n수영장 이름을 입력하세요.'
    : '추가하고 싶은\n수영장 이름을 입력하세요.';
  const ctaLabel = isEdit ? '수영장 정보 수정 요청' : '수영장 추가 요청';

  const onSubmit = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    try {
      await submitMutation.mutateAsync({
        mode: isEdit ? 'edit' : 'create',
        poolId: route.params?.poolId,
        poolName: name,
        description: desc,
      });
      navigation.navigate('PoolDone', { mode: isEdit ? 'edit' : 'create' });
    } catch (e) {
      Alert.alert('요청 전송에 실패했어요', '잠시 후 다시 시도해주세요.');
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
          <View style={styles.body}>
            <Text style={styles.heading}>{heading}</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>수영장 이름</Text>
              <Input
                variant="jumbo"
                placeholder="예) 풀스데이 수영장"
                autoFocus
                maxLength={40}
                value={name}
                onChangeText={setName}
                returnKeyType={isEdit ? 'next' : 'done'}
                onSubmitEditing={isEdit ? undefined : (canSubmit ? onSubmit : undefined)}
              />
            </View>

            {/* Figma 47:1094 — edit 모드 전용 수정 요청 textarea + 카운터 */}
            {isEdit ? (
              <View style={styles.descWrap}>
                <Text style={styles.fieldLabel}>수정 요청</Text>
                <View style={styles.textareaBox}>
                  <TextInput
                    multiline
                    placeholder="어떤 정보를 수정하고 싶은지 자세하게 설명 부탁드립니다."
                    placeholderTextColor={tokens.color.ink400}
                    style={styles.textareaInput}
                    value={desc}
                    onChangeText={setDesc}
                    maxLength={DESC_MAX}
                    textAlignVertical="top"
                  />
                  <Text style={styles.counterText}>
                    {desc.length}/{DESC_MAX}
                  </Text>
                </View>
              </View>
            ) : null}

            <Button
              label={ctaLabel}
              onPress={onSubmit}
              disabled={!canSubmit || submitMutation.isPending}
              loading={submitMutation.isPending}
              size="lg"
              fullWidth
              style={styles.submitBtn}
              iconRight={
                <ArrowRight
                  size={18}
                  color={canSubmit ? tokens.color.white : tokens.color.pool300}
                  strokeWidth={2.2}
                />
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
  // Figma: 30/38 tracking -0.39
  heading: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  fieldWrap: {
    marginTop: tokens.space[8],
    gap: tokens.space[2],
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  descWrap: {
    marginTop: tokens.space[4],
    gap: tokens.space[2],
    height: 200,
  },
  // Figma 47:1096 — bg white, border 1px #CBD5E1, radius 24, padding 12
  textareaBox: {
    flex: 1,
    backgroundColor: tokens.color.bgPaper,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    borderRadius: 24,
    padding: 12,
  },
  textareaInput: {
    flex: 1,
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: tokens.color.ink900,
    padding: 0,
  },
  counterText: {
    alignSelf: 'flex-end',
    fontFamily: tokens.font.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    color: tokens.color.ink400,
  },
  submitBtn: {
    marginTop: tokens.space[6],
  },
});
