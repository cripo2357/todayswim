// Figma 5:14288, 5:19712, 5:18464, 38:766, 5:2287 공통 — dark gray fullscreen + 가운데 흰 카드.
// presentation은 일반 stack 그대로. 화면 자체가 dark bg + centered card 로 보이게만 처리.

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/styles/tokens';

interface Props {
  children: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  /** 백드롭 탭하면 호출. 안 주면 무반응. */
  onBackdropPress?: () => void;
  /** 카드 좌우 padding 적용 여부 (기본 true). false 면 카드 안에서 직접 padding 처리. */
  withCardPadding?: boolean;
}

export function ModalCard({ children, cardStyle, onBackdropPress, withCardPadding = true }: Props) {
  return (
    <View style={styles.root}>
      <Pressable
        onPress={onBackdropPress}
        style={StyleSheet.absoluteFill}
        accessibilityRole={onBackdropPress ? 'button' : undefined}
        accessibilityLabel={onBackdropPress ? '닫기' : undefined}
      />
      <SafeAreaView style={styles.safeWrap} pointerEvents="box-none" edges={['top', 'bottom']}>
        <View
          style={[
            styles.card,
            withCardPadding && styles.cardPad,
            cardStyle,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3F4754', // Figma dark gray backdrop
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.layout.pagePadMobile,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: tokens.radius.xl,
    ...tokens.shadow.lg,
  },
  cardPad: {
    padding: tokens.space[6],
  },
});
