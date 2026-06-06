// Pool's day — OS 푸시 알림 등록 (P3-A4, 2026-05-21).
//
// Expo Push Service 사용 — FCM/APNs 키를 직접 관리 안 함.
// 토큰 형식: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'.
// 서버는 Edge Function 'send-push' 가 https://exp.host/--/api/v2/push/send
// 로 POST. Expo 가 FCM/APNs 으로 프록시.
//
// 라이프사이클:
//   1) 로그인 직후 (auth onAuthStateChange SIGNED_IN 시점) registerForPush
//      호출 → 권한 요청 → expoToken 발급 → push_tokens upsert.
//   2) 사용자가 권한 거부하면 등록 안 함(앱은 인앱 알림으로 정상 동작).
//   3) 로그아웃 시 unregisterCurrentDevice (선택) — 본인 토큰만 삭제.
//
// dev/Expo Go 한계: Expo SDK 53+ 부터 Expo Go 에서 푸시 토큰 발급 불가.
// EAS 빌드(development/preview/production) 에서만 동작 — pending_native_batch.
//
// dynamic import 패턴 — expo-notifications 가 네이티브 모듈이라 dev 클라이언트
// 에 없으면 throw. expo-clipboard / expo-network 와 동일 격리 패턴.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// EAS projectId — getExpoPushTokenAsync 필수. env(EXPO_PUBLIC_EAS_PROJECT_ID)는
// 프로덕션 EAS env에 안 들어가 있어서(빌드로그 확인) 늘 undefined였다 → projectId
// 자동 해석 실패 시 토큰 발급이 throw → push_tokens 0행. app.config 의
// extra.eas.projectId(또는 easConfig)에서 직접 해석해 항상 잡히게.
const PROJECT_ID =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
  (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)
    ?.projectId ??
  Constants.easConfig?.projectId;

/** 로그인 직후 호출. 권한 요청 → 토큰 발급 → push_tokens upsert.
 *  실패해도 throw 안 함 — 푸시 미등록은 인앱 알림으로 보완. */
export async function registerForPush(authUid: string | undefined): Promise<void> {
  if (!authUid) return;
  if (Platform.OS === 'web') return; // 웹 푸시는 별도 흐름(P3 outside scope)

  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    // 실 디바이스만 — 시뮬레이터/에뮬레이터는 푸시 토큰 발급 불가.
    if (!Device.isDevice) return;

    // 권한 확인 + 요청.
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return; // 사용자 거부 — 조용히 통과.

    // Android 채널 — 8.0+ 에서 채널 미설정 시 알림 안 옴. 기본 채널 1개.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    // ExponentPushToken[...] 발급. projectId 는 env / app.config.extra(Constants).
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      PROJECT_ID ? { projectId: PROJECT_ID } : undefined,
    );
    const expoToken = tokenResp.data;
    if (!expoToken) return;

    // push_tokens 에 UPSERT — expo_token unique 라 같은 디바이스 재가입 시 갱신.
    await supabase.from('push_tokens').upsert(
      {
        user_id: authUid,
        expo_token: expoToken,
        platform: Platform.OS,
      },
      { onConflict: 'expo_token' },
    );
  } catch {
    // expo-notifications 가 네이티브 미빌드 / 토큰 실패 — 조용히 무시.
    // 푸시 안 와도 인앱 알림(NotificationsTab) 으로 보완.
  }
}

/** 로그아웃 시 본인 디바이스 토큰 제거 — 다른 사용자가 같은 기기로 로그인할
 *  때 옛 사용자에게 푸시 가는 것 방지. */
export async function unregisterCurrentDevice(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');
    if (!Device.isDevice) return;

    const tokenResp = await Notifications.getExpoPushTokenAsync(
      PROJECT_ID ? { projectId: PROJECT_ID } : undefined,
    );
    const expoToken = tokenResp.data;
    if (!expoToken) return;
    await supabase
      .from('push_tokens')
      .delete()
      .eq('expo_token', expoToken);
  } catch {
    // best-effort.
  }
}
