/**
 * Pretendard + Fraunces 정적 폰트 로드.
 * tokens.ts의 font 값들과 1:1 매칭되는 family 이름.
 */
import { useFonts as useExpoFonts } from 'expo-font';

export function useFonts() {
  return useExpoFonts({
    'Pretendard-Regular':  require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':   require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':     require('../../assets/fonts/Pretendard-Bold.otf'),

    'Fraunces-Regular':    require('../../assets/fonts/Fraunces-Regular.ttf'),
    'Fraunces-Italic':     require('../../assets/fonts/Fraunces-Italic.ttf'),
    'Fraunces-Bold':       require('../../assets/fonts/Fraunces-Bold.ttf'),
    'Fraunces-BoldItalic': require('../../assets/fonts/Fraunces-BoldItalic.ttf'),
  });
}
