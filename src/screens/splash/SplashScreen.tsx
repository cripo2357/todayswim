// Figma: 90:3143 (스플래시) — 민트 cyan bg + 워드마크 + 태그라인 + 진행바 + 카피라이트.
// + 우측에 쉼표 모양 물방울이 아래에서 위로 떠오르는 애니메이션 (Pool's day 컨셉 — 물).

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
import Constants from 'expo-constants';
import type { RootStackParamList } from '@/navigation/types';
import { useAuth } from '@/store/auth';
import { fetchAppStatus } from '@/hooks/useAppStatus';
import { isAppBelow } from '@/lib/version';
import { tokens } from '@/styles/tokens';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday.svg';
import DropletComma from '@assets/illustrations/droplet-comma.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 워드마크 viewBox 872x518 (이전 257x153 비율과 동일, 고해상도 export).
const WORDMARK_WIDTH = 240;
const WORDMARK_HEIGHT = Math.round((WORDMARK_WIDTH * 518) / 872);

// Figma 90:3156 — 진행바 240px 폭, 8px 높이, radius 8.
const PROGRESS_WIDTH = 240;
const PROGRESS_HEIGHT = 8;

const SPLASH_DURATION = 2500;

// Figma 90:3143 배경 = 앱 아이콘과 동일 cyan
const BG_CYAN = '#63CBE8';

// 진행바 아래 표시할 재밌는 로딩 문구. mount 시 1회 랜덤 픽.
const LOADING_MESSAGES = [
  '수경에 안티포그액 바르는 중...',
  '수영복 챙기는 중...',
  '간식 바나나 챙기는 중...',
  '수영전 스트레칭 중',
  '오늘 사용할 수모 고르는 중...',
  '오리발 챙기는 중...',
  '수영전 샤워하는 중...',
  '수영 입장권 구매하는 중...',
  '스마트워치 착용 중...',
];

// === 떠오르는 쉼표 물방울 ===
// "Pool's" apostrophe 위치에서 동일한 크기의 쉼표가 일정 간격으로 솟아올라 화면 위로 사라짐.
// 사이즈/위치 변주 X — 같은 자리에서 같은 크기로 stream 형태.
// useNativeDriver: true 로 60fps.
const DROPLET_COUNT = 8;

// 새 워드마크(257x153)의 apostrophe 위치에 맞춰 droplet 정렬.
// 화면 표시 wordmark 240 wide, 화면 가운데 정렬.
// 사용자 시각 보정 누적값으로 SCREEN_WIDTH/2 + 67 사용.
// View.left는 왼쪽 가장자리 기준이라 droplet 폭의 절반(7)만큼 빼서 중심 정렬.
const APOSTROPHE_CENTER_X = SCREEN_WIDTH / 2 + 64;

// Apostrophe Y 위치 — 워드마크 top: SH/2 - 200, 워드마크 height ≈ 130.
// apostrophe 위치는 워드마크 상단 약 7% 지점 (path y=6.4 of 93).
// → SH/2 - 200 + (6/93)*130 ≈ SH/2 - 192
// 시작은 apostrophe 정중앙에서 살짝 아래(완전히 가려져서 솟아나는 느낌).
const APOSTROPHE_Y_BASE = SCREEN_HEIGHT / 2 - 185;
const RISE_TO = -30; // 화면 위로 사라짐

// Apostrophe 자체 크기 매치 — 원본 10x15, wordmark 표시 배율 220/156=1.41 → 14x21
const DROPLET_W = 14;
const DROPLET_H = 21;

interface Droplet {
  id: number;
  delay: number;
  y: Animated.Value;
  opacity: Animated.Value;
}

const RISE_DURATION = 2400; // 모든 droplet 동일 — 같은 속도로 솟아오름

function createDroplets(): Droplet[] {
  // 시간을 고르게 분할해서 일정 간격으로 발사 (DROPLET_COUNT 개가 RISE_DURATION 안에 stream 형성)
  const interval = RISE_DURATION / DROPLET_COUNT;
  return Array.from({ length: DROPLET_COUNT }, (_, i) => ({
    id: i,
    delay: Math.round(interval * i),
    y: new Animated.Value(APOSTROPHE_Y_BASE),
    opacity: new Animated.Value(0),
  }));
}

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const progress = React.useRef(new Animated.Value(0)).current;

  // mount 시 1회 랜덤 픽 — 매 실행마다 다른 문구가 노출되도록.
  const loadingMessage = React.useMemo(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    [],
  );

  // droplets는 mount 시 1회만 생성 (Animated.Value는 ref로 유지)
  const dropletsRef = React.useRef<Droplet[]>(createDroplets());
  const droplets = dropletsRef.current;

  // 진행바 애니메이션 + 인증/약관 게이트
  React.useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // width 보간은 네이티브 X
    });
    anim.start(async ({ finished }) => {
      if (!finished) return;
      // 부분 폐쇄형 — 스플래시는 토큰 hydration만 기다리고 무조건 지도로 진입.
      // 토큰 유효 → 로그인 상태로 입장 / 무효 → 게스트로 입장.
      // 약관·프로필 등록은 사용자가 맵에서 로그인 버튼을 누른 뒤에만 강제.
      while (!useAuth.getState().hydrated) {
        await new Promise((r) => setTimeout(r, 50));
      }

      // 부팅 게이트 — Supabase app_status 1행 fetch.
      // 점검 ON → Maintenance / 클라이언트 < 최소버전 → AppUpdateRequired.
      // 네트워크 실패는 무시(=null)하고 통과 — OfflineGate가 ErrorNoInternet으로 처리.
      const status = await fetchAppStatus().catch(() => null);
      if (status?.maintenanceActive) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Maintenance',
              params: status.maintenanceLabel
                ? { reopenLabel: status.maintenanceLabel }
                : undefined,
            },
          ],
        });
        return;
      }
      const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
      if (status?.minAppVersion && isAppBelow(currentVersion, status.minAppVersion)) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'AppUpdateRequired',
              params: {
                versionLabel: `최소 ${status.minAppVersion} 이상`,
                iosUrl: status.iosStoreUrl ?? undefined,
                androidUrl: status.androidStoreUrl ?? undefined,
              },
            },
          ],
        });
        return;
      }

      navigation.replace('MapMain');
    });
    return () => {
      anim.stop();
    };
  }, [navigation, progress]);

  // 물방울 무한 루프 — 모든 droplet이 같은 위치/속도, delay만 다름.
  // apostrophe 위치에서 출발 → 화면 위로 일정한 속도로 상승.
  React.useEffect(() => {
    const animations = droplets.map((d) => {
      const rise = Animated.parallel([
        Animated.timing(d.y, {
          toValue: RISE_TO,
          duration: RISE_DURATION,
          easing: Easing.linear, // 일정한 속도로 위로 (자연스러운 stream)
          useNativeDriver: true,
        }),
        // opacity: 0 → 0.95 → 0 (apostrophe 위치 부근에선 fade in, 화면 위에선 fade out)
        Animated.sequence([
          Animated.timing(d.opacity, {
            toValue: 0.95,
            duration: RISE_DURATION * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(d.opacity, {
            toValue: 0.95,
            duration: RISE_DURATION * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(d.opacity, {
            toValue: 0,
            duration: RISE_DURATION * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]);
      // reset to apostrophe (opacity 0이라 visual jump 안 보임)
      const reset = Animated.parallel([
        Animated.timing(d.y, {
          toValue: APOSTROPHE_Y_BASE,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(d.opacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(d.delay),
          rise,
          reset,
        ]),
      );
    });
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [droplets]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      {/* 떠오르는 쉼표 물방울 — 모두 동일 위치/크기, apostrophe에서 솟아오름. */}
      {droplets.map((d) => (
        <Animated.View
          key={d.id}
          pointerEvents="none"
          style={[
            styles.droplet,
            {
              opacity: d.opacity,
              transform: [{ translateY: d.y }],
            },
          ]}
        >
          <DropletComma width={DROPLET_W} height={DROPLET_H} color="#FFFFFF" />
        </Animated.View>
      ))}

      {/* 중앙 워드마크 + 태그라인 */}
      <View style={styles.center} pointerEvents="none">
        <BrandWordmark width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} />
        <Text style={styles.tagline}>같이 수영할래?</Text>
      </View>

      {/* 하단 진행바 + 카피라이트 */}
      <View
        style={[
          styles.bottomGroup,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        pointerEvents="none"
      >
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: fillWidth }]} />
        </View>
        <Text style={styles.loadingMessage}>{loadingMessage}</Text>
        <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_CYAN,
  },
  // Figma 90:3146 — 화면 중앙 약간 위. 워드마크 + 20gap + 태그라인.
  center: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 20,
    zIndex: 2,
  },
  // Figma 90:3154 — Regular 19/19 tracking -0.228 색상 #F2F2F7
  tagline: {
    fontSize: 19,
    lineHeight: 19,
    letterSpacing: -0.228,
    fontFamily: tokens.font.sans,
    color: '#F2F2F7',
    textAlign: 'center',
  },
  // Figma 90:3155 — 화면 하단 (top calc(50% + 266px)에서 위치 ≈ 화면 80%).
  bottomGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  // Figma 90:3156 — width 240, h 8, radius 8, bg #E2E8F0
  progressTrack: {
    width: PROGRESS_WIDTH,
    height: PROGRESS_HEIGHT,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Figma 90:3156 fill — bg pd-byellow #EAFF00, radius 1234 (full)
  progressFill: {
    height: '100%',
    backgroundColor: '#EAFF00',
    borderRadius: 9999,
  },
  // Figma 90:3143 — 진행바 아래 로딩 문구. 톤 살짝 낮춰서 카피라이트와 위계 구분.
  loadingMessage: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#F2F2F7',
    textAlign: 'center',
    marginTop: 8,
  },
  copyright: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: tokens.color.white,
    textAlign: 'center',
    marginTop: 8,
  },
  // 떠오르는 쉼표 droplet — 모두 같은 위치(x), 같은 크기. apostrophe에서 일정 속도로 위로.
  // left = apostrophe 중심 x - droplet 폭의 절반 → droplet 중심이 apostrophe 중심과 일치.
  // y와 opacity만 Animated로 조정.
  droplet: {
    position: 'absolute',
    left: APOSTROPHE_CENTER_X - DROPLET_W / 2,
    width: DROPLET_W,
    height: DROPLET_H,
    zIndex: 1,
  },
});
