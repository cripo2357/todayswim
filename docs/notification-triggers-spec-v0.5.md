---
version: 0.6.0
lastModified: 2026-05-20
documentType: internal-spec
title: Pool's Day 알림 트리거 상세 스펙
---

# Pool's Day 알림 트리거 상세 스펙 (v0.6)

> 본 문서는 PUSH_POLICY.md(상위 정책)에 따라 23개 알림 트리거의 *발송 조건, 수신자, 본문, 액션, 이미지*를 정의하는 운영 명세서다.

**v0.6 변경 사항**

- 모든 메시지에 제목 필수 정책 — 8개 트리거의 `제목: (없음)`을 구체 제목으로 신설(friend_request_rejected / invite_sent 1-A·1-B / new_feature_announced / pool_submission_approved·rejected / schedule_submission_approved·rejected).
- 기존 제목 4건 다듬기 — friend_request_accepted "새 친구"→"새로운 친구", friend_schedule_overlap "같은 시간 수영"→"같은 수영 일정", schedule_reminder_prev_day "내일 수영 일정 있어요."→"내일 수영 일정", schedule_reminder_1h "1시간 후 수영 시작이에요."→"곧 수영 일정" (모두 명사형·라벨형, 마침표 제거).
- **부정 성격 메시지 아이콘 통일** — friend_request_rejected / invite_received·sent 상태 3·4·5(거절·취소·만료) / pool/schedule_submission_rejected 전부 **[반려] 아이콘** 으로 통일(이미지가 본문의 부정 결과를 일관되게 신호). 이전 매핑(상태별 프로필·[초대] 회색 톤)을 대체.
- **[프로필] 아이콘 = 맵 FAB 로그인 버튼 아이콘과 일치** — nickname_changed_by_admin은 ID 카드형(assets/icons/profile.svg, #1F2937 회색톤). 닉네임 정체성 컨텍스트를 앱 전반 프로필 진입점과 시각 일관화.
- **프로필 사진 테두리 = 트리거 유형별 고정** — 발송 시점의 관계가 카드에 보존됨(런타임 친구목록 조회 X). 예: friend_request_received는 영구적으로 비친구(pd-gray) 테두리 — 그때 비친구였다는 기록. friend_request_accepted/invite_received/friend_schedule_overlap은 친구(pd-mint). 단일 출처 = `src/components/notifications/NotificationsTab.ts` `REL_BY_KIND`.
- **발송 주체 매트릭스 추가** — 22트리거를 운영자(OPERATOR)·시스템(SYSTEM)·사용자(USER) 3분류. 운영자가 직접 발송해야 하는 트리거 = **11개** (시스템 안내 6 + 광고 3 + 약관·닉네임 강제 2). P2 백엔드 작업 시 운영자 콘솔/게시 인터페이스 범위 정의.
- **버튼 액션 정책 신설** — 각 버튼·탭의 동작(이동 대상·상태 변경·확인 모달)을 트리거별로 정의. 광고 3종(이벤트 페이지 미구축) 제외 11트리거 구현. 코드 단일출처: `src/components/notifications/NotificationsTab.tsx` `handleAction`/`handleCardTap`.

**v0.5 변경 사항**

- 완료 프롬프트 푸시 높임 정정 ("완료하셨어요?" → "완료했어요?").
- 일정 시간 표현 통일: 시작 시간만 표시 (종료 시간 없음).
- 변수 누락 폴백 정의 ({pool} 없음 → "[수영장 정보 없음]", {nickname} 탈퇴 → "[탈퇴 회원]").
- 친구 일정 비공개 전환 시 인앱 카드 자동 삭제.
- 친구 신청자 탈퇴 시 신청 카드 자동 삭제, 과거 일정 카드는 [탈퇴 회원]으로 표시 유지.
- {pool} 운영자 변경 시 현재 시점 변수 치환 방식 (DB에 본문 통째 저장 안 함).

**v0.4 변경 사항**

- 초대 카드 5상태 통합 (invite_rejected/canceled/auto_expired 흡수).
- invite_sent [초대 취소] 버튼 추가.
- 이미지 원칙 명시.
- 트리거 26 → 23개.
- welcome 톤 다듬기, 버튼 제거.
- 제목·표현 단순화.

---

## 공통 사양

### 변수 표기 및 폴백

```
{nickname}      상대방 또는 본인 닉네임 (2~6자)
                폴백: 탈퇴 회원이면 "[탈퇴 회원]"
                
{pool}          수영장 이름
                폴백: 삭제된 수영장이면 "[수영장 정보 없음]"
                갱신: 운영자가 풀명 변경 시 현재 시점 이름으로 치환
                
{date}          일정 날짜 (M월 D일 또는 내일/오늘 등 상대 표현)
{time}          일정 시작 시간 (HH:MM)
                ※ 종료 시간은 본문에 표시 안 함 (시작 시간만)
{count}         수치 (N명 / N건 등)
{feature_name}  기능 이름
{version}       앱 버전
```

### 변수 갱신 방식

```
원칙: 본문은 발송 시점 캡쳐 X, 변수 참조 O.
     - notifications 테이블에는 trigger_type + 변수 ID만 저장.
     - 렌더링 시점에 변수를 현재 값으로 치환.
     - 풀명·닉네임이 바뀌면 카드에도 즉시 반영됨.

폴백 처리: 변수 ID에 해당하는 데이터가 없거나 삭제된 경우
     - {pool}: "[수영장 정보 없음]"
     - {nickname}: "[탈퇴 회원]"
```

### 액션 패턴

```
A: 0버튼 (탭 시 관련 화면 이동)
B: 1버튼 (이동 강조 또는 액션)
C: 2버튼 응답형 (수락/거절, 완료/미완료 등)
E: 이력 표시 (액션 없음, 회색 표시)
```

### 우선순위

```
P0: 법정 의무·보안 (끌 수 없음)
P1: 핵심 상호작용 (기본 ON)
P2: 중요 이벤트 (기본 ON)
P3: 부가 알림 (기본 ON, 사용자가 자주 끔)
```

### 카피 작성 규칙

```
[제목]   라벨 형태, 본문과 중복 금지, 마침표 없음
         예) "친구 신청" / "새 친구" / "초대 취소" / "약관 변경 안내"

[본문]   종결어미("~어요", "~네요", "~입니다") → 마침표
         명사로 끝남 → 마침표 없음
         예) "강두형님이 친구를 신청했어요." (어미 → 점)
         예) "강남 스포츠센터 19:00" (명사 → 점 없음)

[버튼]   짧게, 마침표 없음
         예) "수락", "거절", "보기", "초대 취소"

[순서]   장소 → 날짜 → 시간
         예) "강남 스포츠센터 26.05.28(목) 오후 7:00"

[날짜·시각] 앱 전역 단일 포맷(v0.6) — `@/lib/dateFormat` 위임 의무.
         풀:    YY.MM.DD(요일) 오전/오후 H:MM   예) 26.05.20(수) 오후 1:00
         날짜만: YY.MM.DD(요일)                  예) 26.05.20(수)
         시간만: 오전/오후 H:MM                   예) 오후 1:00
         · 시(hour)만 1~2자리 가변(1·12 모두 자연수). 연·월·일·분은 2자리.
         · 직접 포맷팅 금지(반복 정의 회귀 방지) — 알림·캘린더·시간표·일정·
           목록 카드 등 어디서든 본 모듈만 호출.
         · 법정 발효일·약관 본문 등 법률 텍스트는 예외 — "YYYY년 M월 D일" 유지.

[용어]   풀 → 수영장 사용
         헤엄 → 수영 사용
         일정 → 수영 일정 (앱 맥락 명시 시)
         곳 → 가능하면 수영장
         이번 달 (띄어쓰기, "이달" 사용 안 함)

[높임]   과한 존대 제거
         "~하셨어요" → "~했어요"
         "~하실 수 있어요" → "~할 수 있어요"

[이미지] 상대의 행동이 트리거인 경우 → 상대 프로필 사진
         본인 행동 이력 / 시스템 처리 / 2명 이상 발송 → 아이콘

[기타]   이모지 사용 금지
         정서 표현·부사 군더더기 제거
         의문문 ?, 감탄 ! 허용 (남용 금지)
         메시지 자체가 결과/리포트면 버튼 없음
```

### 카드 삭제·유지 정책

```
자동 삭제 케이스:
  - 친구가 공개 일정을 *비공개로 전환* → 관련 friend_schedule_overlap 카드 삭제
  - 신청자가 탈퇴 → 미응답 친구 신청 카드 자동 삭제
  - 일정 자체가 삭제됨 → 관련 초대·리마인더 카드 비활성화 + "삭제된 일정"

[탈퇴 회원] 표시 유지 케이스:
  - 이미 친구인 상태에서 탈퇴 → 과거 일정 초대·수락 카드 유지
  - 단, {nickname}은 "[탈퇴 회원]"으로 표시
```

---

# 유형 1. 사람 발신 (6개 트리거)

## 1. friend_request_received

```yaml
유형:       1. 사람 발신
우선순위:   P1
채널:       인앱 + 푸시
발송 시점:  친구 신청 수신 시 즉시
수신자:     신청 받은 사람
이미지:     신청자 프로필 사진 (상대 행동)
액션 패턴:  C (2버튼 응답형)

제목:       친구 신청
본문:       {nickname}님이 친구를 신청했어요.
푸시:       {nickname}님이 친구를 신청했어요.

변수:
  - {nickname}: 신청자 닉네임

액션:
  버튼1:    거절
  버튼2:    수락  (강조)

후처리:
  수락 시:  friend_request_accepted 트리거 발생 (양측).
            카드 → "친구가 됐어요" 회색 처리.
  거절 시:  friend_request_rejected 트리거 (본인 이력).
            신청자에게는 무알림.

만료 처리:  신청자가 신청 취소 → 카드 비활성화.
            신청자가 탈퇴 → 카드 자동 삭제.
끌 수 있음: 가능 (친구 관련 토글).
```

## 2. friend_request_accepted

```yaml
유형:       1. 사람 발신
우선순위:   P1
채널:       인앱 + 푸시
발송 시점:  친구 신청 수락 직후
수신자:     신청자 + 수락자 (양측)
이미지:     상대방 프로필 사진 (상대 행동)
액션 패턴:  A (0버튼, 탭 시 친구 프로필 이동)

제목:       새로운 친구
본문:       {nickname}님과 친구가 됐어요.
푸시:       {nickname}님과 친구가 됐어요.

변수:
  - {nickname}: 상대방 닉네임 (탈퇴 시 "[탈퇴 회원]")

탭 동작:    상대방 프로필 화면 이동.

끌 수 있음: 가능.
```

## 3. friend_request_rejected

```yaml
유형:       1. 사람 발신
우선순위:   P3
채널:       인앱만 (푸시 없음)
발송 시점:  거절 액션 직후
수신자:     거절한 본인만
이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
액션 패턴:  E (이력 표시)

제목:       친구 신청 거절
본문:       {nickname}님의 친구 신청을 거절했어요.

변수:
  - {nickname}: 신청했던 사람 닉네임 (탈퇴 시 "[탈퇴 회원]")

후처리:     상대방에게 무알림 (관계 마찰 방지).
끌 수 있음: 가능.
```

## 4. invite_received (5상태 자동 갱신)

```yaml
유형:       1. 사람 발신
우선순위:   P1
채널:       인앱 + 푸시
발송 시점:  일정 초대 수신 시 즉시
수신자:     초대받은 사람

상태별 정의:

  상태 1 (받은 직후):
    이미지:     초대자 프로필 (상대 행동)
    액션 패턴:  C (2버튼)
    제목:       수영 일정 초대
    본문:       {pool} {date} {time}
                {nickname}님이 초대했어요.
    푸시:       {nickname}님의 수영 일정 초대 — {date} {pool}.
    액션:
      버튼1:    거절
      버튼2:    수락  (강조)

  상태 2 (본인이 수락):
    이미지:     [초대] 아이콘 (본인 행동)
    액션 패턴:  B (1버튼)
    제목:       초대 수락
    본문:       {nickname}님과 {date} 수영 일정에 함께해요.
    액션:
      버튼1:    일정 보기

  상태 3 (본인이 거절, 회색):
    이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
    액션 패턴:  E (이력)
    제목:       초대 거절
    본문:       {nickname}님의 {date} 수영 일정 초대를 거절했어요.

  상태 4 (보낸 사람이 취소, 회색):
    이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
    액션 패턴:  E (이력)
    제목:       초대 취소
    본문:       {nickname}님이 {date} 수영 일정 초대를 취소했어요.
    푸시:       {nickname}님이 {date} 수영 일정 초대를 취소했어요.

  상태 5 (72시간 자동 만료, 회색):
    이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
    액션 패턴:  E (이력)
    제목:       초대 만료
    본문:       {nickname}님의 {date} 수영 일정 초대를 놓쳤어요.
    푸시:       {nickname}님의 {date} 수영 일정 초대를 놓쳤어요.

변수:
  - {nickname}: 초대자 닉네임 (탈퇴 시 "[탈퇴 회원]")
  - {date}:     예) "5월 28일(수)"
  - {time}:     예) "19:00" (시작 시간만)
  - {pool}:     수영장 이름 (삭제 시 "[수영장 정보 없음]")

구현 메모:   상태 전이는 invite_id 기반으로 카드 갱신.
             상태 4·5는 별도 푸시 발송, 상태 2·3은 푸시 없음.
             일정 자체가 삭제되면 카드 비활성화 + "삭제된 일정".

끌 수 있음:  가능 (친구 관련 토글).
```

## 5. invite_sent (5상태 자동 갱신)

```yaml
유형:       1. 사람 발신
우선순위:   P3 (본인 이력)
채널:       인앱만 (푸시 없음)
발송 시점:  초대 전송 직후
수신자:     보낸 본인만

상태별 정의:

  상태 1-A (보낸 직후, 1명):
    이미지:     [초대] 아이콘 (본인 행동)
    액션 패턴:  B (1버튼 [초대 취소])
    제목:       수영 일정 초대
    본문:       {nickname}님에게 수영 일정 초대를 보냈어요.
                {pool} {date} {time}
    액션:
      버튼1:    초대 취소

  상태 1-B (보낸 직후, 2명 이상):
    이미지:     [초대] 아이콘 (다수 발송)
    액션 패턴:  B (1버튼 [초대 취소])
    제목:       수영 일정 초대({count}명)
    본문:       {count}명에게 수영 일정 초대를 보냈어요.
                {pool} {date} {time}
    액션:
      버튼1:    초대 취소

  상태 2 (상대가 수락):
    이미지:     상대 프로필 (상대 행동)
    액션 패턴:  B (1버튼)
    제목:       초대 수락
    본문:       {nickname}님이 {date} 수영 일정에 함께해요.
    액션:
      버튼1:    일정 보기

  상태 3 (상대가 거절, 회색):
    이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
    액션 패턴:  E (이력)
    제목:       초대 거절
    본문:       {nickname}님이 {date} 수영 일정 초대를 거절했어요.

  상태 4 (72시간 자동 만료, 회색):
    이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
    액션 패턴:  E (이력)
    제목:       초대 만료
    본문:       {nickname}님이 {date} 수영 일정 초대에 응답하지 않았어요.
    푸시:       {nickname}님이 {date} 수영 일정 초대에 응답하지 않았어요.

  상태 5 (본인이 취소, 회색):
    이미지:     [반려] 아이콘 (v0.6 부정 성격 통일)
    액션 패턴:  E (이력)
    제목:       초대 취소
    본문:       {nickname}님에게 보낸 {date} 수영 일정 초대를 취소했어요.

변수:
  - {nickname}: 단독 수신자 (1명) 또는 첫 수신자 (탈퇴 시 "[탈퇴 회원]")
  - {count}:    수신자 총 인원 (2명 이상일 때)
  - {date}:     일정 날짜
  - {time}:     일정 시작 시간 (HH:MM)
  - {pool}:     수영장 이름 (삭제 시 "[수영장 정보 없음]")

UI 제약:    카드 이미지 영역은 1개 슬롯. 다수 프로필 동시 표시 불가.
            상태 1-B (2명 이상)는 [초대] 아이콘 사용.

[초대 취소] 액션 동작:
  - 확인 모달: "초대를 취소할까요?"
  - 확인 시: invite_canceled 이벤트 발생
            - 본인 카드 → 상태 5 (취소됨, 회색)
            - 받은 사람 카드 → 상태 4 (취소, 회색)
            - 받은 사람에게 푸시 발송
  - 취소 시: 모달만 닫힘.

끌 수 있음: 가능.
```

## 6. friend_schedule_overlap

```yaml
유형:       1. 사람 발신
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:
  케이스 A: 내가 일정 등록 직후 + 같은 수영장+시간에 친구 일정 이미 존재
            → 즉시 발송
  케이스 B: 친구가 일정 등록 + 내 일정과 같은 수영장+시간 겹침
            → 친구의 일정 공개범위가 "친구에게만" 또는 "전체공개"일 때만

수신자:     같은 수영장+시간에 일정이 있는 회원
이미지:     상대방 프로필 사진 (상대 행동)
액션 패턴:  B (1버튼)

제목:       같은 수영 일정
본문:       {pool} {date} {time}
            {nickname}님도 수영 일정이 있어요.
푸시:       {pool} {date} {time}에 {nickname}님도 수영 일정이 있어요.

변수:
  - {nickname}: 겹치는 친구 닉네임 (탈퇴 시 "[탈퇴 회원]")
  - {date}:     일정 날짜
  - {time}:     일정 시작 시간
  - {pool}:     수영장 이름 (삭제 시 "[수영장 정보 없음]")

액션:
  버튼1:    일정 보기

겹침 정의:  같은 pool_id + 시간 범위 30분 이상 겹침.
중복 방지:  같은 (내 일정, 친구 일정) 조합으로 24시간 내 1회만.

자동 삭제:  친구가 해당 일정을 비공개로 전환 → 카드 자동 삭제.
            친구가 일정 자체를 삭제 → 카드 자동 삭제.

끌 수 있음: 가능 (친구 관련 토글).
```

---

# 유형 2. 시스템 안내 (6개)

## 7. new_feature_announced

```yaml
유형:       2. 시스템 안내
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:  운영자가 announcements 테이블에 type=new_feature 등록 시
수신자:     전체 회원
이미지:     [신기능] 아이콘 (회색 톤 원형)
액션 패턴:  B (1버튼)

제목:       신규 기능
본문:       {feature_name} 기능이 추가됐어요.

변수:
  - {feature_name}: 기능 이름

액션:
  버튼1:    보기

끌 수 있음: 가능 (시스템 안내 토글).
```

## 8. app_version_updated

```yaml
유형:       2. 시스템 안내
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:  운영자가 announcements 테이블에 type=feature_update 등록 시
수신자:     전체 회원
이미지:     [업데이트] 아이콘 (회색 톤 원형, 위쪽 화살표 형태)
액션 패턴:  A (0버튼, 본문에 불릿 리스트로 변경사항 표시)

제목:       v{version} 업데이트
본문:       {feature_name} 기능이 개선됐어요.

            • {bullet_1}
            • {bullet_2}

변수:
  - {version}:      예) "1.2"
  - {feature_name}: 핵심 변경 영역
  - {bullets[]}:    세부 변경사항

끌 수 있음: 가능.
```

## 9. pool_submission_approved

```yaml
유형:       2. 시스템 안내
우선순위:   P2
채널:       인앱 + 푸시
발송 시점:  운영자가 pool_submissions.status = approved 처리 시
수신자:     제보한 회원
이미지:     [승인] 아이콘 (브랜드 컬러, 체크 형태)
액션 패턴:  B (1버튼)

제목:       수영장 추가 승인
본문:       {pool_name}이 추가됐어요.

변수:
  - {pool_name}: 제보한 수영장 이름 (삭제 시 "[수영장 정보 없음]")

액션:
  버튼1:    보기

끌 수 있음: 가능 (제보 처리 토글).
```

## 10. pool_submission_rejected

```yaml
유형:       2. 시스템 안내
우선순위:   P2
채널:       인앱 + 푸시
발송 시점:  운영자가 pool_submissions.status = rejected 처리 시
수신자:     제보한 회원
이미지:     [반려] 아이콘 (회색 톤, X 형태)
액션 패턴:  A (0버튼)

제목:       수영장 추가 거절
본문:       {pool_name} 제보가 반영되지 않았어요.

변수:
  - {pool_name}: 제보한 수영장 이름

끌 수 있음: 가능.
```

## 11. schedule_submission_approved

```yaml
유형:       2. 시스템 안내
우선순위:   P2
채널:       인앱 + 푸시
발송 시점:  운영자가 schedule_submissions.status = approved 처리 시
수신자:     제보한 회원
이미지:     [시간표] 아이콘 (물결 형태)
액션 패턴:  B (1버튼)

제목:       시간표 수정 승인
본문:       {pool_name} 시간표 제보가 등록됐어요.

변수:
  - {pool_name}: 시간표를 제보한 수영장 이름

액션:
  버튼1:    보기

끌 수 있음: 가능.
```

## 12. schedule_submission_rejected

```yaml
유형:       2. 시스템 안내
우선순위:   P2
채널:       인앱 + 푸시
발송 시점:  운영자가 schedule_submissions.status = rejected 처리 시
수신자:     제보한 회원
이미지:     [반려] 아이콘 (회색 톤, X 형태)
액션 패턴:  A (0버튼)

제목:       시간표 수정 거절
본문:       {pool_name} 시간표 제보가 반영되지 않았어요.

끌 수 있음: 가능.
```

---

# 유형 3. 운영자 발 이벤트 (3개)

> 사용자 1000명 도달 후 발송 시작. 발송 전 마케팅 동의서 §2의 사전 안내 의무 이행.
> 발송 시간: 08:00 ~ 20:30 (정통망법 §50 야간 발송 금지).
> 본문 또는 제목 앞에 **(광고)** 명시 의무 (정통망법 §50의5).

## 13. marketing_event

```yaml
유형:       3. 운영자 발 이벤트
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:  운영자가 announcements 테이블에 type=event 등록 + 마케팅 발송 옵션 ON
수신자:     마케팅 동의자
이미지:     [이벤트] 아이콘 또는 캠페인별 커스텀 이미지
액션 패턴:  B (1버튼)

제목:       (광고) {event_name}
본문:       {event_description}

변수:
  - {event_name}:        이벤트 명
  - {event_description}: 이벤트 설명

액션:
  버튼1:    참여

끌 수 있음: 가능 (마케팅 동의 철회 시 즉시 중단).
빈도 제한:  주 2회 이내 / 일일 1건.
시간대:     08:00 ~ 20:30.
```

## 14. marketing_partnership

```yaml
유형:       3. 운영자 발 이벤트
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:  운영자 수동 발송
수신자:     마케팅 동의자
이미지:     [이벤트] 아이콘 또는 제휴사 로고
액션 패턴:  B (1버튼)

제목:       (광고) {partner_name}와 함께해요
본문:       {partnership_description}

변수:
  - {partner_name}:           제휴사 이름
  - {partnership_description}: 제휴 안내

액션:
  버튼1:    보기

끌 수 있음: 가능.
빈도 제한:  주 1회 이내.
시간대:     08:00 ~ 20:30.
```

## 15. marketing_recommendation

```yaml
유형:       3. 운영자 발 이벤트
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:  운영자 수동 발송 (개인화 추천)
수신자:     마케팅 동의자
이미지:     [이벤트] 아이콘
액션 패턴:  B (1버튼)

제목:       (광고) {recommendation_title}
본문:       {recommendation_description}

변수:
  - {recommendation_title}:       추천 제목
  - {recommendation_description}: 추천 설명

액션:
  버튼1:    보기

끌 수 있음: 가능.
빈도 제한:  주 2회 이내.
시간대:     08:00 ~ 20:30.
```

---

# 유형 4. 자동·필수 알림 (4개)

## 16. schedule_reminder_prev_day

```yaml
유형:       4. 자동·필수 알림
우선순위:   P2
채널:       인앱 + 푸시
발송 시점:  일정 전날 20:00
수신자:     일정 등록자 + 참여자 (수락한 친구)
이미지:     [리마인더] 아이콘 (시계 또는 수영 형태)
액션 패턴:  A (0버튼, 탭 시 일정 상세)

제목:       내일 수영 일정
본문:       {pool} {time}
푸시:       내일 {time} {pool} 수영.

변수:
  - {time}: 시작 시간 (HH:MM)
  - {pool}: 수영장 이름 (삭제 시 "[수영장 정보 없음]")

구현 메모:  매 5분마다 크론으로 "내일 일정 + 발송 미완료" 스캔.
끌 수 있음: 가능 (일정 리마인더 토글).
```

## 17. schedule_reminder_1h

```yaml
유형:       4. 자동·필수 알림
우선순위:   P2
채널:       푸시만 (인앱 적재는 함)
발송 시점:  일정 1시간 전
수신자:     일정 등록자 + 참여자
이미지:     [리마인더] 아이콘 (시계 형태)
액션 패턴:  A (0버튼)

제목:       곧 수영 일정
본문:       {pool}
푸시:       1시간 후 {pool} 수영 시작.

변수:
  - {pool}: 수영장 이름 (삭제 시 "[수영장 정보 없음]")

구현 메모:  매 5분마다 크론으로 "1시간 후 일정 + 발송 미완료" 스캔.
            06:00 이전 시간 일정도 그대로 발송 (사용자 본인 등록 일정).
끌 수 있음: 가능 (기본 OFF — 너무 임박해서 피곤할 수 있음).
```

## 18. terms_updated

```yaml
유형:       4. 자동·필수 알림 (법정 의무)
우선순위:   P0 — 끌 수 없음
채널:       인앱 + 푸시 + (필요시 이메일)
발송 시점:  운영자가 약관 개정 후 시행 7일 전 (불리한 변경은 30일 전)
수신자:     전체 회원
이미지:     [약관] 아이콘 (문서 형태)
액션 패턴:  B (1버튼)

제목:       약관 변경 안내
본문:       {effective_date}부터 적용됩니다.

변수:
  - {effective_date}: 시행일 (예: "2026년 6월 5일")

액션:
  버튼1:    약관 보기

끌 수 있음: 불가능 (법정 의무).
시간대:     주간 우선 (08:00~21:00), 야간 발송 시 인앱만.
```

## 19. nickname_changed_by_admin

```yaml
유형:       4. 자동·필수 알림
우선순위:   P0 — 끌 수 없음
채널:       인앱 + 푸시
발송 시점:  운영자가 nickname_blocklist 위반 등으로 닉네임 강제 변경 시
수신자:     해당 회원
이미지:     [프로필] 아이콘 (ID 카드 형태 — 맵 FAB 로그인 버튼과 동일, v0.6)
액션 패턴:  A (0버튼, 탭 시 프로필 화면)

제목:       닉네임 변경 안내
본문:       "{new_nickname}"으로 변경됐어요.
            사유: {reason}
            프로필에서 다시 변경할 수 있어요.

변수:
  - {new_nickname}: 새로 부여된 닉네임
  - {reason}:       사유 (금칙어 / 부적절한 표현 등)

끌 수 있음: 불가능 (사용자 권리 보장).
시간대:     주간만.
```

---

# 유형 5. 환영·축하 (3개)

## 20. welcome

```yaml
유형:       5. 환영·축하
우선순위:   P2
채널:       인앱 + 푸시
발송 시점:  Welcome 화면 종료 후 5분 뒤
수신자:     신규 회원
이미지:     [환영] 아이콘 (브랜드 컬러 배경)
액션 패턴:  A (0버튼, 탭 시 메인 지도 이동)

제목:       반가워요
본문:       Pool's Day에 오신 걸 환영해요.
            가까운 수영장부터 둘러봐요.

끌 수 있음: 가능 (1회성이라 실질 의미는 없음).
```

## 21. monthly_summary (8가지 변형)

```yaml
유형:       5. 환영·축하
우선순위:   P3
채널:       인앱 + 푸시
발송 시점:  매월 1일 09:00
수신자:     모든 회원 (변형 idle 포함)
이미지:     [리포트] 아이콘
액션 패턴:  변형 1~7: A (0버튼)
            변형 8 idle: B (1버튼)

선택 알고리즘:
  사용자별 전월 데이터를 분석해 아래 우선순위로 매칭되는
  첫 번째 변형을 선택한다.
  
  1. first_month     가입 후 첫 리포트
  2. best_day        90분 이상 수영한 날이 1번 이상
  3. new_pools       신규 방문 수영장 2곳 이상
  4. with_friends    친구 동행 일정이 50% 이상 (MVP 비활성)
  5. total_hours     누적 수영 10시간 이상
  6. pattern         같은 요일·시간대 3회 이상
  7. frequency       완료 일정 1건 이상
  8. idle            완료 일정 0건

변형별 카피:

  first_month:
    제목: Pool's Day 첫 달 리포트
    본문: {month} 첫 수영, {count}번 다녀왔어요.

  best_day:
    제목: {month} Pool's Day 리포트
    본문: {best_date}, {best_minutes}분 수영했어요.
          이번 달 장시간 수영

  new_pools:
    제목: {month} Pool's Day 리포트
    본문: 새 수영장 {new_pool_count}곳에 다녀왔어요.

  with_friends:
    제목: {month} Pool's Day 리포트
    본문: {month}의 {percent}%는 친구와 수영했어요.

  total_hours:
    제목: {month} Pool's Day 리포트
    본문: {month}에 {total_hours}시간 수영했어요.

  pattern:
    제목: {month} Pool's Day 리포트
    본문: {weekday} {time_period}마다 수영했네요.

  frequency:
    제목: {month} Pool's Day 리포트
    본문: {month}에 {count}번 다녀왔어요.
          자주 간 수영장: {favorite_pool}

  idle:
    제목: {month} Pool's Day 리포트
    본문: {month}엔 한 번도 못 만났네요.
          가까운 수영장이 기다리고 있어요.
    
    버튼: 근처 수영장 보기

변수:
  - {month}:           예) "5월"
  - {count}:           완료 일정 수
  - {best_date}:       예) "5월 18일"
  - {best_minutes}:    예) "90"
  - {new_pool_count}:  신규 방문 수영장 수
  - {percent}:         친구 동행 비율
  - {total_hours}:     누적 수영 시간
  - {weekday}:         예) "화요일"
  - {time_period}:     아침/낮/저녁/밤
  - {favorite_pool}:   최다 방문 수영장 (삭제 시 "[수영장 정보 없음]")

끌 수 있음: 가능.
```

## 22. schedule_completion_prompt

```yaml
유형:       5. 환영·축하 (검토 필요)
우선순위:   P3
채널:       푸시만 (인앱은 일정 카드 자체에 "완료 체크" UI 있음)
발송 시점:  일정 종료 시각 + 1시간 후
수신자:     일정 등록자
이미지:     [수영] 아이콘
액션 패턴:  C (2버튼 — 완료/미완료)

제목:       오늘 수영 어땠어요?
본문:       {pool}
푸시:       오늘 {pool} 수영 완료했어요?

변수:
  - {pool}: 수영장 이름 (삭제 시 "[수영장 정보 없음]")

액션:
  버튼1:    못 갔어요
  버튼2:    완료  (강조)

후처리:
  완료 시:    useSwimSchedules.setCompleted(scheduleId, true).
              카드 → "수영 완료" 회색 처리.
  미완료 시:  useSwimSchedules.setCompleted(scheduleId, false).
              카드 → "이번엔 못 갔어요" 회색 처리.

구현 메모:  매 15분마다 크론으로 "종료 시각 + 1시간 도래 + 미응답" 스캔.
            한 일정당 1회만 발송 (재발송 안 함).
끌 수 있음: 가능 (자주 다니는 사용자는 끄고 싶어할 수 있음).
```

---

# 종합 매트릭스

## 트리거 개수

```
유형 1. 사람 발신          6개
유형 2. 시스템 안내        6개
유형 3. 운영자 발          3개
유형 4. 자동·필수          4개
유형 5. 환영·축하          3개
─────────────────────────────
총                         22개 트리거
+ monthly_summary 변형 8개 (한 트리거 내 분기)
+ invite_received·sent 5상태 각각 (카드 갱신)
```

## 우선순위 요약

```
P0 (끌 수 없음):  2개 — terms_updated, nickname_changed_by_admin.
P1 (핵심):         4개 — friend_request_received/accepted, invite_received, invite_sent.
P2 (중요):         6개 — pool/schedule_submission ×4, welcome, reminders ×2.
P3 (부가):       10개 — 그 외.
```

## 액션 패턴 요약

```
패턴 A (0버튼):   accepted/timeline, system info, monthly_summary 1~7, welcome 등.
패턴 B (1버튼):   시스템 안내·이벤트·환영·monthly idle 등.
패턴 C (2버튼):   friend_request_received, invite_received 상태1, schedule_completion_prompt.
패턴 E (이력):    friend_request_rejected + 초대 카드 회색 상태들.
```

## 이미지 매핑

```
🅿 = 상대방 프로필 사진
🅘 = 아이콘

상대 행동 트리거(긍정·중립) → 프로필:
  - friend_request_received (상대 신청)
  - friend_request_accepted (상대 수락)
  - invite_received 상태 1 (상대 초대)
  - invite_sent 상태 2 (상대 수락)
  - friend_schedule_overlap (상대 일정 등록)

부정 성격(거절·취소·만료) → [반려] 아이콘 통일 (v0.6 정책):
  - friend_request_rejected (본인 거절 이력)
  - invite_received 상태 3·4·5 (본인 거절 / 상대 취소 / 시스템 만료)
  - invite_sent 상태 3·4·5 (상대 거절 / 시스템 만료 / 본인 취소)
  - pool_submission_rejected
  - schedule_submission_rejected

본인 행동 / 다수 / 시스템 안내 → 명명 아이콘:
  - invite_received 상태 2 (본인 수락) [초대]
  - invite_sent 상태 1-A·1-B (본인 발송) [초대]
  - 시스템 안내·운영자 발·자동 알림·환영·결산 모두 명명 아이콘
    ([신기능]/[업데이트]/[승인]/[시간표]/[리마인더]/[약관]/[프로필]/[환영]/[이벤트]/[리포트])

[프로필] 아이콘 (nickname_changed_by_admin): 맵 FAB 로그인 버튼과 동일한
ID 카드형(assets/icons/profile.svg, #1F2937) — 닉네임 정체성 컨텍스트를
앱 전반 프로필 진입점과 시각 일관화 (v0.6).

프로필 사진 테두리 (트리거 유형별 고정 — 발송 시점 관계 보존, v0.6):

  friend_request_received    → pd-gray  (비친구 — 신청자, 아직 친구 아님)
  friend_request_accepted    → pd-mint  (친구 — 방금 친구 됨)
  invite_received 상태 1     → pd-mint  (친구 — 이미 친구라 초대받음)
  invite_sent 상태 2         → pd-mint  (친구 — 상대 수락)
  friend_schedule_overlap    → pd-mint  (친구 — 친구 일정 겹침)

런타임 친구목록 조회 X — 트리거 자체가 그 시점의 관계를 함축하므로
이후 관계가 바뀌어도 카드는 그때의 관계를 보존한다(예: 친구였다가
탈퇴/차단된 사람의 과거 카드는 mint 테두리 유지). 코드 단일 출처:
src/components/notifications/NotificationsTab.tsx `REL_BY_KIND`.
```

## 발송 주체

각 트리거의 발송 주체를 3가지로 분류한다 — 운영자가 직접 관여해야
발송되는 것 / 시스템이 자동 발송 / 사용자 행동에 시스템이 반응.
P2 백엔드 작업 시 운영자 콘솔 인터페이스 구축 범위 = 운영자 11종.

```
운영자 (OPERATOR) — 운영자 액션이 트리거 (11개):

  new_feature_announced          announcements 테이블 등록
  app_version_updated            announcements 테이블 등록
  pool_submission_approved       pool_submissions.status = approved
  pool_submission_rejected       pool_submissions.status = rejected
  schedule_submission_approved   schedule_submissions.status = approved
  schedule_submission_rejected   schedule_submissions.status = rejected
  marketing_event                announcements + 마케팅 발송 옵션 ON
  marketing_partnership          운영자 수동 발송
  marketing_recommendation       운영자 수동 발송 (개인화 추천)
  terms_updated                  약관 개정 게시
  nickname_changed_by_admin      운영자 닉네임 강제 변경 액션

시스템 (SYSTEM) — 크론/타이머/이벤트 (5개):

  schedule_reminder_prev_day     cron: 일정 전날 20:00
  schedule_reminder_1h           cron: 일정 1시간 전
  welcome                        Welcome 화면 종료 후 5분
  monthly_summary                cron: 매월 1일 09:00
  schedule_completion_prompt     cron: 일정 종료 + 1시간

사용자 (USER) — 사용자 행동에 시스템이 반응 (6개):

  friend_request_received        다른 사용자가 친구 신청
  friend_request_accepted        다른 사용자가 수락
  friend_request_rejected        본인이 거절
  invite_received                다른 사용자가 초대
  invite_sent                    본인이 초대 발송
  friend_schedule_overlap        친구가 일정 등록 → 겹침 감지
```

운영자 11종은 모두 P2 백엔드에서 콘솔/SQL/이메일 등 운영자 인터페이스가
필요하다(자동 디스패치는 운영자 액션을 트리거로 받아 본문 템플릿 렌더만).
시스템·사용자 11종은 자동 디스패치 — 크론 잡과 이벤트 핸들러로 구현.

## 버튼 액션 정책

각 액션 버튼·카드 탭의 동작(이동 대상·상태 변경·확인 모달)을 트리거
별로 정의. 카피 규칙(§카피 작성 규칙 [버튼])과 함께 단일 출처.
코드 구현: `src/components/notifications/NotificationsTab.tsx`
`handleAction(kind, label)` / `handleCardTap(kind)`.

### 응답형 액션 (패턴 C — 2버튼)

| 트리거 | 버튼 | 동작 |
|---|---|---|
| friend_request_received | 거절 | dispatch friend_request_rejected (본인 이력). 상대 무알림. |
|  | 수락 (강조) | 친구 관계 추가 + dispatch friend_request_accepted (양측). |
| invite_received 상태 1 | 거절 | dispatch invite_rejected. 발신자에게 알림. |
|  | 수락 (강조) | 일정 참여자로 등록 + dispatch invite_accepted (양측). |

### 이동·실행 액션 (패턴 B — 1버튼)

| 트리거 | 버튼 | 동작 |
|---|---|---|
| invite_accepted | 일정 보기 | ScheduleView (일정 id) 이동. |
| invite_sent 상태 1-A/1-B | 초대 취소 | 확인 모달 "초대를 취소할까요?" → 확인 시 dispatch invite_canceled. |
| friend_schedule_overlap | 일정 보기 | ScheduleView 이동. |
| new_feature_announced | 보기 | 해당 기능 페이지/공지 상세 (없으면 MapMain). |
| pool_submission_approved | 보기 | 추가된 수영장 상세(PoolDetail) 이동. |
| schedule_submission_approved | 보기 | 해당 수영장 시간표 이동. |
| terms_updated | 약관 보기 | TermsDetail 이동 (termsKey: 개정 약관). |
| monthly_summary (idle) | 근처 수영장 보기 | MapMain 이동. |

### 탭 동작 (패턴 A — 0버튼, 카드 전체 탭)

| 트리거 | 카드 탭 시 |
|---|---|
| friend_request_accepted | OtherUserProfile 이동. |
| schedule_reminder_prev_day | 해당 일정 상세(ScheduleView) 이동. |
| schedule_reminder_1h | 해당 일정 상세 이동. |
| nickname_changed_by_admin | MyInfo (프로필 탭) 이동. |
| welcome | MapMain 이동. |
| monthly_summary (idle 외) | (탭 대상 미정 — P2 결산 상세 마련 시 연결). |
| app_version_updated | (탭 없음 — 카드 본문이 결과 자체). |
| pool/schedule_submission_rejected | (탭 없음 — 결과 카드). |

### 이력 표시 (패턴 E — 0버튼·탭 없음)

| 트리거 | 표시 |
|---|---|
| friend_request_rejected | 회색 카드. 인터랙션 없음. |
| invite_rejected | 회색 카드. 인터랙션 없음. |
| invite_canceled | 회색 카드. 인터랙션 없음. |
| invite_auto_expired | 회색 카드. 인터랙션 없음. |

### 광고 (marketing × 3) — Phase 2 대기

광고 트리거(`marketing_event` / `marketing_partnership` /
`marketing_recommendation`)의 '참여'·'보기' 버튼은 **이벤트 페이지
인프라가 P2에서 구축된 이후** 정의. v0.6 시점에 동작 미정 — 코드는
no-op(클릭 무반응).

### 샘플 갤러리 구현 메모 (P1)

샘플 갤러리(NotificationsTab)는 mock 데이터라 상태 변경 액션(수락·
거절·초대 취소)은 실 상태를 바꾸지 않고 **Alert 피드백**으로 동작을
설명한다(예: "친구 추가됨 — 실 운영 시 친구 추가 + 양측 알림 발송").
이동 액션은 navigation 실행. P2에서 실 notifications 적재 → 데이터
교체 시 handleAction의 Alert 분기를 실 mutation/dispatch로 교체.

## 변수 폴백 매트릭스

```
{nickname} 탈퇴 회원         → "[탈퇴 회원]"
{pool} 삭제된 수영장         → "[수영장 정보 없음]"
{pool_name} 삭제된 수영장    → "[수영장 정보 없음]"
{favorite_pool} 삭제된 수영장 → "[수영장 정보 없음]"
```

## 카드 자동 처리 매트릭스

```
[삭제]
  - 친구 일정 비공개 전환     → friend_schedule_overlap 카드 삭제
  - 친구 일정 삭제            → friend_schedule_overlap 카드 삭제
  - 신청자 탈퇴 (미응답)      → friend_request_received 카드 삭제

[비활성화 + "삭제된 일정"]
  - 일정 자체 삭제           → invite_received, schedule_reminder 카드

[표시 유지, [탈퇴 회원] 치환]
  - 이미 친구인 사람 탈퇴    → 과거 알림 카드 모두 유지
```

---

# 잔여 작업

## 설정 화면 알림 토글 (별도 작업)

- 트리거 그룹화 (친구 / 시스템 / 마케팅 / 리마인더 / 기타)
- 끌 수 없는 P0 시각 표시
- 방해 금지 시간 설정
- 마케팅 동의 토글 연동
