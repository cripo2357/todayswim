// Figma: 5:16341 (수영장 등록/정보수정 - 이름 입력)
// TODO: 큰 인풋(Input Text Jumbo) + Primary 버튼
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function PoolNameScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>수영장 이름 입력 (작업 중)</Text>
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
