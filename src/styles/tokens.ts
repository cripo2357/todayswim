/**
 * Pool's Day — 디자인 토큰 (TypeScript)
 *
 * DESIGN.md 기반. RN StyleSheet에서 직접 사용.
 * 하드코딩 hex 절대 금지 — 색상은 항상 tokens.color.xxx 로.
 *
 * 웹 버전(tokens.css)과 값 동일. CSS 변수 → 객체 키로 변환.
 */

export const color = {
  // === 풀 블루 (메인) ===
  pool50:  '#F0F9FF',
  pool100: '#E0F2FE',
  pool200: '#BAE6FD',
  pool300: '#7DD3FC', // DESIGN.md §4-4에서 보더 색으로 언급. 보간 추가.
  pool400: '#38BDF8',
  pool500: '#0EA5E9', // 메인 — 버튼, 링크, 마커
  pool600: '#0284C7',
  pool700: '#0369A1',
  pool900: '#0C4A6E',

  // === 위트 액센트 ===
  foolYellow:     '#FCD34D', // 마스코트, 한정 카피, 별 아이콘, 찜 마커
  foolYellowDeep: '#F59E0B',

  // === 브랜드 (CI / 스플래시 / 아이콘) ===
  brandBlue:   '#007AFF',
  brandYellow: '#FFCC00',

  // pd-byellow — 새 브랜드 lime yellow (스플래시 progressFill, 마커 50m+, 클러스터 카운터)
  pdByellow:   '#EAFF00',
  // pd-mint — 새 브랜드 cyan (아이콘 배경, stat 아이콘 fill, 칩 bg)
  pdMint:      '#63CBE8',
  // pd-blue — 새 브랜드 indigo blue (필터 footer 텍스트, 칩 보더/체크 원, 요일 비선택 칩)
  pdBlue:      '#6890CB',
  // pd-bgray — 새 브랜드 light gray (버튼/입력 배경)
  pdBgray:     '#EBEBEB',
  // pd-gray — 새 브랜드 medium gray (disabled 텍스트/아이콘)
  pdGray:      '#C8C8C8',

  // === 감정 컬러 ===
  warmCoral:    '#FB7185', // 찜 하트
  warmCoralBg:  '#FFE4E6',
  red:          '#FF3B30', // 에러/유효성 검증 텍스트 (Apple HIG destructive red, Figma "Colors/Red")

  // === 중성 (배경) ===
  bgCream:   '#FAFAF7', // 메인 배경 (절대 #FFFFFF 쓰지 말 것)
  bgPaper:   '#FFFFFF', // 카드, 모달
  bgSubtle:  '#F5F5F2',

  // === 중성 (텍스트, ink) ===
  ink900: '#0F172A',
  ink700: '#334155',
  ink500: '#64748B',
  ink400: '#94A3B8',

  // === 보더 ===
  lineDefault: '#E5E7EB',
  lineSubtle:  '#F1F5F9',

  // === 정적 ===
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof color;

/**
 * 폰트 패밀리.
 * expo-font 로 로드한 family 이름과 일치해야 함 (useFonts.ts 참고).
 */
export const font = {
  // 본문·UI (한글)
  sans:        'Pretendard-Regular',
  sansMedium:  'Pretendard-Medium',
  sansSemibold:'Pretendard-SemiBold',
  sansBold:    'Pretendard-Bold',

  // 강조·로고 (영문)
  serif:        'Fraunces-Regular',
  serifItalic:  'Fraunces-Italic',
  serifBold:    'Fraunces-Bold',
  serifBoldItalic: 'Fraunces-BoldItalic',

  // 클러스터 카운트 (Figma 38:1078) — graffiti spray paint
  graffiti:     'RubikSprayPaint_400Regular',
} as const;

/**
 * 텍스트 스케일.
 * fontFamily는 Pretendard 가정. 위트 카피만 Fraunces italic.
 * letterSpacing은 RN에서 절대값(px). DESIGN.md의 -0.02em ≒ -0.6 (32px 기준).
 */
export const text = {
  display:    { fontFamily: font.serifBold,    fontSize: 48, lineHeight: 53, letterSpacing: -0.96 },
  h1:         { fontFamily: font.sansBold,     fontSize: 32, lineHeight: 38, letterSpacing: -0.64 },
  h2:         { fontFamily: font.sansSemibold, fontSize: 24, lineHeight: 31, letterSpacing: -0.24 },
  h3:         { fontFamily: font.sansSemibold, fontSize: 20, lineHeight: 28 },
  h4:         { fontFamily: font.sansSemibold, fontSize: 17, lineHeight: 24 },
  body:       { fontFamily: font.sans,         fontSize: 16, lineHeight: 26 },
  bodyBold:   { fontFamily: font.sansSemibold, fontSize: 16, lineHeight: 26 },
  bodySm:     { fontFamily: font.sans,         fontSize: 14, lineHeight: 21 },
  caption:    { fontFamily: font.sansMedium,   fontSize: 13, lineHeight: 18, color: color.ink500 },
  label:      { fontFamily: font.sansSemibold, fontSize: 12, lineHeight: 12, letterSpacing: 0.48 }, // uppercase는 텍스트 컴포넌트에서 transform
  witty:      { fontFamily: font.serifItalic,  fontSize: 16, lineHeight: 26, fontStyle: 'italic' as const },
} as const;

/**
 * 8pt 그리드. 4의 배수는 미세 조정용.
 * 호출: tokens.space[4] = 16 (4번째 단계 = 8 × 2).
 * 인덱스는 단계, 값은 px.
 */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  24: 96,
  32: 128,
} as const;

/**
 * 페이지·섹션 표준.
 */
export const layout = {
  pagePadMobile: 20,
  cardPad: 20,
  cardGap: 16,
  sectionGap: 48,
  headerHeight: 64,
  touchTargetMin: 40, // 접근성 — 모든 탭 가능 영역 최소 40×40
} as const;

/**
 * 컨테이너 폭. 모바일은 보통 화면폭 그대로지만 태블릿/큰 폰 대응용.
 */
export const container = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * 브레이크포인트. RN에선 Dimensions로 분기.
 */
export const breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * 모서리 둥글기. 16px 넘으면 유치해짐 (DESIGN.md 경고).
 */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 9999,
} as const;

/**
 * 그림자.
 * RN의 그림자는 iOS와 Android가 다르게 동작:
 * - iOS: shadowColor + shadowOffset + shadowOpacity + shadowRadius
 * - Android: elevation
 * 두 플랫폼 호환되도록 객체로 묶어 spread하기.
 */
export const shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: color.pool500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: color.pool500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  pop: {
    shadowColor: color.pool500,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 36,
    elevation: 10,
  },
} as const;

/**
 * 모션 — Easing은 react-native-reanimated 또는 Animated.timing의 easing 옵션.
 * RN Animated.timing의 cubic bezier는 Easing.bezier(...) 로 적용.
 */
export const motion = {
  ease: {
    snappy: [0.4, 0, 0.2, 1] as const,    // 기본
    pool:   [0.65, 0, 0.35, 1] as const,  // 물결
    bounce: [0.68, -0.4, 0.32, 1.6] as const, // 찜·하이파이브
  },
  duration: {
    fast: 150,
    base: 250,
    slow: 400,
  },
} as const;

/**
 * 통합 export — 컴포넌트에서 한 줄로 import.
 */
export const tokens = {
  color,
  font,
  text,
  space,
  layout,
  container,
  breakpoint,
  radius,
  shadow,
  motion,
} as const;

export default tokens;
