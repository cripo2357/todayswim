# Pool's day — 서비스 스펙 (MVP 현행 기준)

> 본 문서는 **현재 코드베이스(`src/`)와 Supabase 마이그레이션(`supabase/migrations/`)에 실제 구현된 것**만을 근거로 작성되었다. 대화·기억이 아닌 코드 검증 결과다. 후속 작업(① 약관 작성 ② 비즈니스 모델 ③ 푸시 정책)의 입력으로 쓰도록 데이터·사용자행동·트리거·외부연동 중심으로 기술한다.

**상태 범례**

| 표기 | 의미 |
|---|---|
| ✅ | 구현·동작 (서버 또는 정상 로직) |
| 🟡 | 로컬 전용 / 목업·시드 데이터 (앱 재시작·기기 한정, 서버 없음) |
| 🔵 | Phase 2 기획 (코드에 자리만 있고 미동작) |
| ⛔ | 코드에 부재 (미구현) |

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [사이트맵 (화면 구조)](#2-사이트맵-화면-구조)
3. [사용자 흐름 (주요 시나리오)](#3-사용자-흐름-주요-시나리오)
4. [데이터 모델](#4-데이터-모델)
5. [수집 데이터 (약관용)](#5-수집-데이터-약관용)
6. [시스템 트리거 (푸시 정책용)](#6-시스템-트리거-푸시-정책용)
7. [외부 연동](#7-외부-연동)
8. [미결정·향후 확장](#8-미결정향후-확장)

---

## 1. 서비스 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | **Pool's day** (코드 식별자 `poolsday`, EAS slug `todayswim`) |
| 한 줄 정의 | 동네 **자유수영** 수영장을 지도에서 찾고, 자유수영 시간표를 보고, 내 수영 일정을 잡는 모바일 앱 |
| 플랫폼 | iOS / Android (React Native + Expo, 단일 코드베이스) |
| 목적 | "오늘 어디서 자유수영 할지"를 빠르게 해결 — 위치 기반 수영장 탐색 + 시설·요금·시간표 정보 + 개인 수영 일정·친구 동행 |
| 핵심 가치 (BM 입력용) | ① **수영장 탐색**(지도/목록/필터, 위치 기반) ② **자유수영 시간표 열람**(풀별, 요일·시즌별) ③ **개인 수영 일정 관리**(공개범위·충돌검사) ④ **소셜 동행**(친구·일정 초대·프로필) ⑤ **사용자 기여**(수영장 등록·정보 수정 제보) |
| 타깃 사용자 | 정기적으로 자유수영을 하는 일반 이용자(수영러). 부가로 레슨 수강자(레슨 풀·시간 등록), 정보 제보 기여자 |
| 운영 모델 | 풀·시간표·공지는 **운영자(service_role)가 등록/승인**, 사용자는 read + 제보(insert)만. 좌표 등 민감 작업은 운영자 백엔드 책임 |
| 현행 단계 | **P1 (목업 UX 완성)** — 다수 기능이 기기 로컬/목업. 서버 단일출처(SSOT)·실데이터 동기화는 P2 |

---

## 2. 사이트맵 (화면 구조)

**접근 모델 (코드 검증):** 라우터 분기가 없는 단일 스택. 앱은 `Splash → MapMain`으로 **무조건** 진입(반폐쇄형). 로그인/약관/프로필은 **로그아웃 상태에서 프로필 FAB을 탭해 로그인할 때만** 강제된다. 로그인 여부 판정은 `useProfile.profile` 존재로 결정(소셜 세션이 아니라 로컬 프로필). 따라서 **지도·목록·필터·시간표·제보·공지는 비로그인 사용 가능**, 개인 영역만 로그인 필요.

```
Splash ✅ (게이트, 토큰 hydration 후 MapMain로)
└─ MapMain ✅  [공개]  지도에서 풀 탐색·선택, FAB(필터/내위치/프로필·로그인)

[비로그인 가능 — 풀 탐색·정보·제보]
├─ PoolFilter ✅       [공개]  자유수영 검색 필터(요일/레인/요금/시설) 설정
├─ PoolList ✅         [공개]  지도 영역 내 풀 목록(거리·이름 정렬, 페이지네이션)
├─ ScheduleView ✅     [공개]  풀별 자유수영 시간표 열람(요일·시즌·예외문구) — 조회 전용
├─ Announcements ✅    [공개]  공지사항 목록(최근/이전), 이벤트 외부링크
├─ PoolName ✅         [공개]  수영장 등록 요청(create) / 정보 수정 요청(edit)
├─ PoolDone ✅         [공개]  제보 완료 확인
└─ 상태화면(설계됨·미연결): ErrorNotFound/ErrorNoInternet/Maintenance/AppUpdateRequired ⛔(라우트만 존재, 진입 코드 없음)

[인증 게이트 — 로그아웃 시 프로필 FAB → 로그인 후]
├─ Login ✅            [공개]  소셜 로그인(Google/Kakao 실; Apple=목업 테스트경로)
├─ TermsAgreement ✅   [게이트] 가입 필수 동의 4개(만14세·서비스 이용약관·개인정보 수집·이용·위치기반서비스 이용약관) + 마케팅(선택)
├─ TermsDetail ✅      [공개]  약관 상세 단일 템플릿(5종, termsKey 파라미터)
├─ ProfileSetup ✅     [게이트] 프로필 생성(닉네임·성별·생년월일·경력·영법)
├─ ProfileImage ✅     [게이트] 아바타 설정(기본/소셜/업로드)
└─ Welcome ✅          [게이트] 가입 완료 → MapMain

[로그인 필요 — 개인 영역]
├─ MyInfo ✅           [인증]  내 정보 허브 3탭: 스케줄(달력)/사람들(친구)/메시지(알림)
│  ├─ (탭) CalendarTab ✅      내 수영 일정 달력
│  ├─ (탭) FriendsTab 🟡       친구 목록·요청·새 친구 추가 (목업)
│  └─ (탭) NotificationsTab 🟡 알림 목록 (정적 샘플 UI)
├─ Profile ✅          [인증]  프로필 보기·수정(닉네임/소개/성별/생일/경력/레슨/영법/자격증/IM100 + 항목별 공개범위)
├─ SwimClassRegister ✅[인증]  레슨 받는 수영장 + 주간 시간 슬롯 등록(로컬 프로필)
├─ OtherUserProfile 🟡 [인증]  타 사용자 프로필·친구신청/수락·일정참여·차단/삭제
├─ InviteFriends 🟡    [인증]  확정 일정에 친구 다중선택 초대
├─ InviteDone ✅       [인증]  초대 전송 확인
├─ Settings ✅         [인증]  설정 허브(계정/알림/관계/지도/약관/탈퇴/로그아웃)
│  ├─ MapStartLocation ✅      지도 시작 위치(내 위치/즐겨찾기 풀) 선택
│  └─ FavoritePools 🟡         즐겨찾는 수영장 관리(로컬)
└─ (모달) WithdrawFlowModal ✅  회원 탈퇴 3단계(P1=로컬 teardown)
```

> ⛔ **체크인(check-in) 기능은 코드에 없음.** 위치/QR/시간창 기반 방문 인증 없음. 유사하나 다른 것: 내 과거 수영 일정을 "수영 완료"로 표시(`useSwimSchedules.setCompleted`, 로컬 전용).

---

## 3. 사용자 흐름 (주요 시나리오)

### 3.1 가입 · 온보딩 ✅(인증부) / 🟡(프로필 저장 로컬)
1. 비로그인 상태에서 지도(MapMain)의 프로필 FAB 탭 → `Login`.
2. 소셜 로그인: **Google**(idToken→Supabase) / **Kakao**(OAuth PKCE→Supabase) = 실제 인증. **Apple**=목업 테스트 경로(`signInMock`, 약관·프로필 초기화).
3. 약관 상태 확인 → 미동의면 `TermsAgreement`. **가입 필수 동의 4개**(① 만 14세 이상 ② 서비스 이용약관 ③ 개인정보 수집·이용 동의 ④ 위치기반서비스 이용약관) 체크 → 진행. **마케팅 정보 수신 동의는 선택**(게이트 아님). 개인정보 처리방침은 '고지' 문서로 동의 대상 아님(설정에서 열람만).
4. `ProfileSetup`: 닉네임(2~6자, 중복·금칙어 서버 검사) · 성별 · 생년월일 · 수영경력(0~30) · 영법.
5. `ProfileImage`: 기본 아바타(성별/소셜) 또는 사진 업로드(512px+64px 썸네일 → Supabase Storage).
6. `Welcome` → MapMain. 이후 "로그인" 판정 = 로컬 프로필 존재.

### 3.2 풀 탐색 → 시간표 열람 ✅
1. MapMain에서 풀 마커/클러스터 탭 → 하단 카드(이름·주소·전화·요금·레인·길이·수심·시설칩·즐겨찾기).
2. 카드 상태: 자유수영 불가(`free_swim_available=false`) / 시간표 없음 / 가능 → `ScheduleView`.
3. 대안 경로: FAB 필터 → `PoolFilter`(요일/레인/요금/시설) → `PoolList`(거리·이름 정렬), 또는 MapMain "수영장 목록" → `PoolList`.
4. `ScheduleView`: 풀별 자유수영 시간표(요일 칩, 시즌별 슬롯그룹, 요일 예외문구). **조회 전용** — 슬롯 더블탭 시 일정 추가 의도만 넘기고 닫힘.

### 3.3 수영 일정 추가 · 친구 초대 🟡(로컬 저장·초대 목업)
1. 일정 추가 진입(시간표 더블탭 / 친구 프로필 "나도 참여")이 의도(intent)를 설정 → 전역 시트(AddScheduleSheet)가 프리필로 열림.
2. 풀 검색 → 날짜(오늘~+90일) → 시간 슬롯 선택. **충돌 정책**: 중복(이미 등록)·시간겹침 슬롯은 선택 불가 + 5초 툴팁.
3. 공개범위 라디오: 비공개 / 친구에게만 / 전체공개(설정에 따라 숨김 가능).
4. "수영 일정 추가" → 로컬(AsyncStorage) 저장(`useSwimSchedules`). 완료 카드.
5. (친구 1명+) "이 일정에 친구 초대하기" → `InviteFriends`(친구 다중선택, 이미 참여/이미 초대 제외) → 전송 시 `dispatchMessage('invite_sent')`(작성자 본인 이력 1행만 Supabase insert) → `InviteDone`. **수신자에게 실제 전달 없음(Phase 2).**

### 3.4 친구 · 차단 🟡(메모리 목업, 재시작 시 초기화)
- 친구 그래프(`useFriends`)는 메모리 목업(`MOCK_FRIENDS` 등) — 서버·영속 없음.
- 새 친구 추가: 닉네임 검색 / ID(6자) 검색 → 초대장 보내기(목업).
- 받은 친구신청: 등록(수락) / 거절(`friend_request_rejected` dispatch, 본인 이력만).
- 차단/삭제: 타 프로필에서 확인 모달 → 차단=영구·전면 접점차단(해제 없음, store 경유 일괄 적용).

### 3.5 레슨 등록 🟡(로컬 프로필)
- Profile/MyInfo의 "레슨 정보 변경" → `SwimClassRegister`.
- 레슨 받는 수영장 선택 + 요일/시간 슬롯 추가 → "수영 레슨 정보 등록"(로컬 프로필 저장). 공개 시 타 프로필·지도 스택 노출.

### 3.6 회원 탈퇴 ✅(UI) / 🔵(서버 삭제 미구현)
- Settings > 계정 > 회원 탈퇴 → 3단계 모달(떠나시나요? → 정말? → 완료) → MapMain 리셋.
- `useAuth.deleteAccount` = **P1 로컬 teardown만**(supabase signOut + 소셜 signOut + 로컬 프로필 clear). **서버측 계정/데이터 영구삭제는 미구현(TODO P2, Edge Function 예정).** 효과상 로그아웃과 동일.

### 3.7 사용자 제보 ✅(서버 insert)
- 풀 등록/수정 요청 + 시간표 제보 — pool_submissions / schedule_submissions
- 운영자 승인 후 본 테이블 반영(pool_submission_approved/rejected 알림)

### 3.8 후원으로 서비스 응원 ✅
- **진입점**: 설정 > 헬프 센터 > 후원으로 서비스 응원하기 (Donation 화면, Figma 238:8643)
- **계좌 안내**: app_status(0068)의 donation_bank/account/holder를 운영자가 Dashboard에서 설정. 셋 다 있어야 카드 노출, 비어있으면 "준비 중" 표시. 계좌 복사 = expo-clipboard 동적 import.
- **흐름** (사용자 직접 작성 X — 운영자가 입금 확인 시 자동 등록):
  1. 사용자가 카카오뱅크로 송금(입금자명에 닉네임 입력 안내)
  2. 운영자가 Dashboard에서 **닉네임만 INSERT** (id 조회 불필요):
     ```sql
     insert into donation_payments (depositor_name, amount, received_at)
     values ('입금자명', 10000, now());
     ```
  3. **PostgreSQL 트리거가 자동으로:**
     - BEFORE INSERT(0073 `match_donor_profile_id`): `depositor_name → profiles.nickname` 매칭 → `profile_id` 자동 채움
     - AFTER INSERT(0072 `send_donation_thanks`): `profile_id` 확정되면 `donations` row + `notifications` 'donation_thanks' 적재
  4. 사용자는 본인 카드의 **문구 수정 / 후원 비공개** 액션으로 message UPDATE 또는 hidden 토글
  - 매칭 실패(닉네임 오타·탈퇴) 시 `profile_id` NULL로 남음 → 운영자가 확인 후 수동 UPDATE → `send_donation_thanks_on_match` 트리거가 시점에 발화
- **데이터 분리**:
  - `donations` (0069): 응원 메시지(공개). RLS write 본인 검증.
  - `donation_payments` (0070): 입금 기록(비공개). service_role 전용.
- **비공개(hidden=true)** = 본인 포함 모든 사용자 화면에서 미노출. 이력은 DB 보존. 클라 `dedupeDonationsForDisplay`가 hidden 행 모두 제외.
- **약관 영향**:
  - 서비스 이용약관 제15조(후원금): 자발적 기증 / 반환 불가 / 운영비 사용 / 자동 등록 흐름 / 본인 항목 수정·비공개 권리
  - 개인정보 처리방침: 응원 메시지(자동 등록 후 이용자 수정 가능) + 입금 식별 정보(운영자만 접근) 처리

- 수영장 등록 요청(이름·레인·길이·수심·시설) 또는 정보 수정 요청(이름+설명 ≤300자) → Supabase `pool_submissions` insert(실제). 좌표는 수집 안 함(운영자 처리). 운영자만 열람.

---

## 4. 데이터 모델

> **핵심 구분:** 사용자 프로필(PII)은 **서버 테이블이 아니라 기기 로컬(AsyncStorage)에만** 저장된다. 서버(Supabase)에 도달하는 사용자 귀속 데이터는 ① 소셜 인증 세션 ② 닉네임 문자열 ③ 아바타 이미지 ④ 알림 이력 ⑤ 제보뿐이다. (`user_profiles` 테이블 부재 확인 — P2 기획)

### 4.1 서버 DB (Supabase Postgres) — RLS 전 테이블 활성, 정책 없으면 service_role만

| 테이블 | 용도 | 핵심 필드 (필수 / 선택) | 관계·접근 |
|---|---|---|---|
| `pools` ✅ | 수영장 마스터 | 필수: id(PK), name, region, district, address, lat, lng, type(indoor/outdoor/both), ownership(public/private) · 선택: phone, website, lane_count, pool_length, depth_min/max, facilities[], price_weekday/weekend, price_per_session(legacy), photo_url, free_swim_available, has_kids/diving_pool, is_hotel_pool, has_schedule | 운영자/시드 write, **전체 read** |
| `schedules` ✅ | 풀별 자유수영 시간표(승인본) | 필수: pool_id(PK, FK→pools), author_nickname, by_day(jsonb 요일별 슬롯) · 선택: day_notes(jsonb), slot_groups(jsonb 시즌) | FK→pools(CASCADE), 운영자 write, **전체 read** |
| `schedule_submissions` ✅ | 시간표 제보 | 필수: id(PK), pool_id(FK), by_day, status(pending/approved/rejected) · 선택: nickname, submitter_note, day_notes | **누구나 INSERT**, SELECT 정책 없음(운영자만) |
| `pool_submissions` ✅ | 풀 등록/수정 제보 | 필수: id(PK), mode(create/edit), pool_name, status · 선택: pool_id(FK, edit시), description, submitter_contact, lane_count, pool_length, depth_min/max, has_kids/diving_pool, is_hotel_pool | **누구나 INSERT**, SELECT 정책 없음(운영자만) |
| `announcements` ✅ | 공지사항 | 필수: id(PK), type(new_feature/feature_update/info_update/event), title, body, published_at · 선택: bullets[], button_label, button_url | 운영자 write, **전체 read** |
| `profile_nicknames` ✅ | 닉네임 선점(중복방지) | 필수: nickname(PK), created_at. **프로필 본문 아님 — 닉네임 문자열만** | **전체 SELECT/INSERT**(목업 인증단계), 금칙어 트리거 |
| `nickname_blocklist` ✅ | 금칙·예약 닉네임(~80건) | 필수: term(PK), kind(reserved/profanity) | **전체 SELECT**, 운영자 write |
| `notifications` ✅ | 메시지/알림 이력 | 필수: id(PK), user_code(=프로필 6자 ID, auth.uid 아님), kind, title, body(jsonb), read, created_at · 선택: params/actions/related(jsonb) | **전체 SELECT/INSERT(개방 RLS)**. P1은 작성자 본인 행만 insert |
| `donations` ✅ | 후원 응원 메시지(공개) | 필수: id(PK), profile_id(FK→profiles cascade), message(1~300자), hidden, created_at, updated_at | RLS: read all, write 본인 검증(auth_uid). hidden=true는 본인만 본인 화면에서 표시 |
| `donation_payments` ✅ | 후원 입금 기록(비공개) | 필수: id(PK), depositor_name, amount(>0), received_at · 선택: profile_id(FK→profiles set null) | **service_role 전용** (정책 없음). INSERT/UPDATE 시 트리거가 자동 'donation_thanks' notifications 적재 |

**Storage 버킷:** `avatars` ✅ (마이그레이션 생성, public read / 소유자 폴더만 write, 경로 `{auth.uid}/avatar.jpg`+`avatar_thumb.jpg`) · `pool-photos` ✅ (마이그레이션 없음 — 운영자가 대시보드에서 수동 생성, public, 풀 INSERT에 URL 박힘)

### 4.2 기기 로컬 데이터 (AsyncStorage / 메모리) — 서버 미전송

| 저장소 | 보관 데이터 | 영속성 |
|---|---|---|
| `useProfile` (`poolsday.profile`) | **사용자 프로필 전체**: id(6자 친구코드), name, gender, birthDate, experienceYears, strokes, (선택) bio≤20자, certifications, im100Record, swimClasses[], lessonPoolId/Name, 항목별 공개플래그(show*) | 🟡 AsyncStorage 전용 (서버 테이블 없음, P2=user_profiles) |
| `useSwimSchedules` (`poolsday.swimSchedules`) | 내 수영 일정[]: poolId/Name, date, start/end, visibility, completed | 🟡 로컬, 비었으면 50개 목업 시드 |
| `useFavorites` (`poolsday.favorites`) | 즐겨찾는 poolId[] | 🟡 로컬 |
| `usePrefs` (`poolsday.prefs.*`) | 공개범위, 일정초대 on/off, 친구신청 범위, 지도 시작위치, 친구스택 표시 | 🟡 로컬(프라이버시 설정이 기기 한정) |
| `lib/terms` (`poolsday.terms.*`) | 가입 동의 시각 5키 — 필수 age·service·privacyConsent·location + 선택 marketing (ISO) | 🟡 로컬·**기기 단위**(계정 아님), P2=계정 이관 |
| `useAuth` | 소셜 세션(supabase-js가 AsyncStorage 영속) / Apple 목업키 | ✅ 세션 실 / 🟡 Apple 목업 |
| `useFriends`, `useNotifications`(unread), `useSentInvites`, `useSelection`, `useAddScheduleIntent`, `usePoolFilter` | 친구그래프·미읽음수·보낸초대·선택·필터 | 🟡 메모리 전용(재시작 초기화) |

---

## 5. 수집 데이터 (약관용)

> 약관·개인정보처리방침 작성 입력. **"어디 저장되나"가 핵심** — 대부분 PII는 서버에 없고 기기 로컬에만 존재.

### 5.1 가입 시 수집

| 데이터 | 필수 | 저장 위치 | 목적 |
|---|---|---|---|
| 소셜 로그인 신원(provider id / auth.uid) | 필수 | Supabase Auth 세션 | 계정 식별·로그인 |
| 이메일 | 필수(Google/Kakao 제공) | Supabase Auth 세션만(프로필 테이블 미복사) | 계정 식별 |
| 닉네임(2~6자) | 필수 | 로컬 프로필 + 서버 `profile_nicknames`(문자열만) | 표시명·친구검색·중복방지 |
| 성별 | 필수 | **기기 로컬만** | 프로필·기본아바타 |
| 생년월일 | 필수 | **기기 로컬만** | 프로필(나이는 텍스트로만, 비공개) |
| 수영경력(0~30) | 선택(기본10) | 기기 로컬만 | 프로필 |
| 영법 | 선택(기본 자유형) | 기기 로컬만 | 프로필 |
| 친구코드 ID(6자 자동생성) | 자동(재발급 가능) | 기기 로컬 + `notifications.user_code` | 친구추가·알림 수신키 |
| 프로필 사진 | 선택(기본 번들 아바타) | 실세션이면 Storage `avatars`, 아니면 로컬 URI | 아바타 |
| 가입 동의 시각 — 필수 4(만14세·서비스 이용약관·개인정보 수집·이용·위치기반서비스 이용약관) + 선택 1(마케팅) | 필수 4 / 선택 1 | 기기 로컬(기기단위) | 동의 게이트 |

### 5.2 자동 수집 (기기/위치/이용)

| 데이터 | 필수 | 저장 위치 | 목적 |
|---|---|---|---|
| 기기 위치(GPS lat/lng) | 선택(런타임 권한, 없어도 동작) | **저장 안 함** — 클라이언트 메모리만, 서버 전송 없음 | 근거리 풀 추천·지도 이동 |
| 위치/사진 권한 | 선택 | OS 레벨 | 위치·사진 기능 |
| 단말정보·앱버전·이용로그 | — | ⛔ **실제 미수집** (분석/텔레메트리 SDK 부재). termsContent의 "자동수집" 문구는 더미 | (문구상) 통계 |

### 5.3 사용자 입력(가입 후 콘텐츠)

| 데이터 | 필수 | 저장 위치 | 목적 |
|---|---|---|---|
| 자기소개 bio(≤20자), 자격증, IM100 기록, 레슨 풀·시간 | 선택 | **기기 로컬만** | 프로필·지도 스택 표시 |
| 항목별 공개범위·프라이버시 설정 | 선택 | 기기 로컬(`prefs`) | 노출 제어 |
| 풀 등록 제보(이름·레인·길이·수심·시설) | 제보 시 | 서버 `pool_submissions` | 운영자 검토 |
| 풀 수정 제보(이름·설명≤300자·연락처) | 제보 시 | 서버 `pool_submissions`(description, submitter_contact) | 운영자 검토 |
| 알림 이력(초대/거절 — 상대 표시명·풀·시간 포함) | 행동 시 | 서버 `notifications`(개방 RLS) | 알림 이력 |

### 5.4 제3자 제공

| 출처 | 데이터 | 저장 위치 | 목적 |
|---|---|---|---|
| Google | idToken→이름, 이메일, avatar_url | Supabase Auth user_metadata | 신원·프리필 |
| Kakao | OAuth→이름/닉네임, 이메일, picture | 〃 | 신원·프리필 |
| Apple | 🟡 목업(가짜 id·"애플유저") | 로컬 목업키 | 테스트 전용 |
| Naver Maps SDK | 지도 타일·기기 위치(지도 중심) | Naver Cloud(클라이언트 SDK) | 지도 렌더 |

---

## 6. 시스템 트리거 (푸시 정책용)

> 📄 **상세 명세:** 26개 알림 트리거의 발송 조건·수신자·본문·액션·우선순위·채널은 [notification-triggers-spec.md](notification-triggers-spec.md)에 정의(v0.1 초안). 본 절은 코드에 실제 선언된 룰 기준 현황만 기록한다.

> **결정적 사실:** **OS 푸시 알림이 코드에 전혀 없다** (expo-notifications/FCM/APNs/푸시토큰 부재). 모든 "알림"은 **인앱**(`notifications` 테이블 insert)이며, 표시되는 알림 목록(NotificationsTab)은 **정적 샘플 UI**로 테이블을 읽지도 않는다. 미읽음 배지는 메모리 시드. 설정의 "푸시 알림 받기" 토글은 미연동(로컬 state). → **푸시 정책은 사실상 신규 설계 대상**이며, 아래는 코드에 선언된 메시지 룰(`lib/messages/rules.ts`) 기준.

| 트리거 이벤트 | 발신 | 수신 대상 조건 | 분류 | 상태 | 전달 |
|---|---|---|---|---|---|
| 일정 초대 전송(invite_sent) | 행동 사용자 | 본인 이력 1행만 | 서비스 | ✅ 동작(2개 중 1) | 인앱(Supabase insert) |
| 친구신청 거절(friend_request_rejected) | 행동 사용자 | 본인 이력만(룰상 both) | 서비스 | ✅ 동작(2개 중 1) | 인앱 |
| 친구신청 수신(friend_request_received) | (상대→나) | self | 서비스 | 🔵 룰만, 미발송 | 인앱(기획) |
| 친구신청 수락(friend_request_accepted) | (행동+상대) | both | 서비스 | 🔵 미발송 | 인앱(기획) |
| 일정 초대 수신(invite_received) | (초대자→나) | self | 서비스 | 🔵 미발송 | 인앱(기획) |
| 초대 수락(invite_accepted) | (상대→나) | self | 서비스 | 🔵 미발송 | 인앱(기획) |
| 초대 거절(invite_rejected) | (상대→나) | self | 서비스 | 🔵 미발송 | 인앱(기획) |
| 초대 취소(invite_canceled) | (행동+상대) | both | 서비스 | 🔵 미발송 | 인앱(기획) |
| 초대 72h 무응답 자동만료(invite_auto_expired) | 시스템 | both | 서비스 | 🔵 미발송(타이머/크론 부재) | 인앱(기획) |
| 가입 환영(welcome) | 시스템→신규 | self | 서비스 | 🔵 미발송(정적 샘플로만) | 인앱(기획) |
| **후원 감사(donation_thanks)** | 운영자→후원자 | self | 서비스 | ✅ 동작(트리거 자동 발송) | 인앱(0070 트리거 — donation_payments INSERT 시) |

- **분류:** 코드상 발송 룰은 전부 **서비스(거래성) 알림**. **마케팅 푸시는 코드에 없음** — `termsContent`의 마케팅 동의 문구("앱 푸시 알림으로")는 더미·미구현.
- **수신키:** `notifications.user_code` = 프로필 6자 친구코드(개방 RLS — 코드 아는 누구나 read). 민감정보 미저장 전제이나 `params`에 상대 표시명·풀·시간 포함.

---

## 7. 외부 연동

| 서비스 | 용도 | 전송 데이터 | 키/비고 |
|---|---|---|---|
| **Supabase** (DB·Auth·Storage) | 백엔드 | 소셜 인증, 닉네임 문자열, 아바타 JPEG, 알림 이력, 풀/시간표 제보 | URL+anon key(공개, RLS 보호 — 현재 개방/목업단계). service_role 클라 미포함 |
| **Naver Maps SDK** (`@mj-studio/react-native-naver-map`) | 지도 렌더·네이티브 마커/클러스터 | 기기 위치(지도 중심), 지도뷰 요청 | Client ID는 app.config(번들ID 제한). **Secret 클라 제외**(지오코딩은 백엔드 이관 예정) |
| **Google Sign-In** | Google 로그인 | idToken(Supabase 교환) | Web client ID(env) |
| **Kakao OAuth** (Supabase Auth provider + expo-web-browser) | Kakao 로그인 | OAuth code(Supabase 교환), redirect `poolsday://auth/callback` | 키는 Supabase 서버측 |
| **Kakao Local REST API** (`scripts/geocode-kakao.mjs`) | ⚙️ **운영자 전용 스크립트** — 풀 주소→좌표(마이그레이션용) | 주소 질의 | REST key=Secret(.env.local, 채팅·코드·런타임 미포함). 앱 번들 아님 |
| expo-image-picker / image-manipulator | 프로필 사진 선택·리사이즈(512+64px, EXIF 제거) | 로컬→Storage 업로드 | 사진 권한 |
| expo-location | 근거리/지도 중심 GPS | 메모리만, 서버 미전송 | 위치 권한 문구 |
| expo-clipboard | 본인 친구코드 복사 | 본인 ID 문자열→클립보드 | — |
| @tanstack/react-query, supercluster, async-storage | 비동기 상태 / 클러스터링 / 로컬 영속 | 로컬 | — |

> ⛔ **분석·크래시리포팅·광고·푸시 SDK 일체 없음** (Sentry/Firebase/Amplitude/expo-notifications 등 부재).

---

## 8. 미결정·향후 확장

### 8.1 비즈니스 모델 (BM) — ⛔ 코드에 일체 없음
- 결제·구독·인앱구매·광고·프리미엄 코드 부재. 사업자 등록/PG/약관상 유료 항목 없음.
- 가치 후보(섹션 1 핵심가치 기반, 미결정): 풀 운영자 제휴(시간표·상세 노출), 프리미엄(친구·일정 고도화/광고제거), 위치기반 광고/제휴 쿠폰, 데이터(지역 자유수영 수요) — **전부 기획 단계, 본 스펙은 사실 기록만**.
- 사업자 등록 상태: 코드/문서로 확인 불가(스펙 외). 약관 작성 시 별도 확인 필요.

### 8.2 Phase 2 백엔드 SSOT (코드에 자리/주석 존재, 미구현)
- **사용자 프로필 서버화**: 현재 PII 전부 기기 로컬(AsyncStorage, 비암호화 JSON). P2 `user_profiles` 테이블 이관 필요(약관·데이터보관 정책 직결).
- **약관 동의 서버화·버전관리**: 현재 기기단위·필수4(age/service/privacyConsent/location)+marketing(선택). P2 = `terms`(유형/버전/시행일/내용) + `terms_agreements`(누가·언제·어떤 버전·agree/withdraw, append-only 감사로그) 분리, 버전 고정·재동의·철회 이벤트. *(스키마 초안 작성 완료: `supabase/migrations/0044_terms.sql` — Phase 2, 미적용. 활성화 시 lib/terms.ts 를 계정단위 서버 모델로 이관 필요.)*
- **친구/일정/초대 실연동**: 친구그래프·내 일정·초대가 로컬·목업 → 서버 테이블 + 양방향 전달.
- **알림 전달·실시간**: 현재 본인 이력만 insert, 수신자 적재·realtime·NotificationsTab 실데이터 미연동. 룰 10개 중 8개 미발송.
- **OS 푸시 인프라 부재**: 푸시 토큰/발송 서버 전무 → 푸시 정책 실행 전 신규 구축 필요.
- **회원 탈퇴 서버 삭제**: P1 로컬 teardown만, 서버 계정/데이터 영구삭제 Edge Function 미구현.
- **약관 본문**: `lib/termsContent.ts` 전부 "임시 더미 — 교체 예정" 표식. 실제 5종(서비스 이용약관 / 개인정보 수집·이용 동의 / 개인정보 처리방침 / 위치기반서비스 이용약관 / 마케팅 정보 수신 동의) 문구 미작성.

### 8.3 설계됨·미연결 화면
- `ErrorNotFound` / `ErrorNoInternet` / `Maintenance` / `AppUpdateRequired`: 라우트 등록만, 진입 트리거 코드 없음(`OfflineGate`는 App.tsx에서 주석처리, expo-network 네이티브 빌드 대기). 일러스트는 placeholder.

---

*근거: `src/screens/**`, `src/components/**`, `src/store/**`, `src/lib/**`, `src/types/**`, `src/navigation/**`, `supabase/migrations/0001~0043`, `app.config.ts`, `package.json` 전수 확인. 본 문서는 P1 현행 사실 기록이며, 🔵/⛔ 항목은 후속 기획·구현 대상이다.*
