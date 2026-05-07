// Figma: 3:387 (스플래시)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 1.5초 후 자동 진입 (작업 진행 중 — 더미)
  React.useEffect(() => {
    const t = setTimeout(() => navigation.replace('MapMain'), 1500);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>Pool's Day</Text>
      <Text style={styles.tagline}>풀스데이</Text>
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
  logo: {
    fontFamily: tokens.font.serifBoldItalic,
    fontSize: 56,
    color: tokens.color.pool700,
    letterSpacing: -1.12,
  },
  tagline: {
    ...tokens.text.body,
    color: tokens.color.ink500,
    marginTop: tokens.space[3],
  },
});
