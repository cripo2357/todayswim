// Figma: 5:18464 (수영장 등록/수정 요청 완료)
// TODO: RequestComplete 컴포넌트 재사용
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function PoolDoneScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>수영장 등록 요청 완료 (작업 중)</Text>
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
