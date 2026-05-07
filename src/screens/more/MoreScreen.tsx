// Figma: 5:2287 (부가 기능)
// TODO: more.svg 일러스트 + "무엇을 도와드릴까요?" + 2개 버튼
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function MoreScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>부가 기능 (작업 중)</Text>
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
