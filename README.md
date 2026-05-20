# Pool's day (오늘도 수영)

> *수영 바보들을 위한 수영장 지도*
>
> *No fooling. Just swimming.*

자유수영 시간표 + 수영장 정보를 사용자가 함께 만드는 모바일 앱.
React Native (Expo) 네이티브 앱. CRIPO의 두 번째 서비스.

---

## 빠른 시작

```bash
npm install
cp .env.example .env
# .env 채우고 (Google Maps iOS/Android 키)
npx expo start --dev-client
```

> ⚠ Expo Go에선 안 돌아감 — `react-native-maps`가 네이티브 모듈이라
> **Custom Dev Build 필요**.
> EAS: `eas build --profile development --platform ios|android`
> 또는 로컬 prebuild: `npx expo prebuild` → Xcode/Android Studio.

---

## 주요 문서

- [SPEC.md](SPEC.md) — 제품 스펙 (브랜드 / 기술 / 화면 / 기능 / 셋업)
- [DESIGN.md](DESIGN.md) — 디자인 가이드라인 (컬러 / 타이포 / 컴포넌트 / 보이스)
- [docs/PROGRESS_LOG.md](docs/PROGRESS_LOG.md) — 작업 기록

---

## 폴더 구조

```
.
├── App.tsx                       엔트리 (NavigationContainer + QueryClient)
├── app.config.ts                 Expo 설정 + Google Maps 키 주입
├── babel.config.js               module-resolver alias
├── metro.config.js               svg-transformer 등록
├── tsconfig.json                 @/ @assets/ 경로 별칭
├── assets/
│   ├── fonts/                    Pretendard 4 + Fraunces 4
│   └── illustrations/            request-complete.svg, more.svg
├── src/
│   ├── navigation/               RootNavigator + types
│   ├── screens/                  9개 화면 (Figma 노드 ID 주석)
│   ├── components/
│   │   ├── ui/                   Button, Input, Chip
│   │   ├── layout/               ScreenContainer, AppHeader
│   │   ├── map/                  PoolMarker, PoolBottomCard
│   │   └── feedback/             RequestComplete
│   ├── store/                    Zustand: favorites(persist), selection, scheduleDraft
│   ├── data/                     dummyPools (서울 8개 + 시간표 2개)
│   ├── hooks/                    useFonts, useGeolocation
│   ├── types/                    Pool, Schedule
│   └── styles/tokens.ts          DESIGN.md 토큰의 TS 버전
└── design-refs/figma/            Figma 시안 PNG (gitignored, 로컬 전용)
```

## 디자인 시스템

색상·타이포·간격·그림자·모션 토큰은 [src/styles/tokens.ts](src/styles/tokens.ts)에 통일.
**하드코딩 hex 절대 금지** — 항상 `tokens.color.xxx`로.

## 화면 (Figma 매핑)

| Figma 노드 | 화면 | 상태 |
|---|---|---|
| 3:387 | SplashScreen | 1.5s 후 MapMain 자동 |
| 5:12241/12919/11479/19049 | MapScreen | 4상태 통합 (선택 없음 / 작성하기 / 보기 / 찜) |
| 5:14288 | ScheduleViewScreen | 7요일 칩 + 시간 슬롯 |
| 5:14808 | ScheduleNicknameScreen | 닉네임 입력 (jumbo Input) |
| 5:15159 | ScheduleWriteScreen | 7요일 × 4파트 슬롯 작성 |
| 5:15381 | ScheduleTimeScreen | 바텀시트 모달 (시간 + duration) |
| 5:19712 | ScheduleDoneScreen | RequestComplete |
| 5:16341 | PoolNameScreen | 풀 등록·수정 입력 |
| 5:18464 | PoolDoneScreen | RequestComplete |
| 5:2287 | MoreScreen | more.svg + 풀 등록·수정 진입 |

## 검증

- `npx tsc --noEmit` — 0 에러
- `npx expo-doctor` — 18/18
- `npx expo export --platform ios` — 정상 번들

## 라이선스

Private.
