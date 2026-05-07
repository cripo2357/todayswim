// Figma: 5:15159 (시간표 작성하기 - 메인)
// TODO: 요일별 섹션 헤더 + 시간 슬롯 + 추가 버튼 + 저장 버튼
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function ScheduleWriteScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>시간표 작성 (작업 중)</Text>
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
