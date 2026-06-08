# App Store 심사 반려 대응 — 0.1.1 (build 25)

반려일: 2026-06-07 / Submission ID: 12f95f21-f30b-4c23-a9e9-271f6b2fc68f
사유: Guideline 2.1 (example 사용자 부족) + Guideline 2.3.6 (연령등급 UGC 미표기)

---

## 라운드 2 (2026-06-08 재심사 후 추가 질문)

연령등급(2.3.6)은 **통과**(메시지에서 사라짐). 남은 건 2.1 정보요청 1건:
> "How do users invite friends?"

→ 코드/빌드/마이그레이션 무관, **Resolution Center 회신만**. 아래 [라운드2 회신문] 붙여넣고 재제출.

우리 앱 친구 흐름 = ①친구 추가(닉네임/ID 검색 → 초대장 보내기 → 수락) ②일정 초대(확정 일정에 친구 초대). 외부 초대 링크는 없음(기존 사용자끼리 검색 연결).

### [라운드2 회신문]

```
Hello, and thank you for the question.

In Pool's day, "friends" are other people who already use the app. Users connect with them entirely inside the app — there is no external invite or referral link. There are two related flows:

1) Add a friend (create the connection)
- Open the "Friends" tab and tap "Add friend".
- Choose the "By nickname" or "By ID" tab and search:
  - by nickname (for example: 물보라), or
  - by the other person's 6-character friend code (for example: DEMO11).
- Tap the result, then tap the "Send request" button.
- When the other person accepts the request, you become friends and they appear in your Friends list.
- For your review, the example accounts (DEMO11–DEMO16) automatically accept incoming requests, so the new friend appears in your Friends list within a few seconds (pull down to refresh the Friends list if needed).

2) Invite a friend to a swim session (optional, after you already have friends)
- Open the Calendar tab, select one of your confirmed swim schedules, and tap "Invite friends" to invite people from your friends list to join that session.

So a new user first adds friends using flow (1) above. Step-by-step instructions and the example accounts are also included in the App Review Information notes.

Thank you — please let us know if anything else is needed.
```

---

## ✅ 크리스 체크리스트 (순서대로)

1. **[2.3.6] 연령 등급 수정** — App Store Connect → 앱 → **앱 정보(App Information)**
   → 연령 등급 → 편집 → **User-Generated Content = "예(Yes)"**.
   - 추가 질문 나오면: 신고/차단 기능 있음 → 해당 항목 정확히 체크. 등급이 올라가도 정상.
2. **[2.1] 마이그레이션 적용** — `0266_review_demo_accounts.sql` 을 dev → **prod** 순으로 적용.
   (build 25는 prod를 보므로 prod 적용 필수)
3. **[2.1] 검증** — 앱(또는 TestFlight)에서 친구 탭 → 닉네임 `물보라` 검색 →
   요청 → 잠시 후 친구 목록에 표시되는지 확인(자동수락).
4. **심사 노트 입력** — App Store Connect → (이번 버전) → **App Review Information**
   → Notes 칸에 아래 [심사 노트] 붙여넣기.
5. **Resolution Center 회신** — 아래 [Apple 회신문] 붙여넣고 **심사 재제출**.
6. **승인되면** — 파일 맨 아래 "승인 후 정리" 블록을 별도 마이그레이션으로 적용
   (자동수락 트리거 제거 + 데모 계정 검색 숨김).

---

## [심사 노트] — App Review Information → Notes

```
Thank you for the review.

The app is a social app for swimmers to find free-swim pool schedules and
connect with swim friends. We have added several example user accounts so the
friend feature can be fully tested.

How to test "make friends":
1. Sign in (Apple / Google / Kakao).
2. Go to the Friends tab and tap "Add friend".
3. Search by nickname or by 6-character friend code:
   - 물보라 (code: DEMO11)
   - 자유형러버 (code: DEMO12)
   - 새벽수영 (code: DEMO13)
   - 접영하나 (code: DEMO14)
   - 평영킹 (code: DEMO15)
   - 백수영러 (code: DEMO16)
4. Send a friend request to any of them. These example accounts auto-accept,
   so the user appears in your Friends list within a few seconds (pull to
   refresh the Friends tab if needed).
5. Tap a friend to view their profile, and check the Calendar tab to see their
   upcoming public swim schedules.

Login: social login only (Sign in with Apple is available on iOS).
```

---

## [Apple 회신문] — Resolution Center 회신

```
Hello, and thank you for the detailed feedback.

We have addressed both issues:

Guideline 2.1 — Information Needed
We have added six example user accounts so the friend-making feature can be
fully reviewed. In the Friends tab, tap "Add friend" and search by nickname or
6-character code (e.g. 물보라 / DEMO11, 자유형러버 / DEMO12). These example
accounts automatically accept incoming friend requests, so the new friend
appears in your Friends list within a few seconds. You can then open the
friend's profile and view their upcoming public swim schedules in the Calendar
tab. Full step-by-step instructions are included in the App Review Information
notes.

Guideline 2.3.6 — Accurate Metadata
We have updated the app's Age Rating in App Store Connect and selected "Yes"
for User-Generated Content, accurately reflecting that the app includes
user-generated content (profiles, nicknames, bios, and shared schedules). The
app also provides reporting and blocking controls for user-generated content.

Thank you again — please let us know if anything else is needed.
```
