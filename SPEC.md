# 오늘도 수영 (Today, Swim)

> 매일 수영하는 사람들을 위한, 동네 자유수영 지도 앱

---

## 0. 브랜드 에센스

**서비스명:** 오늘도 수영
**영문:** Today, Swim *(코드베이스 식별자: `onuldo`)*
**한 줄 소개:** 오늘 갈 동네 수영장을 찾아주는 자유수영 지도

**슬로건**
- 메인: *오늘도, 수영.*
- 서브: *내일도 수영해야지.*
- 기능 카피: *오늘 갈 풀, 알려드려요.*

**보이스 톤** — 나지막하게, 다정하게, 기록하듯, 여백을 두고.

**카피 예시**
| 상황 | 카피 |
|---|---|
| 첫 방문 환영 | *"오늘도 수영하러 가시나요?"* |
| 빈 즐겨찾기 | *"아직 둘러본 풀이 없어요. 오늘 한 번 가볼까요?"* |
| 즐겨찾기 라벨 | *또 가고 싶은 곳* |
| 푸시 알림 | *"오늘은 어디서 수영하실까요?"* |
| 거리 표시 | *"여기서 1.2km"* |
| 검색창 placeholder | *"동네 이름이나 시설명을 입력해보세요"* |

---

## 1. 디자인 토큰

### 1-1. 색상

```css
--bg-cream:    #FAF8F3;   /* 메인 배경 */
--bg-paper:    #F2EDE4;   /* 카드 배경 */
--ink-deep:    #1B2845;   /* 본문, 헤딩 */
--ink-soft:    #4A5573;   /* 보조 텍스트 */
--mist-blue:   #A8C5DA;   /* 액센트, 포인트 */
--mist-deep:   #6B95B0;   /* 액센트 강조 */
--coral:       #E8A598;   /* 즐겨찾기, 좋아요 */
--line:        #E5DFD2;   /* 구분선 */
```

**핵심:** 형광 시안 절대 금지. 명도 낮은 미스트 블루로 가야 톤 살아있음.

### 1-2. 타이포그래피

- 국문 본문: **Pretendard** (400/500/600)
- 국문 제목·로고: **Noto Serif KR** (살짝 세리프로 어른스러움)
- 영문 강조: **Fraunces** (가변 세리프)

### 1-3. 레이아웃 원칙

- 한 화면에 한 가지 핵심 행동만
- 카드 사이 간격 16px 이상, 페이지 좌우 패딩 20px
- 모서리 둥글기 8~16px (너무 동글동글하지 않게)
- 그림자는 얕게 `0 2px 8px rgba(27,40,69,0.06)`

---

## 2. 프로젝트 개요

전국의 공공·사설 수영장을 지도에서 한눈에 보고, 내 위치 기준 거리순 정렬과 즐겨찾기 기능을 제공하는 React 웹앱.

**핵심 가치:** 매일 갈 수 있는 동네 자유수영 풀을 *조용히* 찾아준다.

**타깃 사용자**
- 자유수영을 일상 루틴으로 삼은 30~40대
- 새벽·점심·저녁 짧게 다녀오는 사람들
- 거창한 강습보다 "그냥 가서 헤엄치고 오는" 걸 좋아하는 사람

---

## 3. 기술 스택

> 2026-05-07 결정: **웹앱(Vite) → 네이티브 앱(Expo)** 으로 전환.
> 디자인은 모바일 우선이고, 사용자가 외출 중 위치 기반으로 풀을 찾는 시나리오가
> 핵심이라 네이티브가 더 적합. Figma 시안도 모바일 프레임(375×812)으로 작성됨.

| 레이어 | 선택 | 이유 |
|---|---|---|
| 런타임 | **Expo SDK + React Native + TypeScript** | 모바일 네이티브, OTA 업데이트 가능 |
| 스타일 | **RN StyleSheet** + 디자인 토큰(`tokens.ts`) | 표준, WellRing과 일관 |
| 상태 | **Zustand** (+ persist via AsyncStorage) | 보일러플레이트 적음, 영속화 쉬움 |
| 데이터 페칭 | **TanStack Query** | 캐싱·재시도·로딩상태 자동 |
| 지도 | **react-native-maps + Google Maps** (`PROVIDER_GOOGLE`) | 디자인 우선 결정. 풀 데이터는 자체 DB라 검색 API 의존도 낮음 → 무료 한도 내 |
| 라우팅 | **@react-navigation/native** (stack + bottom sheet) | RN 표준, WellRing과 일관 |
| 아이콘 | **lucide-react-native** (stroke-width 1.5) | DESIGN.md 명시 |
| 폰트 | **expo-font** + Pretendard(jsdelivr) + Fraunces(Google Fonts) | 정적 로딩 |
| SVG | **react-native-svg + svg-transformer** | 일러스트 import 용 |
| 환경변수 | **expo-constants** + `app.config.ts` | API 키 분리 |

> ⚠ Custom Dev Build 필수. Expo Go에선 react-native-maps·소셜 OAuth 안 돌아감.

---

## 4. 공공데이터 소스

### A. 메인: 전국 공공체육시설
- **출처:** 공공데이터포털 (data.go.kr)
- **검색:** "전국 공공체육시설 현황"
- **필드:** 시설명, 시도/시군구, 도로명주소, 위경도, 실내외구분, 시설유형
- **포맷:** CSV + Open API

### B. 보조: LOCALDATA 수영장업 인허가
- **URL:** https://www.localdata.go.kr/
- 사설 수영장(헬스장 부설 등) 보강용

### 운용 전략
1. **MVP:** CSV 한 번 다운로드 → `public/pools.json`으로 정적 임포트
2. **확장:** Open API 연동, 백엔드 또는 빌드 타임 fetch

---

## 5. 데이터 스키마

```typescript
// src/types/pool.ts
export type Region =
  | '서울' | '부산' | '대구' | '인천' | '광주' | '대전' | '울산' | '세종'
  | '경기' | '강원' | '충북' | '충남' | '전북' | '전남' | '경북' | '경남' | '제주';

export interface Pool {
  id: string;                       // "POOL_SEOUL_0001"
  name: string;                     // 시설명
  region: Region;
  district: string;                 // 시군구
  address: string;
  lat: number;
  lng: number;
  type: 'indoor' | 'outdoor' | 'both';
  ownership: 'public' | 'private';
  phone?: string;
  website?: string;
  laneCount?: number;
  poolLength?: number;              // m
  facilities?: string[];
  freeSwimHours?: string[];         // 자유수영 시간대 (확장 시)
}
```

---

## 6. 화면 구성 (네비게이션 스택)

> 2026-05-07 업데이트: Figma 시안 반영. 13개 노드 = 9개 고유 화면(메인 지도 4상태 통합).

```
Splash                         스플래시 (3:387)
└─ Main (Bottom Tab or Stack)
   ├─ MapMain                  메인 지도 (5:12241/12919/11479/19049의 4상태)
   │  └─ 마커 탭 → 풀 카드(바텀 시트) 표시
   │     ├─ "자유수영 시간표 보기" → ScheduleView
   │     └─ "자유수영 시간표 작성하기" → ScheduleNickname
   ├─ ScheduleView             시간표 조회 (5:14288)
   ├─ ScheduleSubmit Flow      시간표 작성 4스텝
   │  ├─ ScheduleNickname      닉네임 입력 (5:14808)
   │  ├─ ScheduleWrite         시간 슬롯·요일 선택 (5:15159)
   │  ├─ ScheduleTime          타임 작성 — 바텀 드로어 (5:15381)
   │  └─ ScheduleDone          요청 완료 (5:19712, request-complete.svg)
   ├─ PoolSubmit Flow          수영장 등록·수정
   │  ├─ PoolName              이름 입력 (5:16341)
   │  └─ PoolDone              완료 (5:18464, request-complete.svg)
   └─ More                     부가 기능 (5:2287, more.svg)
```

**메인 지도 화면 4상태:**

| 상태 | Figma | 트리거 | 하단 카드 CTA |
|---|---|---|---|
| A: 선택 없음 | 5:12241 | 첫 진입 | (카드 없음) |
| B: 풀 선택, 시간표 없음 | 5:12919 | 마커 탭 + 시간표 데이터 X | "자유수영 시간표 작성하기" (펜 아이콘) |
| C: 풀 선택, 시간표 있음 | 5:11479 | 마커 탭 + 시간표 데이터 O | "자유수영 시간표 보기" |
| D: 풀 선택, 찜한 곳 | 5:19049 | 마커 탭 + 즐겨찾기 = 노란 마커 | "자유수영 시간표 보기" |

**마커 컬러 매핑:**
- 일반 풀: `--pool-500` (파랑)
- 찜한 풀: `--fool-yellow` (노랑) — DESIGN.md §1-2의 "별 아이콘" 토큰 재활용
- 주차장: `P` 마커 (별도 이모지/마커 — 디자인 노트만 있고 향후 결정)

---

## 7. 기능 명세

### 7-0. 시간표 크라우드소싱 (MVP 핵심)
> 2026-05-07: Figma 디자인에 포함되어 SPEC §12 차후 확장 → MVP 핵심으로 승격.

- 사용자가 자유수영 시간표를 직접 등록·수정 → 다른 사용자에 공유
- "업데이트: 2026.10.31 - 수영맨" 같은 작성자 크레딧 표시
- 4스텝 입력: 닉네임 → 요일/시간 슬롯 → 시간 상세 → 완료
- 관리자 검수 후 게시되는 흐름 (스펙: "관리자가 확인 후 등록")
- 수영장 자체도 등록·정보수정 요청 가능 (별도 2스텝 플로우)

### 7-1. 실내/야외 구분
- `type` 필드 활용
- UI: 칩 버튼 `전체 / 실내 / 야외`
- 마커 색상 분기 (DESIGN.md 컬러로 갱신):
  - 일반 풀: `--pool-500` (#0EA5E9)
  - 찜한 풀: `--fool-yellow` (#FCD34D)

### 7-2. 거리순 정렬
- `navigator.geolocation` 사용자 위치
- Haversine 직선거리
- 정렬: `거리순 / 이름순 / 지역순`
- 위치 거부 시: 기본 *이름순*, 안내 *"위치를 알려주시면 가까운 풀부터 보여드려요"*

```typescript
// src/utils/distance.ts
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2) ** 2 +
            Math.sin(dLng/2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
```

### 7-3. 즐겨찾기 ("또 가고 싶은 곳")
- localStorage, key: `onuldo-favorites`
- Zustand persist 미들웨어로 자동 동기화
- UI: 카드/상세에 ♡ 토글
- 페이지 이름은 *"또 가고 싶은 곳"* (즐겨찾기 X — 톤 살리기)

### 7-4. 지역별 필터
- 17개 시도 다중선택 체크박스
- 선택 지역만 마커/리스트 표시
- 지역 클릭 시 해당 지역 중심으로 지도 이동·줌 조정

---

## 8. 프로젝트 구조

> Expo / React Native 기준으로 변경.

```
poolsday/
├── App.tsx                       엔트리
├── app.config.ts                 Expo 설정 (env로 키 주입)
├── .env.example                  필요 환경변수 샘플
├── babel.config.js
├── metro.config.js               svg-transformer 등록
├── tsconfig.json
├── package.json
├── assets/
│   ├── illustrations/
│   │   ├── request-complete.svg  (5:19712, 5:18464에서 공유)
│   │   └── more.svg              (5:2287)
│   └── fonts/                    Pretendard·Fraunces 정적 ttf
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx     Splash → Main 스택
│   │   └── types.ts              네비 파라미터 타입
│   ├── screens/
│   │   ├── splash/SplashScreen.tsx       (3:387)
│   │   ├── map/MapScreen.tsx             (4상태 통합)
│   │   ├── schedule/
│   │   │   ├── ScheduleViewScreen.tsx    (5:14288)
│   │   │   ├── ScheduleNicknameScreen.tsx(5:14808)
│   │   │   ├── ScheduleWriteScreen.tsx   (5:15159)
│   │   │   ├── ScheduleTimeScreen.tsx    (5:15381)
│   │   │   └── ScheduleDoneScreen.tsx    (5:19712)
│   │   ├── pool-submit/
│   │   │   ├── PoolNameScreen.tsx        (5:16341)
│   │   │   └── PoolDoneScreen.tsx        (5:18464)
│   │   └── more/MoreScreen.tsx           (5:2287)
│   ├── components/
│   │   ├── ui/                   Button, Input, Chip, Badge
│   │   ├── map/                  PoolMarker, PoolBottomCard
│   │   ├── feedback/             RequestComplete (illustration + text + CTA)
│   │   └── layout/               ScreenContainer, AppHeader
│   ├── store/
│   │   ├── pools.ts              풀 데이터 + 선택 상태
│   │   ├── favorites.ts          persist 즐겨찾기
│   │   └── scheduleDraft.ts      시간표 작성 4스텝 임시 상태
│   ├── data/
│   │   └── dummyPools.ts         프로토타입용 더미 데이터
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   └── useFonts.ts
│   ├── types/
│   │   ├── pool.ts
│   │   └── schedule.ts
│   ├── utils/distance.ts         Haversine
│   └── styles/
│       ├── tokens.ts             DESIGN.md 토큰 (TS 버전)
│       └── typography.ts         text-h1, text-body 등 스타일 헬퍼
└── design-refs/                  Figma 시안 PNG (gitignored)
    └── figma/01~13.png
```

---

## 9. 셋업

```bash
npx create-expo-app@latest poolsday -t blank-typescript

cd poolsday

# 네비게이션
npx expo install @react-navigation/native @react-navigation/native-stack \
                  react-native-screens react-native-safe-area-context

# 지도
npx expo install react-native-maps

# 상태
npm install zustand @tanstack/react-query

# 영속화
npx expo install @react-native-async-storage/async-storage

# 폰트
npx expo install expo-font

# SVG
npx expo install react-native-svg
npm install -D react-native-svg-transformer

# 위치
npx expo install expo-location

# 아이콘
npm install lucide-react-native
```

**환경변수** — `.env` (`app.config.ts`에서 읽음)
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=
```

**Google Maps 키 발급**
1. https://console.cloud.google.com 에서 프로젝트 생성
2. **Maps SDK for Android** 와 **Maps SDK for iOS** 활성화
3. API 키 발급 → 패키지명·번들ID로 제한
4. (선택) Cloud Map ID 만들어서 디자인 테마 적용
5. `.env`에 키 입력 후 EAS Build 또는 `npx expo prebuild` 실행

**폰트**
- Pretendard: `assets/fonts/Pretendard-{Regular,Medium,SemiBold,Bold}.ttf`
- Fraunces: Google Fonts에서 다운 (italic 포함)

**Custom Dev Build 필수**
- `eas build --profile development --platform ios|android` 한 번 실행 후
- Expo Go 대신 dev client 사용

---

## 10. 구현 순서 (2026-05-07 갱신, Expo 기준)

1. **토큰:** `src/styles/tokens.ts` (DESIGN.md를 TS 객체로)
2. **Expo 셋업:** create-expo-app + 의존성 + 폴더 구조 + 폰트 로드
3. **네비:** RootNavigator (Splash → Main 스택), 화면 자리 placeholder
4. **타입·더미 데이터:** `Pool`, `Schedule`, `dummyPools.ts` 20개
5. **공통 UI:** Button(primary/secondary/ghost), Input, Chip, ScreenContainer
6. **Splash** (3:387)
7. **MapScreen** (지도 + PoolMarker + 4상태 바텀카드)
8. **시간표 조회/작성 플로우** (5:14288 → 14808 → 15159 → 15381 → 19712)
9. **수영장 등록·수정** (5:16341 → 18464)
10. **More** (5:2287 + more.svg)
11. **즐겨찾기 persist + 마커 컬러 분기**
12. **실데이터 교체:** 공공데이터 CSV → JSON 변환 스크립트

각 단계 완료 시 커밋·푸시. Chris 자고 일어나서 PR/diff 단위로 리뷰 가능하도록.

---

## 11. 코드 스타일 가이드

- 컴포넌트는 함수형 + TypeScript
- 한국어 카피는 항상 *위 보이스 톤*에 맞춰 작성 (감탄사·이모지 자제)
- 색상은 항상 CSS 변수 통해 (하드코딩 금지)
- props는 명시적 타입 정의
- 비즈니스 로직은 `hooks/`로 분리

---

## 12. 차후 확장

- **자유수영 시간표** — 풀별 운영시간 크롤링/입력
- **오늘의 추천** — 위치·시간·요일 기반 1개 추천
- **수영 기록** — *오늘도 수영* 체크인 기능 (핵심 차별화)
- **PWA 변환** — 오프라인 지원
- **알림** — *"오늘은 어디서 수영하실까요?"* 정해진 시간 푸시
