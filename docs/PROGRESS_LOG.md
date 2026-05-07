# Pool's Day — Progress Log

## 2026-05-07/08 — 초기 셋업 + 9개 화면 1차 구현 (자율 모드)

크리스가 자고 있는 동안 진행한 작업 정리. 깨면 이거 보고 따라가시면 됩니다.

### 흐름 (커밋 단위)

| # | 커밋 | 핵심 |
|---|---|---|
| 1 | `chore: 레포 초기화` | 빈 레포 + README + .gitignore |
| 2 | `docs: SPEC.md, DESIGN.md 등록` | Chris 제공 스펙·디자인 문서 |
| 3 | `docs+chore: SPEC를 Expo로 갱신 + tokens.ts + 일러스트` | Vite→Expo 전환 결정 반영 |
| 4 | `feat: Expo SDK 55 셋업 + 9개 화면 placeholder + 폰트·네비` | 빈 화면 + 컴파일 통과 |
| 5 | `feat: 9개 화면 본격 구현 + UI 프리미티브 + 스토어` | 모든 화면 1차 완성 |
| 6 | `chore: expo-doctor 18/18 통과 + babel module-resolver` | 환경 검증 |
| 7 | `feat: 즐겨찾기 토글 + 위치 권한 + 번들 검증` | iOS 번들 4.6MB 정상 |

### 결정 사항

| 주제 | 결정 | 근거 |
|---|---|---|
| 브랜드 | **Pool's Day / 풀스데이** | DESIGN.md가 가장 최신 |
| 코드 식별자 | `todayswim` (레포 이름) | 이미 GitHub 생성됨 |
| 스택 | Expo SDK 55 + RN 0.85 + TS | Chris 결정 |
| 지도 | Google Maps (`react-native-maps` PROVIDER_GOOGLE) | Chris 결정 |
| 스타일 | RN StyleSheet (NativeWind X) | WellRing과 일관, DESIGN 토큰 매핑 깔끔 |
| 네비 | `@react-navigation/native-stack` v7 | RN 표준 |
| 영속화 | Zustand persist + AsyncStorage | 즐겨찾기 |

### 화면 구현 상태

모두 1차 구현 완료. Figma 시안 기반 + 더미 데이터로 흐름 동작.

- ✅ Splash (3:387)
- ✅ Map (5:12241/12919/11479/19049 4상태) — 마커 탭, 카드, CTA 분기, 위치 권한, 즐겨찾기 토글
- ✅ ScheduleView (5:14288) — 7요일 칩 + 슬롯 리스트
- ✅ ScheduleNickname → Write → Time → Done (5:14808/15159/15381/19712)
- ✅ PoolName → PoolDone (5:16341/18464)
- ✅ More (5:2287)

### 검증 통과

- `tsc --noEmit` 0 에러
- `expo-doctor` 18/18
- `expo export --platform ios` 정상 번들

### Chris 깨면 할 것 (블로커)

1. **Google Maps 키 발급** — https://console.cloud.google.com
   - 프로젝트 만들고 Maps SDK for iOS / Android 활성화
   - API 키 2개 발급 (iOS, Android 각각, 패키지명·번들ID로 제한)
   - `.env`에 입력 (`.env.example` 참고)
2. **Custom Dev Build 빌드**
   - 옵션 A (EAS): `eas build --profile development --platform ios|android`
   - 옵션 B (로컬): `npx expo prebuild` → Xcode/Android Studio 빌드
3. **앱 실행 후 더미 데이터로 흐름 검증**
   - Splash → Map → 마커 탭 → 카드 표시
   - 시간표 보기 → 7요일 슬롯
   - 시간표 작성하기 → 닉네임 → Write → Time 모달 → Done
   - 부가 기능 → 풀 등록/수정 → Done

### 미완료·후속 (블로커 아님)

- 검색 오버레이 (지도 화면 우상단 검색 FAB만 있고 누르면 동작 X)
- "P" 주차장 마커 — 디자인엔 있지만 데이터·역할 미정
- 실데이터 연동 — 공공데이터포털 CSV → JSON 변환 스크립트 (SPEC §10-12)
- 토스트 (`feedback_toast_tone` 메모리 기준 정중 평서형)
- 앱 아이콘·스플래시 이미지 (`assets/icon.png`, `assets/splash.png` 만들어야 빌드 시 자동 사용)
- 다크모드 적용 (DESIGN.md §1-4 Phase 2)
- Figma 4상태 픽셀 정확도 검수 (지금은 1차 추정)

### 알려진 한계

- Splash는 1.5초 timer만, 실제 폰트 로드 등의 신호와 동기화 X
- ScheduleWrite의 새벽/오전/오후/저녁 분류는 시간 첫 두 자리로 단순 분기
- ScheduleTime 모달은 시작시간 텍스트 입력 (DateTimePicker 미적용)
- 풀 데이터 8개만 (모두 서울)

### 안 한 것 (의도적으로)

- expo-router로 갈아타기 — react-navigation으로 충분, WellRing과 일관
- Tailwind / NativeWind — DESIGN.md 토큰을 RN StyleSheet에 직접 매핑하는 게 더 명료
- 로그인·소셜 인증 — Figma에 없음, 스펙엔 있어도 MVP 외
- 앱 아이콘 자동 생성 — Chris가 디자인에서 export해 주는 흐름 (memory)
