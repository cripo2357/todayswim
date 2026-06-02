# Pool's day 작업일지

> git 커밋 기록(실제 author date) 기반 날짜별 정리. 추측 없이 커밋 사실만.
> 기간: 2026-05-06(레포 초기화) ~ 2026-06-03(현재).
> 단계: **P1 ✅ tag `phase1-complete` (2026-05-20) → P2 ✅ tag `phase2-complete` (2026-05-20) → P3(하드닝·prod 분리·출시, 진행 중)**.

---

## 2026-05-06 — 시작
- 레포 초기화
- SPEC.md / DESIGN.md 등록 (제품·디자인 기준 문서)

## 2026-05-07 — Expo 골격
- SPEC를 Expo 기준으로 갱신, 디자인 토큰(tokens.ts), 일러스트 2종
- Expo SDK 55 셋업, 9개 화면 placeholder → 본격 구현, UI 프리미티브 + 스토어
- 폰트·네비 와이어링, `@/`·`@assets/` 경로, expo-doctor 18/18
- 즐겨찾기 토글, 위치 권한, 번들 검증

## 2026-05-08
- README / PROGRESS_LOG 정비

## 2026-05-11 — Figma 1차 정합 + 리브랜딩
- Figma 디테일 반영, **poolsday 리브랜딩**, EAS dev 프로필(slug=todayswim 유지)
- 핀/클러스터 Figma 정확 매칭, 모달 dim, 지도 한국 영역 제한

## 2026-05-13 — 브랜드 아이덴티티 전환
- 새 아이덴티티(cyan "ool'd" 아이콘 + 스플래시), 컨셉 전환

## 2026-05-15 — 가입·인증·내 정보
- 가입 흐름 재구성, 약관/프로필 디자인 매칭, expo-image-picker
- **Google/Kakao 실 로그인(Supabase Auth)**, 소셜 프로필 닉네임/사진 가입 기본값
- 닉네임 중복 자동확인, 내 정보 화면(프로필·달력 탭), ProfileImage 재사용
- 한 줄 자기소개, 닉네임 인라인 변경

## 2026-05-16 — 데이터·시간표·일정 코어 (대량)
- 닉네임 정책(2~6자·안내), 프로필 저장 정책(1그룹 즉시/2그룹 이탈 시)
- 내 위치 마커 = 프로필+노란 링(PNG 베이크), 폰트(Pretendard) 전수 통일
- 내 정보 재구성(설정/프로필/달력·친구·알림) + 친구초대 플로우 + 더미
- **수영장 4곳 추가**(관악구민·사당문화회관·영등포제2·KBS스포츠월드) + 카카오 지오코딩 스크립트·좌표·사진·시간표
- 자유수영 시간표 slot_groups(계절·변형 운영), 시간표 더블탭 → 등록 플로우
- **수영 일정 충돌 정책**(중복/시간겹침), 공통 BottomSheet/OptionSheet 추출
- 달력 참여자(슬롯 공동참여)·공개여부, **프로필 테두리 정책**(나/친구/비친구)
- 캘린더 마커·점·요일색 등 Figma 디테일 다수

## 2026-05-17 — 친구·검색·툴팁·메시지 (대량)
- 친구 초대 기능 교체(일정 확정형 + 공통 멀티선택)
- 그림자 boxShadow로 Figma 정확 재현(halo 제거), 검색 3종 폐기 후 재구현
- 친구 추가 거절, 계정 ID 발급/표시/복사/변경
- 수영장 즐겨찾기(store·하트·툴팁), 수영 수업 시간(프로필·등록·시트)
- **메시지 발송 Rule 레지스트리 + 이력 Supabase 적재**(dispatchMessage 단일경로)
- 친구 화면 재구현, 더미 일정 30개, 공통 Toggle, 다른 사용자 프로필
- 툴팁 다수 반복 끝에 위툴팁 1종(꼬리=그림자 베이크 PNG)으로 확정

## 2026-05-18 — 구조 정리·지도 스택·성능
- More 화면 제거(기능 전부 설정 이관), 일러스트 라이브러리 37종+인덱스
- 즐겨찾는 수영장 전용 화면 분리
- **지도 수영장 마커 옆 프로필 스택**(Figma) + 성능 튜닝(줌 게이팅 14·64px 썸네일·freezeOnBlur·페이지네이션 seam)
- 닉네임 정책 서버측 강제(migration 0043), 프로필 항목별 공개여부 토글
- 업로드 실패 화면(사유별 카피), 새 친구 추가, 수영 레슨 지도 stack
- EAS dev/preview 프로필 environment 연결

## 2026-05-19 — 새 친구 추가·내 정보 정합·회원 탈퇴
- 새 친구 추가 마무리(닉네임 검색 픽커 통일, 선택 사용자 표시)
- 키보드/포커스 버그, 레슨 수영장 검색 = float 패턴 복제(BottomSheet 모달 폐기)
- 내 정보 Figma 정밀 정합(섹션 간격·성별/생년월일 안내문구·폰트·텍스트 색)
- **회원 탈퇴 기능**(Figma 3모달 + 아이콘)

## 2026-05-20 (오늘) — 약관·**Supabase 서울 이관**·메시지 v0.5
- 로그아웃 내 위치 마커: 반복 수정 끝 baked PNG(노란 원+검은 사람) 확정
- 약관 단일 상세 템플릿(TermsDetail)로 5종 커버, 가입 약관 동의 5항목(필수 4)
- **MVP 스펙 docs/SPEC.md**(코드/DB 검증 기반), 0044 약관 스키마 초안(P2, 미적용)
- **Supabase 뭄바이 → 서울 리전 이관**:
  - 런북 작성, 단일 번들 SQL(0001~0043), ref 치환(→hldfsstyzbnqnrlqhhtc)
  - 의존성 순서 보정(0013→0012)+teardown, **ROLE GRANTS 추가**(신규 프로젝트 anon 42501 해결)
  - 검증: pools/시간표/공지/제보/닉네임/Google 로그인 정상 → 뭄바이 프로젝트 삭제
  - Kakao: KOE101→KOE205, account_email이 비즈 앱 필수 → **P2 BLOCKED**(이관 무관)
  - 아바타 업로드: 뭄바이엔 버킷 자체 없던 미검증 경로 → **0045 P1 개방형 정책**로 해결(P3 재하드닝)
  - 로컬 .env·EAS env(서울 URL/레거시 anon/Naver/Google) 스왑, preview 빌드 성공
- **약관 5종 작성·개정**(PIPA·위치정보법·약관규제법, RN 친화 다듬기, 수정요청 반영) → termsContent 확정본 반영
- 로그인 화면 dim 탭 닫기, 로그아웃 내 위치 마커 47px(25m 수영장 마커와 동일)
- **메시지 Rule 레지스트리 v0.5 스펙 확정**(22트리거 카피·변수 폴백·monthly 8변형) — 크론·실푸시·서버 팬아웃은 P2

### 동시 진행 트랙 — P1 마무리 → P2 풀 배치 (1일 완성)

같은 날 별도 세션에서 P1 마무리 + P2 13배치를 하루 안에 끝냄. 외부 OAuth 셋팅은 P1에서 이미 다 돼 있어 코드·DB만 박으면 되는 상태였음.

- **P1 마무리 → tag `phase1-complete`**: 아바타 임계값 회귀(sm≤64→≤28) 마지막 정정 후 마일스톤
- **P2 진입 — 0047 profiles 본체** (PK=친구코드 text, mock-auth 톤 RLS) + useProfile 서버 best-effort upsert (`a7dcbd4`)
- **P2 2배치 — 0048 friends 시스템** (friend_requests / friendships 양방향 / blocks + cascade + 차단 안전망 트리거). 친구코드 변경 정책을 PK UPDATE cascade로 정정 (`507048a`)
- **P2 3배치 — friendsSync 부착**: useFriends 7 mutation 모두 서버 best-effort 동기. mock 친구는 FK silent fail (정상) (`66cdf30`)
- **P2 4배치 — 0049 user_schedules**: MySwimSchedule + OtherSchedule 통합 테이블, useSwimSchedules 5 mutation 동기 (`4156801`)
- **P2 5배치 — mock 친구 → 서버 시드 + 친구코드 단일 출처**(`lib/friendCode.ts`로 추출). 모든 mock id를 `accountCode(seed)` 결과(6자리)로 통일, App.tsx에서 `seedMockProfilesOnce` 호출(AsyncStorage SEED_KEY로 1회) (`2869856`)
- **P2 6배치 — useOtherSchedules**: MOCK_OTHER_SCHEDULES → React Query 서버 fetch + profiles join + mock 폴백. CalendarTab + MapScreen 교체 (`f529ecf`)
- **P2 7배치 — notifications 서버 fetch**: useNotifications 훅 + NotificationsTab kind→slot 매핑 + mock 갤러리 폴백. `dispatchMessageTo` 신규 + InviteFriendsScreen 첫 'other' 적재 (`af5e0a8`)
- **P2 8배치 — 친구 요청·수락 양측 알림**: sendRequest 2곳 + accept 2곳에 양측 적재. friend_request_accepted는 본문 `{name}` 양측 다름 → 명시적 두 번 호출 (`5a1fcd1`)
- **P2 9배치 — friend_search 서버 결합**: `useNicknameSearch` / `useCodeSearch` 훅이 mock 즉시 + 서버 profiles 검색 합쳐 dedupe + eligibility 필터 (`03eddec`)

#### 회귀 정정 2건 — verify_baseline_before_migration_debug 패턴

- **naver-map OOB 회귀**: 6배치 MapScreen useOtherSchedules 도입 시 `java.lang.IndexOutOfBoundsException` (ArrayList.get). phase1-complete 체크아웃 비교 → `39b44e8` 격리 → `51d8831` narrowing(CalendarTab 무영향 확정) → `0ff4d3b` final (MapScreen만 mock 유지). 메모리 [[naver_map_oob_mock_only]]
- **selector 무한 렌더**: useOtherSchedules의 `useFriends((s) => s.friends.map(...))`이 매 호출마다 새 array → `getSnapshot should be cached` + `Maximum update depth exceeded` → MyInfo 진입 시 흰화면. friends 자체 구독 + useMemo 파생으로 정정 (`ee29541`)

#### P2 마무리 — Auth binding + RLS

- **OAuth 외부 점검**: Google Cloud / Kakao Developers / Supabase Providers / .env / EAS env / Android SHA-1 모두 P1에서 이미 셋팅됨 확인. 새 EAS dev 빌드(`150c2ca9`) install → 실 OAuth 검증(`auth.users`에 `provider=google` 본인 row 확인)
- **0059 profiles.auth_uid 컬럼** + profileSync `tryFetchProfileByAuthUid` + `tryUpsertProfile`이 현 세션 auth.uid 자동 동봉 + `store/auth.ts`에 `syncProfileFromAuth` helper (hydrate/onAuthStateChange/signIn 셋 다 호출). 효과: 기존 가입자 재로그인 시 즉시 MapMain 진입 (`8ff922b`)
- **0060 RLS 보수적 하드닝**: 6개 테이블 write에 본인 검증 (`auth_uid = auth.uid()`), select은 `(true)` 유지. mock 시드 호환을 위해 `auth_uid is null` 허용 분기. friendships 양방향 insert 위해 양쪽 본인 완화. notifications.insert는 (true) 유지(dispatchMessageTo 'other' 적재). (`f09d070`)
- **검증**: 일정 추가 / 친구 요청 / 수락 / 차단 / 알림 적재 모두 RLS 통과 → **tag `phase2-complete`** (`578755b`)

## 2026-05-21 (오늘) — P3 진입 준비

- **사업자 등록 완료 예정**(5/21) — 외부 critical path 첫 단추
- P3 외부 의존 작업 시작 옵션:
  - Apple Developer Account 가입 (2-3일 심사) — Sign in with Apple 의무([[email_account_key]] 카카오 비즈와 함께)
  - Google Play 개발자 등록 (즉시)
  - 카카오 비즈 앱 전환 신청 (사업자 등록증 필요)
- P3 코드/DB 작업 진입(외부 대기 시간 활용):
  - prod Supabase 프로젝트 분리 (빈 프로젝트 + 0001~0060 일괄 + 풀/시간표 시드)
  - 클라이언트 env 분기 (EAS profile별 URL/key)
  - 0061 RLS strict 마이그레이션 작성 (prod 적용용 — dev는 mock 호환 위해 보수적 유지)
  - 풀 사진 prod Storage 재업로드
  - mock 데이터 prod 가드 (seedMockProfilesOnce + useOther* fallback)
- Apple Sign-In 코드 구현 보류 → Apple Developer 가입 통과 후

## 2026-06-03 — Google Play Console 출시 셋업 (스크린샷 가이드 세션)

Play Console 화면을 단계별로 짚으며 앱 콘텐츠 선언·스토어 등록정보를 입력. 입력값 출처는 `docs/store-meta/D1~D6` 답변지.

- **앱 콘텐츠 선언 완료**:
  - Android 개발자 인증(`com.cripo.poolsday` 등록), 개발자 계정 정보(CRIPO) 확인
  - 개인정보처리방침 URL = `https://cripo2357.github.io/todayswim/terms/privacy-policy/`
  - 앱 액세스: "일부 제한됨" + 데모 Google 계정 안내(이메일+비번, "추가정보 필요없음" 체크). 비번은 채팅 미노출
  - 광고: 없음 / 콘텐츠 등급: 전체이용가(IARC, ESRB E·PEGI 3) / **타겟층 18세 이상 단독**(미성년자 미서비스) / 정부·금융·건강 앱: 아니요
  - 데이터 보안: 수집=예·암호화=예·삭제가능=예, 데이터유형 8개, **전 항목 수집됨=O / 공유됨=X**(위탁처리, 정확한위치=X)
  - **광고 ID = 예 / 목적 애널리틱스만**(`@react-native-firebase/analytics`가 AAID 사용)
  - 앱 카테고리: 스포츠 / 연락처 이메일 cripo2357@gmail.com
- **스토어 등록정보(텍스트)**: 앱 이름 `Pool's day`, 간단한 설명, 자세한 설명 입력
  - 카피 검수 3건 지적: ① "전날 저녁·1시간 전 알림"은 **코드 미구현 기능**(로컬 `scheduleNotificationAsync` 없음)이라 심사 리스크 → 문구 삭제 ② "전국" 과장 표현 완화 ③ 브랜드 표기 `Pool's day`(소문자 d) 통일. 크리스가 수정 반영
- **스토어 자산**:
  - `assets/store/play-icon-512.png` 생성 — `assets/icon.png`(1024) → 512×512 고품질 리사이즈(Play 앱 아이콘은 정확히 512 요구). 업로드 완료
  - 기능 그래픽(1024×500) + 휴대전화 스크린샷 등록 완료(크리스 직접)
  - 출시용 자산은 `assets/store/`에 버전 관리 컨벤션 확정
- **데이터 보안 정확성 보강**:
  - Firebase Console → 프로젝트 설정 → 데이터 개인정보 보호 → "Firebase 외 Google 서비스 개선용 데이터 공유" **OFF** → 데이터 보안 "공유=아니요" 정합 유지
  - GA4 자체 데이터 공유 설정은 선택적 강화 항목으로 남김(Analytics Admin)
- **가격**: 무료 앱 + 인앱결제 없음 → 판매자(머천트) 계정 **불필요**(설정 안 함이 곧 무료)
- **앞선 자산**: `docs/account-deletion.md`(데이터 보안 "계정 삭제 URL"용, 처리방침 보존기간 일치) — commit ac39e0b

**남은 출시 critical path** (AAB 빌드 진행 중):
1. 빌드 완료 → **내부 테스트 트랙**에 AAB 업로드(검토 없이 즉시)
2. 업로드 후 생기는 **Play 앱 서명 키 SHA-1**을 Google Cloud Android OAuth 클라이언트에 등록(미등록 시 store 빌드 Google 로그인 `DEVELOPER_ERROR`)
3. 데모 계정으로 내부 테스트 빌드 로그인 검증(친구·일정·프로필 진입)
4. google-services.json 빌드 포함 확인
5. 출시 국가 = 대한민국

---

## 단계 요약 (현 위치)

- **P1 (목업·UX) — ✅ 완료** (2026-05-20, tag `phase1-complete`). 제품 정의·정책·디자인·약관·기본 데이터 결판.
- **P2 (백엔드 SSOT) — ✅ 완료** (2026-05-20, tag `phase2-complete`). 13배치 + 마이그 0047/0048/0049/0059/0060 + 회귀 정정 2건. profiles/friends/blocks/user_schedules/notifications/auth_uid binding/RLS 보수적 하드닝.
- **P3 (하드닝·출시) — 진행 중** (2026-05-21~). prod Supabase 분리 + RLS strict + Apple Sign-In + 사업자등록·Kakao 비즈앱 전환 + EAS production + 스토어 심사. 외부 시간(사업자/심사) 1-2개월 예상, 코드는 1주 안.

*무게중심: 코드 비중 P3 < P2 < P1. P3는 외부 의존(사업자 등록·스토어 심사)이 critical path.*
