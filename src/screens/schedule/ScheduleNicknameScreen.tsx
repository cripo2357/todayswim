// Figma: 5:14808 (시간표 작성하기 - 닉네임 입력)
// TODO: 큰 인풋(Input Text Jumbo) + Primary 버튼
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function ScheduleNicknameScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>닉네임 입력 (작업 중)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
