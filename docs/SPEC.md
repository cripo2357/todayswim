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
│  └─ (탭) NotificationsTab ✅ 알림 목록 (실 notifications fetch, 0건 시 mock 갤러리 폴백). 탭 진입 시 read=true 일괄 UPDATE
├─ Profile ✅          [인증]  프로필 보기·수정(닉네임/소개/성별/생일/경력/레슨/영법/자격증/IM100 + 항목별 공개범위)
├─ SwimClassRegister ✅[인증]  레슨 받는 수영장 + 주간 시간 슬롯 등록(로컬 프로필)
├─ OtherUserProfile 🟡 [인증]  타 사용자 프로필·친구신청/수락·일정참여·차단/삭제
├─ InviteFriends 🟡    [인증]  확정 일정에 친구 다중선택 초대
├─ InviteDone ✅       [인증]  초대 전송 확인
├─ Settings ✅         [인증]  설정 허브(계정/알림/관계/지도/약관/헬프센터/탈퇴/로그아웃)
│  ├─ MapStartLocation ✅      지도 시작 위치(내 위치/즐겨찾기 풀) 선택
│  ├─ FavoritePools 🟡         즐겨찾는 수영장 관리(로컬)
│  ├─ Faq ✅                   자주 묻는 질문(서버 `faqs`, 카테고리 4탭, 단일오픈 아코디언)
│  └─ Donation ✅              후원으로 서비스 응원하기(계좌 안내 + 응원자 카드 + 본인 메시지 수정/비공개)
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

### 3.6 회원 탈퇴 ✅
- Settings > 계정 > 회원 탈퇴 → 3단계 모달(떠나시나요? → 정말? → 완료) → MapMain 리셋.
- `useAuth.deleteAccount` = **Edge Function `delete-account` 호출 → 로컬 teardown**.
- Edge Function 처리(service_role):
  1) JWT 검증으로 호출자 신원 확인
  2) Storage `avatars/{uid}/` 파일 일괄 삭제(avatar.jpg + thumb)
  3) `profiles` row 삭제 → CASCADE 로 `donations` 자동 삭제 (0069 FK)
  4) `auth.users` row 삭제 (admin API)
- **즉시 삭제**: auth.users / profiles / donations / Storage avatars
- **보존 (90일 후 별도 cron — P3 후속)**: notifications · profile_nicknames (재가입 부정이용 방지)
- **보존 (5년 — 「국세기본법」 회계)**: donation_payments (0070 FK `ON DELETE SET NULL`)
- 서버 호출 실패 시 로컬 teardown 도 진행 안 함 — 부분 삭제 회피(auth.users 와 profiles 의 불일치 방지).
- Apple TEST MODE mock 세션은 Supabase 세션이 없어 Edge Function skip → 로컬 teardown 만.

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
     - AFTER INSERT(0072→0077 `send_donation_thanks`): `profile_id` 확정되면 `donations` row + `notifications` 'donation_thanks' 적재
  4. 사용자는 본인 카드의 **문구 수정 / 후원 비공개** 액션으로 message UPDATE 또는 hidden 토글
  - 매칭 실패(닉네임 오타·탈퇴) 시 `profile_id` NULL로 남음 → 운영자가 확인 후 수동 UPDATE → `send_donation_thanks_on_match` 트리거가 시점에 발화
- **응원 메시지 초기값** (0077): 트리거가 donations row 생성 시 메시지를 **10개 후보 풀에서 랜덤 1개**로 채운다(응원/감사/일상/추천/보탬 톤 mix). 단일 디폴트만 박히면 카드 목록이 단조해 다양화. 사용자는 본인 카드에서 자유롭게 수정 가능.
- **'응원글 보기' 자동 스크롤**: 알림 탭의 'donation_thanks' 카드에서 '응원글 보기' 액션 → `navigate('Donation', { scrollToMine: true })` → 화면 진입 시 본인 카드 위치(list y + mine card y onLayout 합산)로 자동 scrollTo. dedupe 로 본인 카드 1장이라 위치 정확.
- **인라인 편집 키보드 회피**: 본인 카드 "문구 수정" → textarea autoFocus → 키보드 등장 → 카드 절대 bottom 계산(`listY + mineCardY + mineCardH`) - visibleH + 12px 마진 만큼 명시적 scrollTo. RN native auto-scroll 은 input top 만 보이게 해서 [취소][작성 완료] 배지 가려지는 문제를 카드 bottom 기준으로 해결.
- **데이터 분리**:
  - `donations` (0069): 응원 메시지(공개). RLS write 본인 검증.
  - `donation_payments` (0070): 입금 기록(비공개). service_role 전용.
- **비공개(hidden=true)** = 본인 포함 모든 사용자 화면에서 미노출. 이력은 DB 보존. 클라 `dedupeDonationsForDisplay`가 hidden 행 모두 제외.
- **재후원 시 정책**(per-donation 독립): 같은 사용자가 이전 후원 row 를 hidden 처리한 뒤 또 후원하면 새 row 는 기본 hidden=false 로 등장. dedupe 가 latest 만 노출하므로 결과적으로 새 후원은 다시 노출. 사용자가 원하면 또 hidden 토글.
- **약관 영향**:
  - 서비스 이용약관 제15조(후원금): 자발적 기증 / 반환 불가 / 운영비 사용 / 자동 등록 흐름 / 본인 항목 수정·비공개 권리
  - 개인정보 처리방침: 응원 메시지(자동 등록 후 이용자 수정 가능) + 입금 식별 정보(운영자만 접근) 처리

### 3.9 자주 묻는 질문 (FAQ) ✅
- **진입점**: 설정 > 헬프 센터 > 자주 묻는 질문 (Faq 화면, Figma 239:3560)
- **구성**: 헤더 + 일러스트 + "Pool's day 에 메일 보내기" CTA(`mailto:cripo2357@gmail.com`) + **카테고리 탭 4그룹**(처음 / 정보 / 활동 / 설정) + 단일 오픈 아코디언 리스트(Figma 245:5819).
- **데이터**: Supabase `faqs` 테이블(0071) — 운영자가 Dashboard 에서 직접 추가/수정/삭제. 화면은 `useFaqs` 가 `sort_order asc` 로 fetch.
- **카테고리** (0073_faqs_category):
  - `first` — 가입·계정 라이프사이클(서비스 소개·로그인·약관·닉네임·친구 ID·로그아웃·탈퇴)
  - `info` — 수영장·시간표 조회(지도·필터·즐겨찾기·요금·시간표·제보)
  - `activity` — 일정·친구·레슨(일정 추가/완료/초대·친구 추가/차단/삭제·레슨 등록/해제)
  - `settings` — 프로필·공개범위·알림·개인정보(프로필 수정/공개·친구 신청 받기·레슨 가시성·알림 토글·위치/사진 권한)
- **현재 시드**: 0072_faqs_expand 가 44개 질문으로 초기 채움. SPEC 의 P1 전기능을 균형 있게 커버. 톤앤매너는 따뜻하고 친근하게.
- **운영**: announcements 와 동일 패턴 — RLS read all, write service_role 만. 운영자가 사용자 문의 패턴 보고 항목 가감.


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
| `notifications` ✅ | 메시지/알림 이력 | 필수: id(PK), user_code(=프로필 6자 ID, auth.uid 아님), kind, title, body(jsonb), read, created_at · 선택: params/actions/related(jsonb) | RLS — **select 본인 행만**(P3-C2 / `user_code = profiles.id where auth_uid = auth.uid()`), update/delete 본인 행, insert any (dispatchMessageTo RPC 리팩 전까지 P3 후속) |
| `donations` ✅ | 후원 응원 메시지(공개) | 필수: id(PK), profile_id(FK→profiles cascade), message(1~300자), hidden, created_at, updated_at | RLS: read all, write 본인 검증(auth_uid). hidden=true는 본인만 본인 화면에서 표시. trigger 가 INSERT 시 10개 풀에서 랜덤 디폴트 메시지 박음(0077) |
| `donation_payments` ✅ | 후원 입금 기록(비공개) | 필수: id(PK), depositor_name, amount(>0), received_at · 선택: profile_id(FK→profiles set null) | **service_role 전용** (정책 없음). INSERT/UPDATE 시 트리거가 자동 'donation_thanks' notifications + donations row 적재 |
| `donation_totals_v` ✅ | 종합 후원 누적 view (0080) | profile_id, total_amount, payment_count, first_at, last_at | service_role 전용(`security_invoker=on` → base table RLS 상속). 운영자가 큰손 식별·보고용 |
| `donation_yearly_totals_v` ✅ | 연도별 후원 누적 view, KST 기준 (0080) | profile_id, year, total_amount, payment_count, first_at, last_at | service_role 전용(`security_invoker=on`). `extract(year from received_at at time zone 'Asia/Seoul')` 로 한 해 끊음 |
| `faqs` ✅ | 자주 묻는 질문 | 필수: id(PK uuid), question, answer, sort_order, category('first'/'info'/'activity'/'settings'), created_at, updated_at | RLS read all, write service_role 만. 운영자가 Dashboard 에서 직접 추가/수정/삭제. 현재 시드 44개(0072_faqs_expand → 0073_faqs_category 분류) |
| `app_status` ✅ | 운영자 설정 단일 row(점검·강제업데이트·후원 계좌) | 필수: id(=1 single-row), maintenance_mode, min_version · 선택: donation_bank, donation_account, donation_holder(0068) | RLS read all, write service_role 만. 클라가 Splash + Donation 화면에서 조회 |
| `terms` ✅ | 약관 문서·버전 마스터 (0044 + 0079) | 필수: id(PK), type(service/privacy_consent/privacy_policy/location/marketing), version, effective_date, content(jsonb), is_required, requires_consent, is_active | RLS read all, write service_role 만. 5종 시드 v1.0.0. 운영자가 개정 시 새 row + is_active 교체 |
| `terms_agreements` ✅ | 약관 동의 이력 — append-only 감사 로그 (0044) | 필수: id(PK), user_id(FK→auth.users CASCADE), terms_type, terms_version(스냅샷), action(agree/withdraw), meta(jsonb), created_at | RLS: 본인 행만 select/insert, UPDATE/DELETE 정책 없음 = 불변. Apple mock 은 auth.users 없어 로컬 폴백 |
| `push_tokens` ✅ | OS 푸시 토큰 저장 (P3-A4, 0082) | 필수: id(PK), user_id(FK→auth.users CASCADE), expo_token(unique), platform(ios/android/web), created_at, updated_at · 선택: device_label | RLS 본인 행만(select/insert/update/delete = auth.uid()=user_id). 죽은 토큰은 send-push 가 자동 DELETE |

**Storage 버킷:** `avatars` ✅ (public read / **본인 폴더만 write/update/delete**, P3-C3 하드닝 0081 로 0045 개방 폐기 + 0020 원형 복원, 경로 `{auth.uid}/avatar.jpg`+`avatar_thumb.jpg`) · `pool-photos` ✅ (마이그레이션 없음 — 운영자가 대시보드에서 수동 생성, public, 풀 INSERT에 URL 박힘)

### 4.2 기기 로컬 데이터 (AsyncStorage / 메모리) — 서버 미전송

| 저장소 | 보관 데이터 | 영속성 |
|---|---|---|
| `useProfile` (`poolsday.profile`) | **사용자 프로필 전체**: id(6자 친구코드), name, gender, birthDate, experienceYears, strokes, (선택) bio≤20자, certifications, im100Record, swimClasses[], lessonPoolId/Name, 항목별 공개플래그(show*) | 🟡 AsyncStorage 전용 (서버 테이블 없음, P2=user_profiles) |
| `useSwimSchedules` (`poolsday.swimSchedules`) | 내 수영 일정[]: poolId/Name, date, start/end, visibility, completed | 🟡 로컬, 비었으면 50개 목업 시드 |
| `useFavorites` (`poolsday.favorites`) | 즐겨찾는 poolId[] | 🟡 로컬 |
| `usePrefs` (`poolsday.prefs.*`) | 공개범위, 일정초대 on/off, 친구신청 범위, 지도 시작위치, 친구스택 표시 | 🟡 로컬(프라이버시 설정이 기기 한정) |
| `lib/terms` (`poolsday.terms.*`) | 가입 동의 시각 캐시 5키 + 마케팅 거부 시각(rejected) | 서버 단일 출처(`terms_agreements`) **+ 로컬 캐시**. 'age' 는 로컬 한정. Apple mock / 오프라인 시 로컬 폴백(P3-A2). |
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
| 가입 동의 시각 — 필수 4(만14세·서비스 이용약관·개인정보 수집·이용·위치기반서비스 이용약관) + 선택 1(마케팅) | 필수 4 / 선택 1 | **계정 단위 서버(`terms_agreements` append-only)** + 로컬 캐시. 'age' 는 약관 문서 아님 = 로컬만 | 동의 게이트 / 법적 증빙 |

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

> **현황 (P3-A4 골격 완료):** OS 푸시 인프라가 들어왔다 — `expo-notifications` + `push_tokens` 테이블(0082) + Edge Function `send-push` (Expo Push Service 경유). 로그인 직후 `registerForPush(auth.uid)` 가 권한 요청·토큰 발급·upsert. 단 **네이티브 동작은 다음 EAS 빌드 이후** (현재는 코드만, dev 클라이언트에서는 동적 import 가 silent fail). 발송 측은 운영자가 Dashboard 에서 `send-push` 호출하거나 향후 trigger/RPC 에 연결(P3 후속).
> NotificationsTab(인앱 알림함) 은 별개로 실 테이블에서 fetch (0건 시 mock 갤러리 폴백). 미읽음 배지 = **서버 `count(*) WHERE read=false`**(P3-A5).
> 설정의 "푸시 알림 받기" 토글은 인앱 토글이며, OS 권한 자체는 `registerForPush` 의 시스템 다이얼로그가 별도 관리.

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
| **후원 감사(donation_thanks)** | 운영자→후원자 | self | 서비스 | ✅ 동작(트리거 자동 발송) | 인앱(0070→0077 트리거 — donation_payments INSERT 시. 알림 본문 "Pool's day 운영에 소중히 쓸게요. 고맙습니다.", 액션 '응원글 보기'→본인 카드 자동 스크롤) |

- **분류:** 코드상 발송 룰은 전부 **서비스(거래성) 알림**. **마케팅 푸시는 코드에 없음** — `termsContent`의 마케팅 동의 문구("앱 푸시 알림으로")는 더미·미구현.
- **수신키:** `notifications.user_code` = 프로필 6자 친구코드. **RLS: 본인 행만 read** (P3-C2 — `user_code = profiles.id where auth_uid = auth.uid()`). insert 는 dispatchMessageTo 패턴 위해 개방 유지(P3 후속 RPC 도입 시 좁힘). `params` 에 상대 표시명·풀·시간 포함.

---

## 7. 외부 연동

| 서비스 | 용도 | 전송 데이터 | 키/비고 |
|---|---|---|---|
| **Supabase** (DB·Auth·Storage) | 백엔드 | 소셜 인증, 닉네임 문자열, 아바타 JPEG, 알림 이력, 풀/시간표 제보 | URL+anon key(공개, RLS 보호 — 0060/0081 본인 검증 하드닝). service_role 클라 미포함 (Edge Function `delete-account` 만 service_role 사용) |
| **Naver Maps SDK** (`@mj-studio/react-native-naver-map`) | 지도 렌더·네이티브 마커/클러스터 | 기기 위치(지도 중심), 지도뷰 요청 | Client ID는 app.config(번들ID 제한). **Secret 클라 제외**(지오코딩은 백엔드 이관 예정) |
| **Google Sign-In** | Google 로그인 | idToken(Supabase 교환) | Web client ID(env) |
| **Kakao OAuth** (Supabase Auth provider + expo-web-browser) | Kakao 로그인 | OAuth code(Supabase 교환), redirect `poolsday://auth/callback` | 키는 Supabase 서버측 |
| **Kakao Local REST API** (`scripts/geocode-kakao.mjs`) | ⚙️ **운영자 전용 스크립트** — 풀 주소→좌표(마이그레이션용) | 주소 질의 | REST key=Secret(.env.local, 채팅·코드·런타임 미포함). 앱 번들 아님 |
| expo-image-picker / image-manipulator | 프로필 사진 선택·리사이즈(512+64px, EXIF 제거) | 로컬→Storage 업로드 | 사진 권한 |
| expo-location | 근거리/지도 중심 GPS | 메모리만, 서버 미전송 | 위치 권한 문구 |
| expo-clipboard | 본인 친구코드 복사 | 본인 ID 문자열→클립보드 | — |
| @tanstack/react-query, supercluster, async-storage | 비동기 상태 / 클러스터링 / 로컬 영속 | 로컬 | — |

- **Sentry** (`@sentry/react-native`) — P3-A6 크래시·에러 리포팅. DSN 은 `EXPO_PUBLIC_SENTRY_DSN` env (없으면 init no-op). JS 에러는 즉시 보고, 네이티브 크래시는 다음 EAS 빌드 후 활성. `sendDefaultPii=false`, `setUser` 로 auth.uid 만 묶임(닉네임/이메일 PII 미전송).
- **Expo Push Service** (`expo-notifications`, P3-A4) — OS 푸시 발송. 토큰(`ExponentPushToken[...]`) 은 `push_tokens` 테이블 보관, Edge Function `send-push` 가 `https://exp.host/--/api/v2/push/send` POST. FCM/APNs 키 직접 관리 X — Expo 가 프록시. 다음 EAS 빌드 후 토큰 발급 가능, 출시 시점에 Apple Developer / Google Play 콘솔에서 푸시 capability 등록.

> ⛔ **분석·광고 SDK 없음** (Firebase Analytics/Amplitude 등 부재).

---

## 8. 미결정·향후 확장

### 8.1 비즈니스 모델 (BM) — ⛔ 코드에 일체 없음
- 결제·구독·인앱구매·광고·프리미엄 코드 부재. 사업자 등록/PG/약관상 유료 항목 없음.
- 가치 후보(섹션 1 핵심가치 기반, 미결정): 풀 운영자 제휴(시간표·상세 노출), 프리미엄(친구·일정 고도화/광고제거), 위치기반 광고/제휴 쿠폰, 데이터(지역 자유수영 수요) — **전부 기획 단계, 본 스펙은 사실 기록만**.
- 사업자 등록 상태: 코드/문서로 확인 불가(스펙 외). 약관 작성 시 별도 확인 필요.

### 8.2 Phase 2 백엔드 SSOT (코드에 자리/주석 존재, 미구현)
- **사용자 프로필 서버화**: 현재 PII 전부 기기 로컬(AsyncStorage, 비암호화 JSON). P2 `user_profiles` 테이블 이관 필요(약관·데이터보관 정책 직결).
- ~~**약관 동의 서버화·버전관리**~~ → **P3-A2 완료** (2026-05-21).
  - 0044 + **0079_terms_activate** 적용 — `terms` 5종 시드(v1.0.0, 2026-05-28).
  - `lib/terms.ts` 서버+로컬 하이브리드: Google/Kakao 실 세션 → `terms_agreements` 서버 적재(append-only) + 로컬 캐시. Apple TEST MODE / 오프라인 → AsyncStorage 폴백.
  - 마케팅 토글(`prefs.setNotifMarketing`) 도 `setConsent('marketing')` 경유 → 서버 동기.
  - 'age' 는 약관 문서 아님 = 클라이언트 게이트, AsyncStorage 한정 유지.
  - 약관 본문은 `src/lib/termsContent.ts` 가 단일 출처(앱 배포 단위). 법적 증빙 = `terms_agreements.terms_version` 문자열 스냅샷 + git.
- **친구/일정/초대 실연동**: 친구그래프·내 일정·초대가 로컬·목업 → 서버 테이블 + 양방향 전달.
- **알림 전달·실시간**: ~~NotificationsTab 실데이터 미연동~~ → **P3-A5 완료**(서버 fetch + 0건 시 mock 폴백 + 미읽음 카운트 서버 count + 일괄 read UPDATE). 남은 항목: 수신자 적재(상대방에게 가는 트리거 — 룰 10개 중 8개 미발송, 서버 사이드 dispatch 필요), realtime 구독(현재 60s staleTime).
- **OS 푸시 인프라 부재**: 푸시 토큰/발송 서버 전무 → 푸시 정책 실행 전 신규 구축 필요.
- ~~**회원 탈퇴 서버 삭제**: P1 로컬 teardown만, 서버 계정/데이터 영구삭제 Edge Function 미구현.~~ → **P3 완료** (Edge Function `delete-account`, §3.6 참고). 90일 후 cron 으로 notifications · profile_nicknames 파기는 후속.
- **약관 본문**: `lib/termsContent.ts` 전부 "임시 더미 — 교체 예정" 표식. 실제 5종(서비스 이용약관 / 개인정보 수집·이용 동의 / 개인정보 처리방침 / 위치기반서비스 이용약관 / 마케팅 정보 수신 동의) 문구 미작성.

### 8.3 RLS·Storage 최종 하드닝 (P3-C2/C3 완료, 2026-05-21)
- 0060 (P2 마무리) 가 profiles/friend_requests/friendships/blocks/user_schedules/notifications 의 **write 정책**을 본인 검증으로 잠굼.
- 0081 (P3) 가 남은 두 영역 마저 잠굼:
  - `notifications.select` → 본인 행만 (`user_code = profiles.id where auth_uid = auth.uid()`)
  - `avatars` Storage → 본인 폴더만 (0020 원형 복원, 0045 P1 개방 폐기)
- **P3 후속 남은 작업**:
  - `notifications.insert_any` → security-definer RPC 함수 (dispatchMessageTo 패턴 RPC 로 이관 후 본인 행 강제)
  - 90일 후 자동 파기 cron (탈퇴 후 notifications · profile_nicknames 파기)
- ⚠️ Apple TEST MODE 사용자는 auth.uid 가 없어 0081 하에서 알림 fetch / 아바타 업로드 불가. 출시 시점에 Apple TEST MODE 비활성화 + 정식 Apple 로그인 전환 필요.

### 8.4 OS 푸시 인프라 (P3-A4 골격 완료, 2026-05-21 — 발송 통합은 P3 후속)
- **클라이언트** (`src/lib/pushNotifications.ts`):
  - `registerForPush(authUid)` — 권한 요청 → `getExpoPushTokenAsync()` → `push_tokens` upsert. `expo-notifications` + `expo-device` 동적 import (dev 클라이언트 호환).
  - `unregisterCurrentDevice()` — 로그아웃 시 본인 디바이스 토큰 DELETE.
  - `store/auth` 의 `onAuthStateChange` SIGNED_IN 에서 자동 호출.
- **서버** (`supabase/functions/send-push`):
  - service_role 호출 → push_tokens lookup → Expo Push API batch POST (100개 chunk).
  - DeviceNotRegistered → 자동 DELETE.
- **활성화 조건**: 다음 EAS 빌드 (네이티브 모듈). dev 클라이언트에서는 silent fail.
- **후속 작업**:
  - `dispatchMessage` / `dispatchMessageTo` 가 인앱 알림 적재 후 send-push 자동 호출 — 룰 10개 중 미발송 8개 활성화.
  - 사용자별 푸시 설정 (`prefs.pushOn` + 5 sub) 을 send-push 가 존중하도록 필터링.
  - Apple Developer / Google Play 콘솔에서 푸시 capability 등록 (외부 의존성 B).

### 8.5 크래시·에러 리포팅 (P3-A6 완료, 2026-05-21)
- **Sentry SDK** (`@sentry/react-native`) 통합 — `app.config.ts` plugin `@sentry/react-native/expo` + `App.tsx` 의 `initSentry()` + `<SentryErrorBoundary>` 래퍼.
- **활성화 조건**: `EXPO_PUBLIC_SENTRY_DSN` env 가 있어야 init 동작 (없으면 no-op). EAS env + 로컬 `.env` 양쪽에 동일 등록 필요.
- **JS 에러**: init 직후부터 fetch 로 즉시 보고 (네이티브 빌드 안 해도 동작).
- **네이티브 크래시(NDK/Obj-C)**: 다음 EAS 빌드 후 활성화 — `pending_native_batch` 항목.
- **PII 정책**: `sendDefaultPii=false`. `setSentryUser(auth.uid)` 만 등록(닉네임/이메일 미전송).
- **활성화 순서**: ① sentry.io 프로젝트 생성 → ② DSN 복사 → ③ `.env` + EAS env 등록(production/preview/development 3환경) → ④ 다음 EAS 빌드.

### 8.6 상태 화면 트리거 (P3-A3 완료)
- ✅ **Maintenance / AppUpdateRequired** — Splash 부팅 게이트(`fetchAppStatus` → 분기) + **런타임 게이트** (`RuntimeStatusGate`: 5분 폴링 + AppState 'active' 시 즉시 재조회 → 변화 시 `navigation.reset`). 운영자가 세션 중 점검 ON / min_app_version 상향해도 사용자가 자동으로 게이트로 이동.
- ✅ **ErrorNoInternet** — `OfflineGate` (App.tsx) 가 expo-network 동적 import 로 isConnected/isInternetReachable 구독 → false 시 reset. 복귀는 사용자 "새로 고침" 수동(자동 복귀 시 화면 상태 손실 회피).
- ✅ **ErrorNotFound** — `NavigationContainer` linking `getStateFromPath` 가 매칭 안 되는 deep link 를 404 라우트로 fallback.
- 일러스트: `maintenance.svg` / `app-update.svg` / `error-internet.svg` / `error-404.svg` 모두 정식 export.

---

*근거: `src/screens/**`, `src/components/**`, `src/store/**`, `src/lib/**`, `src/types/**`, `src/navigation/**`, `supabase/migrations/0001~0082`, `supabase/functions/**`, `app.config.ts`, `package.json` 전수 확인. 본 문서는 P1·P2·P3 진행 현황 사실 기록이며, 🔵/⛔ 항목은 후속 기획·구현 대상이다. 최근 갱신(2026-05-21): §3.6 회원 탈퇴 서버 영구 삭제(P3-A1), §3.9 FAQ 신설, §4 faqs·app_status·terms·terms_agreements·push_tokens 테이블 추가, §6 미읽음 카운트 서버화(P3-A5) + OS 푸시 인프라 골격(P3-A4), §8.2 약관 동의 서버화(P3-A2), §8.3 RLS·Storage 최종 하드닝(P3-C2/C3), §8.4 OS 푸시 인프라(P3-A4), §8.5 Sentry 크래시 리포팅(P3-A6), §8.6 상태 화면 런타임 게이트(P3-A3).*
