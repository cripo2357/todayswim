import { ExpoConfig, ConfigContext } from 'expo/config';

// Naver Cloud Platform Maps Client ID. 모바일 SDK 인증 키.
// 번들 ID(com.cripo.poolsday)로 Naver 콘솔에서 제한돼 있어 코드 공개돼도 타 앱에서 사용 불가.
// Client Secret은 서버 API용 — 모바일 번들에 절대 포함 안 함.
//   → Geocoding 등 Secret 필요한 호출은 별도 백엔드(Supabase Edge Function 등)로 분리.
// .env의 EXPO_PUBLIC_NAVER_MAP_CLIENT_ID에서 읽고, EAS 빌드는 eas env로 동일 변수 주입.
// env 우선, 없으면 공개 식별자 폴백. 번들 ID로 Naver 콘솔 제한돼 코드
// 노출 안전(EXPO_PUBLIC_*는 어차피 JS 번들 인라인). EAS env에 변수가
// 빠져 있어도 빌드 config(expo config --json)가 죽지 않게 폴백 보장.
const NAVER_MAPS_CLIENT_ID =
  process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? 'ud6qr6hymv';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Pool's day",
  slug: 'todayswim', // EAS 내부 식별자(슬러그)는 그대로. 표시 이름은 expo.dev에서 'poolsday'로 변경됨.
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'poolsday',
  userInterfaceStyle: 'light', // DESIGN.md §1-4 다크모드는 Phase 2
  // @mj-studio/react-native-naver-map 2.x는 New Architecture 필수.
  // 비활성화 상태면 NaverMapView ViewManager가 등록 안 돼서 com.facebook.react.uimanager 에러 발생.
  newArchEnabled: true,

  icon: './assets/icon.png',

  ios: {
    bundleIdentifier: 'com.cripo.poolsday',
    supportsTablet: false,
    // Firebase Analytics iOS config — 크리스가 Firebase 콘솔에서 iOS 앱을
    // 등록하고 GoogleService-Info.plist 를 받아 프로젝트 루트에 배치하면
    // @react-native-firebase/app 플러그인이 자동으로 ios 번들에 포함.
    googleServicesFile:
      process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        '근처 수영장을 거리순으로 보여드리려면 위치 권한이 필요해요.',
    },
    // iOS 17+ Privacy Manifest (D2). 상세 근거: docs/store-meta/D2-privacy-manifest.md
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType:
            'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
        {
          NSPrivacyAccessedAPIType:
            'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1'],
        },
        {
          NSPrivacyAccessedAPIType:
            'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
        },
        {
          NSPrivacyAccessedAPIType:
            'NSPrivacyAccessedAPICategoryDiskSpace',
          NSPrivacyAccessedAPITypeReasons: ['E174.1'],
        },
      ],
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeName',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeEmailAddress',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeUserID',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePhotosorVideos',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
        {
          NSPrivacyCollectedDataType:
            'NSPrivacyCollectedDataTypeOtherUserContent',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
        {
          NSPrivacyCollectedDataType:
            'NSPrivacyCollectedDataTypeCoarseLocation',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeCrashData',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAnalytics',
          ],
        },
        {
          NSPrivacyCollectedDataType:
            'NSPrivacyCollectedDataTypePerformanceData',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAnalytics',
          ],
        },
      ],
    },
  },

  android: {
    package: 'com.cripo.poolsday',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    // Firebase Analytics Android config — Android 앱 등록 후 받은
    // google-services.json 을 프로젝트 루트에 배치.
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      // 아이콘 배경 cyan과 매치 (Android 시스템 마스크 모서리 잘림 영역도 같은 색).
      // assets/icon.png에서 직접 sample한 값.
      backgroundColor: '#63CBE8',
    },
  },

  extra: {
    eas: {
      projectId: '4fe982df-1461-43b3-8cf2-5c5f3c150ce6',
    },
  },

  plugins: [
    // 네이티브 스플래시 (JS 로드 전) — JS의 SplashScreen 와 색·아이콘 일치시켜
    // 매끄러운 transition. cyan bg + 워드마크의 단순 fallback 아이콘.
    // image 가 따로 없어서 일단 icon.png 재사용 — 가운데 정렬, resizeMode contain.
    [
      'expo-splash-screen',
      {
        backgroundColor: '#63CBE8',
        image: './assets/icon.png',
        imageWidth: 200,
      },
    ],
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
    // 프로필 이미지 등록 — 갤러리 픽. iOS 사진 보관함 권한 문구 주입.
    [
      'expo-image-picker',
      {
        photosPermission:
          '프로필 사진을 등록하려면 사진 보관함 접근 권한이 필요해요.',
      },
    ],
    // Google 로그인 (네이티브 SDK). iOS는 Google Cloud iOS client의
    // "iOS URL scheme"(reversed client ID)을 받은 뒤 iosUrlScheme에 채워야 함.
    // Android는 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID(웹 클라이언트 ID)로 idToken 발급.
    [
      '@react-native-google-signin/google-signin',
      {
        // Android는 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID로 동작 — iosUrlScheme는 무관.
        // iOS 빌드 전 Google Cloud iOS client의 "iOS URL scheme"을
        // GOOGLE_IOS_URL_SCHEME env에 채워야 실제 iOS 로그인 가능.
        iosUrlScheme:
          process.env.GOOGLE_IOS_URL_SCHEME ??
          'com.googleusercontent.apps.PLACEHOLDER-IOS-NOT-CONFIGURED',
      },
    ],
    // Kakao 로그인 OAuth 리다이렉트용 인앱 브라우저.
    'expo-web-browser',
    // Naver Maps SDK 플러그인 — Client ID 전달, Android 빌드 시 네이티브 SDK 자동 통합
    [
      '@mj-studio/react-native-naver-map',
      { client_id: NAVER_MAPS_CLIENT_ID },
    ],
    // Naver Maps Android SDK가 Naver 자체 Maven repo에 호스팅돼 있어서 추가 필요
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: ['https://repository.map.naver.com/archive/maven'],
        },
      },
    ],
    // Sentry 에러·크래시 리포팅 (P3-A6). JS 에러는 init 직후부터 보고,
    // 네이티브 크래시(NDK/Obj-C)는 다음 EAS 빌드 후 활성화. DSN 은
    // EXPO_PUBLIC_SENTRY_DSN env (없으면 init 이 no-op 처리).
    '@sentry/react-native/expo',
    // Firebase Analytics — 익명 통계(앱 사용 빈도·화면 진입·이벤트).
    // ios.googleServicesFile / android.googleServicesFile 의 config 파일과
    // 함께 동작. 파일이 없으면 EAS 빌드 시 실패하므로 크리스가 콘솔 작업
    // (Firebase 프로젝트 생성 + iOS/Android 앱 등록 → config 파일 다운)을
    // 완료한 후 다음 빌드에서 활성화. JS 런타임에서는 try-catch 로 패키지
    // 미로딩 상황도 안전(src/lib/analytics.ts no-op 폴백).
    '@react-native-firebase/app',
  ],
});
