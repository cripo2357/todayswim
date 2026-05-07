// Figma: 5:15381 (시간표 작성하기 - 타임 입력 모달)
// TODO: 바텀 드로어 모달 + 시간 칩(2시간 등) + 저장 버튼
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function ScheduleTimeScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>타임 작성 (작업 중)</Text>
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
