# Pool's day — 출시(배포) 일정 기록

> Google Play(2026-06-03) · App Store(2026-06-07) 프로덕션 첫 출시까지의 전체 타임라인.
> **최종 상태: 양 스토어 프로덕션 심사 제출 완료 — 둘 다 승인 대기 중.**

## 출시 요약

| 항목 | 값 |
|---|---|
| 앱 | Pool's day (`com.cripo.poolsday`) |
| 버전 | **v0.1.0 / versionCode 12** |
| 빌드 | EAS production AAB — `db0c1460-b8d4-4935-b813-92b31b0afbe0` |
| 출시 국가 | 대한민국 (단일) |
| 게시 방식 | 관리형 게시 OFF → **심사 승인 즉시 자동 공개** |
| 백엔드 | prod Supabase (`rwxefcbqybzsyjtpfbdt`) |
| 개발자 | CRIPO (사업자등록 379-13-02772) · 조직 계정 |
| 결과 통보 | cripo2357@gmail.com |

---

## 2026-06-03 — 출시 당일 타임라인

### ① 새벽 — 인증/약관 마무리 (01:00~04:30)
- `01:03` 카카오 프로필 이미지 로드 + 실패 시 폴백
- `01:12` Apple mock 로그인 백도어 제거 — Google/Kakao만 (정식 출시)
- `02:xx` 약관 동의 서버 보관(재로그인/기기변경 복원), 만14세 동의 포함
- `03:01` 공지 더미 시드 제거 마이그레이션(0107)
- `04:27` 지도 FAB 아이콘 사이즈 통일

### ② 오전 — 탈퇴 정책 + DB 배포 도구 (11:30~15:20)
- `11:44` 탈퇴 시 즉시 전체 파기로 전환 (구 90일 보존 폐기)
- `11:48` 마이그레이션 원커맨드 배포 스크립트 (dev→prod)
- `14:54` db-deploy Windows 실행 방식 수정
- `15:20` 성별 시트 commitOnClose

### ③ 오후 — UI 정합/버그 수정 배치 (16:00~19:36)
- `16:04` 프로필 등록 성별·생년월일 안내문구 + 캘린더 아이콘 (Figma 101:4367)
- `16:22` **calendar-form.svg 버그** — 잘못된 share 아이콘 → 정상 달력 (Figma 110:3761)
- `18:31` 설정 아이콘 3종 viewBox 정규화 — 시각 크기 통일
- `18:38` **휠 흰색 텍스트 버그** — 전 휠 피커(수업시간·수심·연월) 선택값 색 누락 수정
- `19:01` 수심 입력 시트 세로 스택 레이아웃 (Figma 101:5025) + chart-bubble 아이콘
- `19:29` 설정 프로필 생년월일 필드를 가입 화면과 통일 (Figma 348:5718)
- `19:32` 가입 프로필 화면 너비·필드 간격 통일 (패딩 24→16)
- `19:36` ClubMain 가로 패딩 20→16 — 전 화면 16 표준 통일 완료

### ④ 빌드 (EAS)
| 시각 | 빌드 | 종류 | 비고 |
|---|---|---|---|
| ~16:58 | `f0fa5a39` | preview APK (prod env) | 기기 테스트용 |
| ~17:44 | `b22a37f9` | production AAB (vc 10) | 초기 AAB |
| (중간) | `1818fd4e` | production AAB (vc 11) | UI 수정 반영 |
| **19:39→19:54** | **`db0c1460`** | **production AAB (vc 12)** | **최종 제출본** (~15분 소요) |

### ⑤ prod DB 정리 (출시 전 위생)
- prod(rwxefc) **테스트 사용자 데이터 전체 삭제** — profiles / profile_nicknames / friends / blocks / notifications / user_schedules / donations / auth.users 등 (FK 안전순서 DO 블록)
- **보존**: pools(31), schedules(31), nickname_blocklist(71), faqs(48), terms(5), app_status(1)
- 결과: 닉네임 "은호" 포함 모든 테스트 잔여 제거 → 깨끗한 prod 확보
- prod 마이그레이션 갭 점검: dev↔prod pools 31=31 ID 완전일치, deleted_users는 0110에서 의도적 DROP → **동기화 정상 확인**

### ⑥ 구글 로그인 살리기 (핵심 게이트)
- 증상: prod 빌드에서 구글 로그인 실패 위험 (`google-services.json` oauth_client 0개)
- 원인: **Play 앱 서명 키 SHA-1이 한 번도 등록 안 됨**
- 조치: Play Console > 앱 서명(keymanagement)에서 **앱 서명 키 인증서** 지문 확보
  - SHA-1 `69:2B:B3:C3:...:F1`
  - SHA-256 `C2:FF:3A:10:...:02:C7`
- `~20:55` 위 지문을 **Firebase(pool-s-day) Android 앱**에 등록 → Android OAuth 클라이언트 자동 생성
- 재빌드 불필요(webClientId로 서버 검증)

### ⑦ 내부 테스트 → 검증
- `19:58` AAB(vc 12) **내부 테스트 트랙 배포** (내부 테스터 3명)
- 실기기 검증 통과: 구글 로그인 ✅ / 지도·풀 데이터(prod) ✅ / 가입·프로필 등록 ✅ / 닉네임 "은호" ✅ / UI 수정분 ✅

### ⑧ 프로덕션 승격 → 심사 제출 ★
- 프로덕션 트랙에 vc 12 추가 + 출시 노트(v1.0.0)
- 국가/지역: **대한민국** 추가
- 앱 액세스: **테스트 계정 불필요** 선언 (핵심 기능 로그인 없이 동작)
- **"검토를 위해 변경사항 전송"** → 프로덕션 출시 / 국가 / 스토어등록정보 / 콘텐츠등급 / 타겟(18+) 일괄 **심사 제출 완료**
- 관리형 게시 OFF → 승인 시 자동 공개

---

## 2026-06-07 — iOS App Store 첫 제출 ★

### iOS 출시 요약
| 항목 | 값 |
|---|---|
| 버전 | **v0.1.0 / build 18** |
| 빌드 | EAS production — `1cc01a0e-8c22-41bf-ab13-1d6801866e53` |
| 출시 국가 | 대한민국 (단일) · **무료(KRW)** |
| 게시 방식 | **자동 출시** → 심사 승인 즉시 App Store 공개 |
| 제출 ID | `f8ca3f30-0e57-4619-b9f3-f59d24956ad8` |
| 제출 | 2026-06-07 00:26 / 김은호 |
| 결과 통보 | cripo2357@gmail.com |

### 선행 작업 (제출 전 같은 날)
- **약관 본문 서버화**(terms 테이블 jsonb, 재빌드 없이 개정) + **iOS 카드/시트 바운스 끌림 정정 9곳** → build 18에 포함
- **build 18** `eas build`(iOS prod) → `eas submit --id 1cc01a0e` → ASC 처리 → TestFlight "제출 준비 완료"
- TestFlight 검증: 앱 구동(네이티브 배치 image-picker·clipboard·apple-auth·google-signin 첫 컴파일 무사)·**소셜로그인 3종(Apple 포함) 실작동**·프로필사진·복사·약관 서버본문·바운스 전부 통과

### 제출 절차
- 가격 및 사용 가능 여부: 특정 지역 → **대한민국** 단일 / 가격 **무료** / **Mac·Vision Pro 사용 가능 체크 해제**(지도·위치 앱 경험 보호)
- 수출 규정: `ITSAppUsesNonExemptEncryption:false` → **자동 면제**(프롬프트 없음)
- 앱 심사 정보: **"로그인 필요" 해제**(데모계정 불필요 — 비회원 열람 + Sign in with Apple) + **심사노트**(영문·국문, 4.8 충족) + 연락처
- 빌드 18 첨부 + 가격 등급 → 빨간 블로커 해소 → **"심사를 위해 제출" → 심사 대기 중(Waiting for Review)**

### Android 제출 시점엔 미완이었으나 iOS 트랙에서 해소된 선행조건
- ✅ Apple Developer 가입(김은호 개인, 활성화)
- ✅ **Sign in with Apple 구현**(`expo-apple-authentication` + `usesAppleSignIn` entitlement + Supabase Apple provider) — **4.8 필수 충족, mock 아님**
- ✅ iOS Google OAuth / Kakao 로그인 작동
- ✅ App Store Connect 등록정보(스크린샷 6.5"·설명·프로모션·개인정보·연령)

---

## 다음 (출시 후)

- [ ] 구글 심사 결과 대기 (첫 앱: 수 시간~며칠) — 메일 통보
- [ ] 승인 시 대한민국 자동 공개 → 대시보드/통계 모니터링
- [ ] 거부 시 사유 확인 후 수정·재제출 (데이터안전 답안: docs/store-meta/D5)
- [ ] (선택) R8/proguard 가독화(mapping) 파일 업로드 — 크래시 분석 개선
- [ ] (향후) 출시 국가 확장 / iOS App Store

관련 기록: [WORKLOG](WORKLOG.md) · [store-meta D1~D6](store-meta/) · 메모리 `launch_submission_status`
