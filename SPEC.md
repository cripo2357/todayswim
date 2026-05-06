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

| 레이어 | 선택 | 이유 |
|---|---|---|
| 빌드 | **Vite + React 18 + TypeScript** | 빠르고 모던한 표준 |
| 스타일 | **Tailwind CSS** + CSS 변수 | 디자인 토큰 일관성 |
| 상태 | **Zustand** (+ persist 미들웨어) | 보일러플레이트 적음, 영속화 쉬움 |
| 데이터 페칭 | **TanStack Query** | 캐싱·재시도·로딩상태 자동 |
| 지도 | **Kakao Maps JavaScript API** | 한국 주소·POI 가장 정확, 무료 |
| 라우팅 | **React Router v6** | 표준 |
| 폰트 | Google Fonts (Pretendard, Fraunces, Noto Serif KR) | 무료, CDN |

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

## 6. 화면 구성

```
/                  메인 (지도 + 리스트)
/pool/:id          상세
/favorites         또 가고 싶은 곳 (즐겨찾기)
/today             오늘의 추천 (확장 시)
```

**메인 레이아웃 (데스크톱)**
- 헤더: 로고 *오늘도 수영* (세리프) + 검색 + 즐겨찾기 + 메뉴
- 좌측 사이드: 지역 / 실내·야외 / 정렬 필터
- 우측 메인: 카카오 지도
- 하단: 카드 리스트 (가로 스크롤)

**모바일:** 지도 / 리스트 탭 전환

---

## 7. 기능 명세 (요청 4종)

### 7-1. 실내/야외 구분
- `type` 필드 활용
- UI: 칩 버튼 `전체 / 실내 / 야외`
- 마커 색상 분기:
  - 실내: `--mist-deep` (#6B95B0)
  - 야외: `--coral` (#E8A598)

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

```
onuldo/
├── public/
│   └── pools.json
├── src/
│   ├── api/pools.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── map/
│   │   │   ├── KakaoMap.tsx
│   │   │   └── PoolMarker.tsx
│   │   ├── pool/
│   │   │   ├── PoolCard.tsx
│   │   │   ├── PoolList.tsx
│   │   │   └── PoolDetail.tsx
│   │   ├── filters/
│   │   │   ├── RegionFilter.tsx
│   │   │   ├── TypeFilter.tsx
│   │   │   └── SortSelect.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   ├── usePools.ts
│   │   └── useFavorites.ts
│   ├── store/
│   │   ├── filters.ts
│   │   └── favorites.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PoolDetailPage.tsx
│   │   └── FavoritesPage.tsx
│   ├── types/pool.ts
│   ├── utils/distance.ts
│   ├── styles/tokens.css
│   ├── App.tsx
│   └── main.tsx
├── .env
├── tailwind.config.js
└── package.json
```

---

## 9. 셋업

```bash
npm create vite@latest onuldo -- --template react-ts
cd onuldo
npm install

# 핵심
npm install zustand @tanstack/react-query react-router-dom

# 스타일
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**환경 변수 `.env`**
```
VITE_KAKAO_MAP_KEY=발급받은_JS키
```

**카카오맵 SDK** — `index.html`
```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=%VITE_KAKAO_MAP_KEY%&autoload=false"></script>
```

**폰트** — `index.html`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Noto+Serif+KR:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
```

**카카오 키 발급**
1. https://developers.kakao.com 가입
2. 애플리케이션 추가 → JavaScript 키 복사
3. 플랫폼 등록에 `localhost`, 배포 도메인 등록

---

## 10. 구현 순서 (Claude Code에 그대로 시키기)

1. **셋업:** Vite + Tailwind + 라우팅 + 디자인 토큰(`tokens.css`)
2. **레이아웃 셸:** Header(로고 *오늘도 수영* 세리프), 메인 그리드, 빈 상태 카피
3. **타입 + 더미 데이터:** `Pool` 타입, `pools.json` 샘플 20개
4. **카카오 지도:** `KakaoMap` 컴포넌트, 마커 + 컬러 분기
5. **카드/리스트:** `PoolCard`(여백·세리프 강조), `PoolList`
6. **필터:** Zustand store + 칩/체크박스 UI
7. **위치 + 거리순:** `useGeolocation` 훅 + 거부 시 폴백 카피
8. **즐겨찾기:** persist store + ♡ 토글, *또 가고 싶은 곳* 페이지
9. **상세 페이지:** `/pool/:id`
10. **마무리:** 모바일 반응형, 로딩 스켈레톤, 빈 상태 일러스트
11. **(선택) 실데이터 교체:** CSV → JSON 변환 스크립트

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
