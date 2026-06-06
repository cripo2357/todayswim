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
import { logEvent } from '@/lib/analytics';

// EAS projectId — getExpoPushTokenAsync 필수. env(EXPO_PUBLIC_EAS_PROJECT_ID)는
// 프로덕션 EAS env에 안 들어가 있어서(빌드로그 확인) 늘 undefined였다 → projectId
// 자동 해석 실패 시 토큰 발급이 throw → push_tokens 0행. app.config 의
// extra.eas.projectId(또는 easConfig)에서 직접 해석해 항상 잡히게.
const PROJECT_ID =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
  (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)
    ?.projectId ??
  Constants.easConfig?.projectId;

// ⚠️ 임시 디버그 — push_tokens 0행 원인 추적용. push_debug 테이블에 각 단계를
// 기록한다(logEvent 가 no-op 라 단말 로그를 볼 수 없어 서버 테이블로 대체).
// 원인 잡으면 이 함수 + 호출 + 테이블 전부 제거할 것.
async function pushDebug(
  authUid: string | undefined,
  step: string,
  detail: string,
): Promise<void> {
  try {
    await supabase
      .from('push_debug')
      .insert({ auth_uid: authUid ?? null, step, detail: detail.slice(0, 500) });
  } catch {
    /* ignore — 디버그 기록 실패는 무시 */
  }
}

/** 로그인 직후 호출. 권한 요청 → 토큰 발급 → push_tokens upsert.
 *  실패해도 throw 안 함 — 푸시 미등록은 인앱 알림으로 보완. */
export async function registerForPush(authUid: string | undefined): Promise<void> {
  if (!authUid) return;
  if (Platform.OS === 'web') return; // 웹 푸시는 별도 흐름(P3 outside scope)

  await pushDebug(authUid, 'enter', `platform=${Platform.OS}`);
  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    await pushDebug(authUid, 'device', `isDevice=${String(Device.isDevice)}`);
    // 실 디바이스만 — 시뮬레이터/에뮬레이터는 푸시 토큰 발급 불가.
    if (!Device.isDevice) return;

    // 권한 확인 + 요청.
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
      // 첫 권한 요청 응답만 이벤트로 — 이미 granted였던 케이스는 제외.
      void logEvent(
        status === 'granted'
          ? 'push_permission_granted'
          : 'push_permission_denied',
      );
    }
    await pushDebug(authUid, 'permission', String(status));
    if (status !== 'granted') return; // 사용자 거부 — 조용히 통과.

    // Android 채널 — 8.0+ 에서 채널 미설정 시 알림 안 옴. 기본 채널 1개.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    await pushDebug(authUid, 'projectId', String(PROJECT_ID));
    // ExponentPushToken[...] 발급. projectId 는 EAS env / app.config.extra
    // 둘 다 fallback.
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      PROJECT_ID ? { projectId: PROJECT_ID } : undefined,
    );
    const expoToken = tokenResp.data;
    await pushDebug(authUid, 'token', expoToken ? expoToken : 'EMPTY');
    if (!expoToken) return;

    // push_tokens 에 UPSERT — expo_token unique 라 같은 디바이스 재가입 시 갱신.
    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: authUid,
        expo_token: expoToken,
        platform: Platform.OS,
      },
      { onConflict: 'expo_token' },
    );
    await pushDebug(authUid, 'upsert', error ? error.message : 'ok');
    // 진단 breadcrumb — 다음 빌드에서 토큰 등록이 실제로 도는지 확인용.
    void logEvent(
      error ? 'push_token_upsert_failed' : 'push_token_registered',
    );
  } catch (e) {
    // expo-notifications 가 네이티브 미빌드 / 토큰 실패 — 조용히 무시.
    // 푸시 안 와도 인앱 알림(NotificationsTab) 으로 보완.
    await pushDebug(
      authUid,
      'error',
      (e as { message?: string })?.message ?? String(e),
    );
    void logEvent('push_token_register_error');
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
