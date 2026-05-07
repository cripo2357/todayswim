import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Pool's Day — Expo 앱 설정.
 *
 * Google Maps API 키는 `.env` (또는 EAS Secrets)에서 주입.
 * - iOS: ios.config.googleMapsApiKey
 * - Android: android.config.googleMaps.apiKey
 *
 * 키가 없어도 앱은 빌드되지만 지도가 표시 안 됨 → 개발 시 .env 채울 것.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Pool's Day",
  slug: 'todayswim',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'poolsday',
  userInterfaceStyle: 'light', // DESIGN.md §1-4 다크모드는 Phase 2

  ios: {
    bundleIdentifier: 'com.cripo.poolsday',
    supportsTablet: false,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        '근처 수영장을 거리순으로 보여드리려면 위치 권한이 필요해요.',
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
    },
  },

  android: {
    package: 'com.cripo.poolsday',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
      },
    },
  },

  plugins: [
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Pretendard-Regular.otf',
          './assets/fonts/Pretendard-Medium.otf',
          './assets/fonts/Pretendard-SemiBold.otf',
          './assets/fonts/Pretendard-Bold.otf',
          './assets/fonts/Fraunces-Regular.ttf',
          './assets/fonts/Fraunces-Italic.ttf',
          './assets/fonts/Fraunces-Bold.ttf',
          './assets/fonts/Fraunces-BoldItalic.ttf',
        ],
      },
    ],
    'expo-location',
  ],
});
