// Figma: 5:12241 / 5:12919 / 5:11479 / 5:19049 (메인 지도 4상태 통합)
// TODO: react-native-maps 통합, 마커 렌더, 풀 카드 바텀시트
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/styles/tokens';

export function MapScreen() {
  return (
    <View style={styles.root}>
      <Text style={tokens.text.h2}>지도 화면 (작업 중)</Text>
      <Text style={[tokens.text.bodySm, styles.note]}>
        Figma 노드: 5:12241 (선택 없음) / 5:12919 (작성하기) / 5:11479 (보기) / 5:19049 (찜)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.layout.pagePadMobile,
  },
  note: {
    color: tokens.color.ink500,
    marginTop: tokens.space[2],
    textAlign: 'center',
  },
});
