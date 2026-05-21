# 아이콘·스플래시 자산 Audit (P3 / D3)

현재 자산 상태 점검 + 출시 전 보완 필요 항목 정리.

---

## 1. 앱 아이콘

| 항목 | 현재 | 출시 요구 | 상태 |
|---|---|---|---|
| `assets/icon.png` | 1024×1024 RGBA PNG | ✅ App Store / Play 둘 다 OK | ✅ |
| `assets/adaptive-icon.png` (Android) | **❌ 없음** | foreground 라이브 + background 단색 | ⚠️ 보완 필요 |
| Android adaptive icon | `app.config.ts > android.adaptiveIcon` 에 `foregroundImage: './assets/icon.png'`, `backgroundColor: '#63CBE8'` 로 fallback | iOS 26+ (foreground 아이콘 강제 분리) | ⚠️ |

**필요 조치**:
- `assets/adaptive-icon.png` 별도 export — foreground 만 (cyan 배경 제외, 투명 PNG, 약간 안쪽으로 inset)
- 사이즈 432×432 (foreground)
- 배경은 `app.config.ts` 의 `backgroundColor` 단색으로 처리 (현재 `#63CBE8` cyan, OK)
- 현재 `foregroundImage: './assets/icon.png'` 가 cyan 배경 포함된 채로 전체 사용 중 — Android 시스템 마스크 (원형/squircle) 가 잘리는 영역이 cyan 이라 어색하지 않게 매치는 됨 (app.config 주석에 명시). 하지만 정식 출시 시점에는 별도 foreground export 권장.

---

## 2. 스플래시 (Launch Screen)

| 항목 | 현재 | 출시 요구 | 상태 |
|---|---|---|---|
| 네이티브 스플래시 (JS 로드 전) | ✅ `expo-splash-screen` 플러그인 (cyan bg `#63CBE8` + `icon.png` 200px) | 브랜딩 적용된 스플래시 | ✅ (2026-05-21 P3-C.1 완료) |
| JS 진입 후 스플래시 | `SplashScreen.tsx` (애니메이션 + 진행바 + cyan bg + droplet) | OK — 이건 풍부함 | ✅ |
| 네이티브 → JS 인계 | App.tsx 에서 `preventAutoHideAsync()` + fontsLoaded 시 `hideAsync()` | 매끄러운 전환 | ✅ |

**필요 조치 (선택)**:
앱 시동 ~ JS 로드까지 1~2초 빈 흰 화면이 보일 가능성. 두 옵션:

### Option A — expo-splash-screen 플러그인 명시 설정

```ts
// app.config.ts plugins 에 추가
[
  'expo-splash-screen',
  {
    backgroundColor: '#63CBE8',
    image: './assets/icon.png',  // 또는 별도 splash logo
    imageWidth: 200,
  },
],
```

→ 네이티브 스플래시 = cyan bg + 중앙 icon. JS 로드 완료 시 자동 hide.

### Option B — 별도 `splash.png` export 후 `splash` 키 사용 (구식)

```ts
splash: {
  image: './assets/splash.png',  // 1242×2436+ (전체 화면 디자인 PNG)
  resizeMode: 'cover',
  backgroundColor: '#63CBE8',
},
```

→ Figma 에서 전체 스플래시 PNG 그려서 export.

**권장**: **Option A** — 코드 변경 minimal, JS 의 SplashScreen 와 색 톤 연결돼 어색하지 않게 transition. 별도 디자인 자산 X.

---

## 3. App Store / Play Store 아이콘 노출 사이즈

스토어 노출용 별도 아이콘 필요 없음 — `assets/icon.png` 1024×1024 가 자동
리사이즈됨.

| 사이즈 | 용도 | 출처 |
|---|---|---|
| 1024×1024 | App Store · Play Store · 기기 홈 | `icon.png` 자동 |
| 180×180 | iPhone 홈 (3x) | 자동 |
| 167×167 | iPad Pro 홈 | (현재 iPad 미지원) |
| 152×152 | iPad 홈 | (현재 iPad 미지원) |
| 76×76 | iPad Spotlight | (현재 iPad 미지원) |
| 192×192 | Android Play Store | 자동 |
| 512×512 | Play Store featured | 자동 |

→ **추가 export 없이 1024 한 장으로 충분**.

---

## 4. 피드백 알림

| 자산 | 권장 사이즈 | 현재 |
|---|---|---|
| App Store Feature Graphic | 자동 (1024×1024 호환) | ✅ |
| Play Store Feature Graphic | **1024 × 500** (App Store 와 별개) | **❌ 없음** |

**Play Store Feature Graphic** = Play Store 페이지 상단의 가로 배너. 별도 디자인
필요.

권장 디자인: cyan bg + `Pool's day` 워드마크 + 태그라인 (`같이 수영할래?`) +
오른쪽에 작은 droplet 일러스트.

---

## 출시 전 체크리스트

- [ ] `assets/adaptive-icon.png` foreground 만 별도 export (Android adaptive)
- [ ] `expo-splash-screen` 플러그인 명시 설정 (cyan bg + icon)
- [ ] Play Store Feature Graphic 1024×500 디자인 export
- [ ] 1024×1024 icon 의 시각 검수 (스토어 썸네일 작게 보이면 디테일 손실 없는지)
- [ ] adaptive-icon 의 시스템 마스크 (원형/squircle) 컷팅 미리보기

---

## 참고

- Apple Human Interface Guidelines — App Icon
- Material Design — Adaptive icons
- Expo splash screen docs: https://docs.expo.dev/versions/latest/sdk/splash-screen/
