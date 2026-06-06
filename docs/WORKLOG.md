# Pool's day 작업일지

> git 커밋 기록(실제 author date) 기반 날짜별 정리. 추측 없이 커밋 사실만.
> 기간: 2026-05-06(레포 초기화) ~ 2026-06-07(현재).
> 단계: **P1 ✅ `phase1-complete` (2026-05-20) → P2 ✅ `phase2-complete` (2026-05-20) → P3(출시) — Android(2026-06-03)·iOS(2026-06-07) 프로덕션 심사 제출 완료, 둘 다 승인 대기.**

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

## 2026-06-03 (이어서) — 출시 critical path 완수 + **프로덕션 심사 제출** ★

위 critical path를 같은 날 전부 완료하고 Google Play 프로덕션에 심사 제출. 상세 타임라인은 [`docs/LAUNCH-LOG.md`](LAUNCH-LOG.md).

- **UI 정합/버그 배치** (commits 9da6c1e~5d48209):
  - `calendar-form.svg` 잘못된 share 아이콘 → 정상 달력(110:3761) / 생년월일 필드 동시 수정
  - 설정 아이콘 3종 viewBox 정규화(시각 크기 통일) / ClubMain 패딩 20→16 → **전 화면 가로패딩 16 표준 통일**
  - **휠 흰색 텍스트 버그** — 조건부 style array의 Android color 잔류, 전 휠(수업시간·수심·연월) 단일객체+key 토글로 수정
  - 수심 입력 시트 세로 스택(101:5025) + chart-bubble 아이콘 / 프로필 가입·설정 화면 성별·생년월일·여백 통일
- **prod DB 정리(출시 위생)**: prod(rwxefc) 테스트 사용자 데이터 전체 삭제(FK 안전순서 DO 블록) — profiles/nicknames/auth.users 등 비움(닉네임 "은호" 복구). pools(31)/schedules(31)/blocklist/faqs/terms 시드 보존. dev↔prod pools ID 완전일치로 마이그 동기 확인(deleted_users는 0110 의도적 DROP).
- **EAS 빌드**: production AAB vc10→11→**12**(`db0c1460`, 19:54 완료) — 앞 critical path #1 ✅
- **SHA-1 등록(critical path #2 ✅)**: Play 앱 서명 키 SHA-1/256을 **Firebase(pool-s-day) Android**에 등록 → Android OAuth 클라이언트 자동생성. (이전 `google-services.json` oauth_client 0개 = 로그인 깨짐 원인 확정). 재빌드 불필요(webClientId 서버검증).
- **내부 테스트 검증(critical path #3 ✅)**: vc12 내부트랙 배포(19:58) → 실기기 구글 로그인·prod 데이터·가입·"은호"·UI 수정분 전부 통과.
- **프로덕션 승격 → 심사 제출 ★**: vc12 + 출시노트(v1.0.0) + 국가 대한민국 + 앱액세스. **검토 전송 완료** — 프로덕션/국가/스토어등록정보/콘텐츠등급/타겟(18+) 일괄 심사 중. **관리형 게시 OFF → 승인 즉시 자동 공개.** 결과 메일 cripo2357@gmail.com.

**다음(출시 후)**: 심사 결과 대기 → 승인 시 대한민국 자동공개 / 거부 시 사유 확인·재제출. iOS 준비는 별도 트랙(★ Sign in with Apple 4.8 필수 미구현, iOS Google OAuth/`GOOGLE_IOS_URL_SCHEME` 미설정, Apple Developer 가입 전제).

## 2026-06-06~07 — 약관 서버화 + iOS 바운스 정정 + iOS App Store 심사 제출 ★

- **약관 본문 서버 보관** (commits f6d7e46, 1069876): 약관 5종 본문을 Supabase `terms` 테이블 `content` jsonb로 이전 → **앱 재빌드 없이 개정 가능**. 번들 `TERMS_META`를 항상 폴백 바닥으로(오프라인·조회실패·깨진 row 안전). `scripts/gen-terms-seed.mjs`로 시드 자동생성(0212, 자급자족·멱등 — 0044 스키마 가드 재포함), `termsServer.fetchActiveTerms()` + `lib/useTerms`(번들→캐시→서버 overlay), `TermsDetailScreen` 연동. dev·prod 시드 적용·검증(5종 v1.0.3 active, Apple 반영, Firebase Analytics 제거 확인). **service 약관 소셜 제공자 Apple 누락 데시ン크 발견·정정**. 버전 **1.0.3 통일**(VERSION·CURRENT_TERMS_VERSION·시드·docs 5종 frontmatter). 재동의 = 공지사항(+메일) 통보, **앱 내 강제 재동의 프로세스 미도입 결정**(중대 변경만 추후 웹 재동의 링크).
- **iOS 카드/시트 바운스 끌림 수정** (commits 4daf9b2, c70c9bc): iOS 세로 ScrollView는 `alwaysBounceVertical` 기본 true라 내용이 짧아도 끌리는(드래그되는) 문제. 풀카드 + 바운드 패널 **9곳**(참여자시트·일정추가시트 본문+드롭다운·친구추가·초대 2곳·수업등록 드롭다운·상대프로필 모달·친구탭 검색)에 `false` 적용 → 내용 넘칠 때만 스크롤. 전체화면 스크린·휠피커는 iOS 표준 동작이라 제외. RefreshControl 전무 확인(새로고침 안 깨짐).
- **EAS build 18** (id `1cc01a0e`, iOS production) → `eas submit` → ASC 처리 → TestFlight. **네이티브 배치**(image-picker·clipboard·expo-apple-authentication·google-signin) 첫 검증 + **소셜로그인 3종(Apple 포함) 실작동**·프로필사진·복사·약관 서버본문·바운스 전부 통과(흰화면/크래시 없음).
- **iOS App Store 심사 제출 ★** (2026-06-07 00:26, 제출ID `f8ca3f30`): **한국 단일·무료(KRW)·자동 출시·Mac/Vision Pro 제외**. 수출규정 자동면제(`ITSAppUsesNonExemptEncryption:false`). 심사노트(비회원 열람 + Sign in with Apple, 4.8 충족)·"로그인 필요" 해제·연락처 입력. **심사 대기 중(Waiting for Review).** 상세 [LAUNCH-LOG](LAUNCH-LOG.md).
- (병행) 풀 등록 — 광진구 3곳(0105~0107)·월권 전용 풀 월요금 표기(0216)·초기 풀 photo_url 정정(0217). *크리스 병렬 작업.*

---

## 단계 요약 (현 위치)

- **P1 (목업·UX) — ✅ 완료** (2026-05-20, tag `phase1-complete`). 제품 정의·정책·디자인·약관·기본 데이터 결판.
- **P2 (백엔드 SSOT) — ✅ 완료** (2026-05-20, tag `phase2-complete`). 13배치 + 마이그 0047/0048/0049/0059/0060 + 회귀 정정 2건. profiles/friends/blocks/user_schedules/notifications/auth_uid binding/RLS 보수적 하드닝.
- **P3 (하드닝·출시) — Android·iOS 양 플랫폼 심사 제출 완료** (2026-05-21~2026-06-07). prod Supabase 분리 + RLS strict + 사업자등록 + EAS production + prod DB 정리 + SHA-1 등록(구글 로그인) + 내부테스트 검증 → **Google Play 심사 제출(vc12, 대한민국, 2026-06-03)**. 이후 약관 서버화 + iOS 바운스 정정 + build 18 → **App Store 심사 제출(0.1.0(18), 대한민국, 자동출시, 2026-06-07)**. **둘 다 승인 대기 중.**
  - **남은 것**: ① **양 스토어 심사 승인**(승인 즉시 자동 공개) ② 2기기 검증(단일기기·계정간 푸시·수락거절·상대프로필) ③ Android Play 앱서명 SHA-1 + vc13(승인 후) ④ Kakao 비즈앱 정식 전환(이메일 scope).

*무게중심: 코드 비중 P3 < P2 < P1. P3는 외부 의존(사업자 등록·스토어 심사)이 critical path.*
