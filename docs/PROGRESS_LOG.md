# Pool's day — Progress Log

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

## 2026-05-10/11 — Figma MCP 연동 + 마커·라벨·클러스터 시안 정확화

새벽 작업 (Chris 자는 동안). 일어나면 폰 풀 리로드 후 최신 APK 받아서 확인하세요.

### 새벽에 한 일

1. **Figma MCP 연동**
   - `c:\poolsday\.mcp.json` 추가 (Figma Desktop 로컬 MCP `http://127.0.0.1:3845/mcp`)
   - 이제 다음 세션부터 Figma 노드 직접 쿼리 가능 → 디자인 spec 정확히 가져옴

2. **마커 (38:1146 / 38:1173) — Figma spec 정확 매칭**
   - big (50m+): 64px 노랑 + 4px 파란 보더 + blue solid shadow (offset 0/4)
   - small (≤25m): 52px 파랑 + 4px 파란 보더 + blue tinted shadow with spread
   - 사이즈는 풀 size에 고정 (선택 상태로 안 바뀜) → Android 비트맵 캡처 글리치 회피
   - 다층 동심원으로 blur 근사 (RN 자체 blur 없음)

3. **클러스터 마커 (38:1078) — Figma spec 정확 매칭**
   - 36px 검정 원 + 4px `#090909` 보더
   - 노랑 16px Fraunces Bold 텍스트
   - 파란 그림자 (offset 0/4, alpha 0.15)
   - count 무관 사이즈 고정

4. **마커 라벨 (Figma spec)**
   - 흰 알약 (padding 12/6, radius 16, shadow combo)
   - 14px Bold #1F2937 letterSpacing -0.6
   - 핀-라벨 gap 2px

5. **지도 설정**
   - `rotateEnabled={false}` — 회전 잠금
   - `pitchEnabled={false}` — 3D 기울이기 잠금
   - `setMapBoundaries` — 한국 본토 + 제주 + 독도 영역 (NE 38.7/132, SW 33/124)
   - `minZoomLevel={6}` — 너무 멀리 줌아웃 방지
   - 커스텀 Google Maps 스타일 (회색톤 + 단순화 도로)

6. **하단 카드**
   - 가격 정보 (`pricePerSession`) 추가 — "1회 X,XXX원" 전화번호 아래 (regular weight)
   - 핀 버튼 → 외부 지도앱 길찾기 (Linking)
   - 모든 색상이 brandBlue로 통일

7. **시간표 View 화면 (5:14288)**
   - 7요일 칩 (active=brand blue) + 시간 슬롯 flex-wrap 칩 (outlined)
   - 하단 outlined "시간표 수정 요청" 버튼

8. **시간표 Write 화면 (5:15159)**
   - DayPart(새벽/오전/오후/저녁) 분할 제거 → 요일별 단일 flex-wrap
   - 시간 칩 (outlined + X 삭제 아이콘) + 40x40 light blue 추가(+) 버튼
   - 하단 "운영자에게 시간표 등록 요청하기" CTA

9. **공통 UI 컴포넌트 브랜드 컬러 통일**
   - Button primary: pool500 → **brandBlue** (#007AFF)
   - Button secondary: pool100/pool700 → **#EFF6FF / brandBlue**
   - Chip active: pool100/pool700 → **#EFF6FF / brandBlue**
   - Input focus border: pool500 → **brandBlue**

10. **앱 아이콘**
    - 새 아이콘 적용 (assets/icon.png 1024x1024)
    - Android adaptiveIcon: foreground + brandBlue 배경

### 알려진 제약 (Figma와 100% 매칭 안 된 부분)

- **선택 핀 사이즈 확대 X** — react-native-svg + Marker 비트맵 캡처 한계로 사이즈 변화 시 Android에서 우측 잘림 발생. 사이즈는 풀 size별로만 고정 (small=52, big=64). 시안의 "선택 시 더 큼" 효과는 못 구현. PNG `image` prop으로 전환 시 가능 (별도 작업).
- **그림자 blur** — RN에 native blur 없음. 다층 동심원으로 근사. Figma의 정확한 Gaussian blur는 표현 불가.
- **ScheduleView가 modal이 아닌 full screen** — Figma는 343x520 centered card modal이지만 네비게이션 구조 변경 위험이라 full screen 유지.

### Chris 깨면 할 것

1. **최신 APK 설치** — https://expo.dev/accounts/cripo/projects/poolsday/builds/5b933f54-2d14-44c2-a6a6-fe7b3631264a (빌드 #8)
2. 화면별 검토:
   - 스플래시
   - 지도 (마커/클러스터/카드/라벨)
   - 시간표 보기 (Map에서 schedule 있는 풀 선택 → "보기" 누름)
   - 시간표 작성 (Map에서 schedule 없는 풀 선택 → "작성하기" → 닉네임 → 작성)
   - More (지도 우측 상단 작성 FAB)
3. 다른 점 있으면 Figma 노드 ID와 함께 알려주세요. 다음 세션에서 MCP로 정확한 spec 가져와서 픽스.

### 메모리에 저장된 lessons (다음 세션 참고)

- `eas_env_vars.md` — EAS 빌드는 .env 안 보임, env:create 필수
- `build_cadence.md` — 변경마다 빌드 X, batch 후 1번
- `asset_organization.md` — 파일 이름 정리해서 적절한 폴더에
- `no_invented_designs.md` — Figma 시안 없이 UI 디자인 추측 X
- `rn_map_clustering_quirk.md` — `<Marker>` 직속 자식만 클러스터링됨
- `rn_marker_constant_size.md` — 마커 사이즈 상수 고정 (Android 잘림 회피)
