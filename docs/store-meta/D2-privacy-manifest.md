# iOS Privacy Manifest 설정 가이드 (P3 / D2)

iOS 17+ 부터 SDK·앱 모두 `PrivacyInfo.xcprivacy` 가 필수. App Store 심사
거부 사유 1위. Expo SDK 50+ 는 `app.config.ts` 의 `ios.privacyManifests` 로
선언할 수 있다.

## 적용 방법

`app.config.ts` 의 `ios` 블록에 아래 `privacyManifests` 추가 → 다음 EAS 빌드
부터 `PrivacyInfo.xcprivacy` 자동 생성·번들.

## 선언 내용 — Pool's day 기준

SPEC §5 의 수집 데이터 + 사용 SDK 점검 결과:

### 1. Tracking (광고 추적) — `NSPrivacyTracking`
- **false** — 광고 SDK·트래커 일체 없음.
- `NSPrivacyTrackingDomains: []`

### 2. Collected Data Types — `NSPrivacyCollectedDataTypes`

| Data type | Linked to user | Tracking | Purposes | 비고 |
|---|---|---|---|---|
| **Name** (닉네임) | Yes | No | `AppFunctionality` | 친구 표시·검색 |
| **Email Address** | Yes | No | `AppFunctionality` | Supabase Auth 식별만, profiles 테이블 미복사 |
| **User ID** (auth.uid) | Yes | No | `AppFunctionality` | 계정 식별 |
| **Photos** (avatar 업로드) | Yes | No | `AppFunctionality` | 본인 프로필 사진. 다른 사용자도 볼 수 있음(공개) |
| **Customer Support** (운영 문의) | Yes | No | `CustomerSupport` | FAQ 메일 CTA (mailto) — 사용자가 직접 보내는 메일 |
| **Other User Content** (응원 메시지·일정) | Yes | No | `AppFunctionality` | 후원 응원글 / 수영 일정 (공개 범위 따라) |
| **Coarse Location** | No | No | `AppFunctionality` | 지도 중심 / 거리 정렬. 메모리만, 서버 미전송 — Linked=No |
| **Product Interaction** | No | No | `Analytics` | Firebase Analytics (Google LLC, 미국). 화면 진입·핵심 액션 이벤트, 앱 버전, OS 종류. 닉네임/이메일/사용자 ID/GPS 미전송 — Linked=No |
| **Crash Data** | Yes | No | `Analytics` | Sentry (Functional Software Inc., 미국). 스택 트레이스 + 친구 코드 (로그인 시) |
| **Performance Data** | No | No | `Analytics` | Sentry (tracesSampleRate=0 이라 사실상 수집 X). 또는 Firebase Analytics 의 앱 버전·OS — Linked=No |

⚠️ **수집 안 함**:
- 정확한 위치 (precise location) — coarse 만
- 전화번호
- 주소
- 사진 (사용자 라이브러리 스캔) — picker 만, 선택한 1장
- 연락처
- 결제·금융 정보
- 건강·피트니스
- 메시징 (다른 앱)
- 검색 이력
- 광고 데이터

### 3. Accessed API Types — `NSPrivacyAccessedAPITypes`

iOS 17+ 가 declare 강제하는 API 사용 — Expo 기본 SDK 들이 사용함:

| API | Reason code | 이유 |
|---|---|---|
| `NSPrivacyAccessedAPICategoryUserDefaults` | `CA92.1` | Expo·AsyncStorage 가 NSUserDefaults 사용 |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | `C617.1` | expo-file-system / 이미지 캐시 |
| `NSPrivacyAccessedAPICategorySystemBootTime` | `35F9.1` | expo / React Native 진단 |
| `NSPrivacyAccessedAPICategoryDiskSpace` | `E174.1` | expo-image-picker 가 diskspace 체크 |

## app.config.ts 추가 블록 (코드)

```ts
ios: {
  bundleIdentifier: 'com.cripo.poolsday',
  supportsTablet: false,
  infoPlist: {
    NSLocationWhenInUseUsageDescription:
      '근처 수영장을 거리순으로 보여드리려면 위치 권한이 필요해요.',
  },
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
        NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeCoarseLocation',
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
```

## App Store Connect 의 "App Privacy" 질문지

Privacy Manifest 와 별도로 App Store Connect 에 동일 정보를 입력해야 함.
출시 등록 시 자동 채워지지 않음. 위 표를 그대로 옮겨 입력.
