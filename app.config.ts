import { ExpoConfig, ConfigContext } from 'expo/config';

// 테스트용 무제한 키. 보안 제한은 Dev Build 후 SHA-1 받아 Google Cloud 콘솔에서 추가.
// EAS 클라우드 빌드 prebuild 단계에서 process.env가 비어있는 케이스가 있어 fallback 박아둠.
const GOOGLE_MAPS_KEY_FALLBACK = 'AIzaSyDfBj9mzxYS4E-p-u09AWQlt3fXjRkOgYg';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Pool's Day",
  slug: 'todayswim', // EAS 내부 식별자(슬러그)는 그대로. 표시 이름은 expo.dev에서 'poolsday'로 변경됨.
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'poolsday',
  userInterfaceStyle: 'light', // DESIGN.md §1-4 다크모드는 Phase 2

  icon: './assets/icon.png',

  ios: {
    bundleIdentifier: 'com.cripo.poolsday',
    supportsTablet: false,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        '근처 수영장을 거리순으로 보여드리려면 위치 권한이 필요해요.',
    },
    config: {
      googleMapsApiKey:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || GOOGLE_MAPS_KEY_FALLBACK,
    },
  },

  android: {
    package: 'com.cripo.poolsday',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#007AFF',
    },
    config: {
      googleMaps: {
        apiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || GOOGLE_MAPS_KEY_FALLBACK,
      },
    },
  },

  extra: {
    eas: {
      projectId: '4fe982df-1461-43b3-8cf2-5c5f3c150ce6',
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
