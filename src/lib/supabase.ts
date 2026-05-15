// Supabase 클라이언트 단일 인스턴스.
//
// EXPO_PUBLIC_* env vars는 빌드 타임에 JS 번들에 인라인됨 — 별도 ConfigContext 통과 X.
// .env / .env.example 참고. anon key는 RLS 보호 전제로 클라이언트 노출 OK.
//
// AsyncStorage를 auth 영속 저장소로 지정 — 세션 유지 (앱 재시작 후에도 로그인 유지).

import 'react-native-url-polyfill/auto'; // Supabase가 내부적으로 URL/URLSearchParams 사용
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 미설정. .env 확인.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN은 URL 기반 세션 감지 X (네이티브 딥링크는 별도 처리)
    flowType: 'pkce', // Kakao signInWithOAuth → exchangeCodeForSession 용
  },
});
