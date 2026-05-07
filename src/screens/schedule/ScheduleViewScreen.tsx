// Figma: 5:14288 (시간표 조회)
// TODO: 7요일 칩 + 시간 슬롯 그리드 + "업데이트: 2026.10.31 - 수영맨" 크레딧
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function ScheduleViewScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>시간표 조회 (작업 중)</Text>
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
