// 후원 문구 수정 시트 — 본인 카드의 "문구 수정" 버튼 진입.
//
// BottomSheet 안에 텍스트 영역(300자) + "작성 완료" 버튼. 신규 작성·기존 수정
// 모두 같은 시트 재사용(initialValue 로 분기).

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import { tokens } from '@/styles/tokens';

const MAX_LEN = 300;

export function DonationEditModal({
  visible,
  initialValue,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void> | void;
}) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LEN;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={initialValue.length > 0 ? '문구 수정' : '응원 문구 작성'}
    >
      <View style={styles.body}>
        <View style={styles.inputWrap}>
          <TextInput
            value={value}
            onChangeText={(t) => setValue(t.slice(0, MAX_LEN))}
            multiline
            placeholder="Pool's day를 응원하는 한 마디를 남겨주세요."
            placeholderTextColor={tokens.color.ink400}
            style={styles.input}
            textAlignVertical="top"
            maxLength={MAX_LEN}
          />
          <Text style={styles.counter}>
            {value.length}/{MAX_LEN}
          </Text>
        </View>
        <SheetCtaButton
          label="작성 완료"
          onPress={async () => {
            if (!canSubmit) return;
            await onSubmit(trimmed);
            onClose();
          }}
          disabled={!canSubmit}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  inputWrap: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    minHeight: 140,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  counter: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink400,
    alignSelf: 'flex-end',
  },
});
