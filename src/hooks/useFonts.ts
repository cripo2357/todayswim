/**
 * Pretendard 정적 폰트 로드(본문·UI 한글, 4 weight 전부 실사용).
 * tokens.ts의 font 값들과 1:1 매칭되는 family 이름.
 * (Fraunces 영문 장식폰트는 미사용이라 제거 2026-06-07 — 앱 번들 -1.2MB.)
 */
import { useFonts as useExpoFonts } from 'expo-font';
import { RubikSprayPaint_400Regular } from '@expo-google-fonts/rubik-spray-paint';

export function useFonts() {
  return useExpoFonts({
    'Pretendard-Regular':  require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':   require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':     require('../../assets/fonts/Pretendard-Bold.otf'),

    // 클러스터 핀 카운트(Figma 38:1078) — graffiti spray paint 스타일
    RubikSprayPaint_400Regular,
  });
}
