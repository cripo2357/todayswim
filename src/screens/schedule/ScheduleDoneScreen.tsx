// Figma: 5:19712 (시간표 등록 요청 완료)
// TODO: RequestComplete 컴포넌트 사용 (request-complete.svg + 텍스트 + Primary 버튼)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function ScheduleDoneScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>시간표 등록 요청 완료 (작업 중)</Text>
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
