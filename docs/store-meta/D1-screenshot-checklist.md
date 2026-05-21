# Screenshot Checklist (P3 / D1)

App Store / Google Play 등록 페이지에 들어갈 스크린샷. 사이즈는 양 스토어
각각 요구치가 다르고, **현재 기기 한 대 캡쳐 → 자동 리사이즈** 가 가장 효율적.

## 사이즈 요구사항

### App Store (iOS)

iOS 17+ 부터 6.7" iPhone 만 필수 (다른 사이즈는 선택). Apple 이 자동
리사이즈해줌.

| 디바이스 | 해상도 | 필수 | 추천 캡쳐 기기 |
|---|---|---|---|
| **iPhone 6.7"** (15 Pro Max, 16 Pro Max) | 1290 × 2796 | ✅ 필수 | 캡쳐 |
| iPhone 6.5" (XS Max, 11 Pro Max) | 1242 × 2688 | 선택 | Apple 자동 리사이즈 |
| iPhone 5.5" (8 Plus) | 1242 × 2208 | 선택 | Apple 자동 리사이즈 |
| iPad 12.9" | 2048 × 2732 | (iPad 지원 시) | 현재 X — `supportsTablet: false` |

**개수**: 최소 3장, 최대 10장.

### Google Play (Android)

| 타입 | 사이즈 | 비율 | 필수 |
|---|---|---|---|
| Phone 스크린샷 | 1080 × 1920 ~ 7680 × 7680 | 16:9 or 9:16 | ✅ 필수 (최소 2장, 최대 8장) |
| 7" tablet (선택) | 1024 × 600 ~ 7680 × 7680 | | 현재 X |
| 10" tablet (선택) | 1024 × 600 ~ 7680 × 7680 | | 현재 X |

**개수**: phone 최소 2장, 권장 4-8장.

---

## 캡쳐할 화면 (8장 권장)

기능별 우선순위 + 사용자 첫 인상 기준:

### 1. 지도 (MapMain) — **메인**
- 서울 시내 지도 + 다수 풀 마커 + 클러스터
- FAB(필터/내위치/프로필) 보임
- 일러스트 캡션: "동네 자유수영 수영장을 한눈에"

### 2. 풀 상세 카드
- MapMain 풀 마커 탭한 상태 — 하단 카드 펼침
- 이름·주소·요금·레인·시설칩·즐겨찾기 보임
- 캡션: "요금부터 시설까지 한 화면에"

### 3. 자유수영 시간표 (ScheduleView)
- 요일 칩 + 시즌별 슬롯 그룹 + 예외문구
- 캡션: "요일별·시즌별 시간표를 한 번에"

### 4. 풀 목록 (PoolList)
- 거리순 정렬 카드 리스트
- 캡션: "가까운 순으로, 거리까지 표시"

### 5. 일정 추가 시트 (AddScheduleSheet)
- 풀·날짜·시간 슬롯 선택 상태
- 공개 범위 라디오 표시
- 캡션: "원하는 시간을 골라 일정으로"

### 6. 내 정보 — 달력 탭 (MyInfo > Calendar)
- 다가오는 수영 일정 카드 몇 장
- 캡션: "내 수영 일정과 친구 초대 한 곳에"

### 7. 내 정보 — 친구 탭 (FriendsTab)
- 친구 목록 + 친구 추가 버튼
- 캡션: "친구와 함께, 부담 없이"

### 8. 후원 / FAQ (Donation 또는 Faq)
- 따뜻한 운영 이미지
- 캡션: "광고 없이 후원으로 운영"

---

## 캡쳐 절차

1. **실 기기 캡쳐가 베스트** (iPhone 15 Pro Max + 픽셀 8 같은 1080×2400+ Android)
2. **상태바 시계 09:41** (Apple 관례) — `Demo Mode` 안 잡히면 그냥 두기
3. **배터리 100% + Wi-Fi full** 표시 (관례)
4. **알림 0개** (방해 없게)
5. **이미지 도구**: macOS 이미지 캡쳐 + Figma 에 placement 검토

**iOS Simulator 캡쳐도 가능** (Cmd+S in simulator) — 해상도 정확 + 상태바 자동 09:41

**Android emulator 캡쳐** — `adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png`

---

## Marketing 캡션 오버레이 (선택)

Apple/Google 모두 스크린샷 위에 텍스트·일러스트 오버레이 허용. Pool's day
브랜딩 (`#63CBE8` cyan 배경 + `#EAFF00` yellow accent) 으로 통일.

**도구**: Figma 에 1290×2796 / 1080×2400 프레임 만들고 캡쳐 위에 캡션 박기.

---

## 출시 전 체크리스트

- [ ] iPhone 6.7" 캡쳐 8장 (1290×2796)
- [ ] Android phone 캡쳐 8장 (1080×2400 권장)
- [ ] 캡쳐 위 캡션 오버레이 (선택 — 일관된 톤)
- [ ] App Store Connect 업로드 (8장)
- [ ] Play Console 업로드 (8장)
- [ ] 다국어 — 영문판 캡션도 만들지 결정 (있으면 더 좋지만 한 세트로 시작 OK)

---

## 참고

- App Store screenshot guidelines: https://developer.apple.com/app-store/product-page/
- Play screenshot guidelines: https://support.google.com/googleplay/android-developer/answer/9866151
