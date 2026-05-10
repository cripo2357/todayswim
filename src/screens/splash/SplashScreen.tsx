// Figma: 3:387 (스플래시) — 브랜드 블루 배경 + 워드마크 + 태그라인 + 진행바 + 카피라이트
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import BrandWordmark from '@assets/illustrations/brand-wordmark.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WORDMARK_WIDTH = Math.round(SCREEN_WIDTH * 0.7);
const WORDMARK_HEIGHT = Math.round((WORDMARK_WIDTH * 108) / 288);
const PROGRESS_WIDTH = Math.round(SCREEN_WIDTH * 0.7);
const TOP_OFFSET = Math.round(SCREEN_HEIGHT * 0.32); // 워드마크 윗변이 화면 32% 지점
const SPLASH_DURATION = 2500;

export function SplashScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const progress = React.useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // width 보간은 네이티브 드라이버 미지원
    });
    animation.start(({ finished }) => {
      if (finished) navigation.replace('MapMain');
    });

    const listenerId = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
    });
    return () => {
      progress.removeListener(listenerId);
      animation.stop();
    };
  }, [navigation, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <View style={styles.topGroup}>
        <BrandWordmark width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} />
        <Text style={styles.tagline}>수영 바보들을 위한 수영장 지도</Text>
      </View>

      <View
        style={[
          styles.bottomGroup,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: fillWidth }]} />
        </View>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.brandBlue,
    justifyContent: 'space-between',
  },
  topGroup: {
    alignItems: 'center',
    paddingTop: TOP_OFFSET, // 화면 높이의 32% 지점에서 워드마크 시작
  },
  tagline: {
    ...tokens.text.body,
    color: tokens.color.white,
    marginTop: tokens.space[5],
  },
  bottomGroup: {
    alignItems: 'center',
  },
  progressTrack: {
    width: PROGRESS_WIDTH,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brandYellow,
    borderRadius: tokens.radius.pill,
  },
  percent: {
    ...tokens.text.bodyBold,
    color: tokens.color.white,
    marginTop: tokens.space[3],
  },
  copyright: {
    ...tokens.text.bodySm,
    color: tokens.color.white,
    marginTop: tokens.space[4],
  },
});
