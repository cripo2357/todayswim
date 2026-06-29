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
import { getInstallId } from '@/lib/singleDevice';
import { navigationRef } from '@/navigation/navigationRef';
import type { TermsKey } from '@/lib/termsContent';
import { useProfile } from '@/store/profile';
import { markAllNotificationsAsRead } from '@/hooks/useNotifications';

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
    // device_id(설치 단위 안정 ID) 기록 → DB 트리거가 같은 device_id 의 옛 행
    // (옛 토큰/옛 유저)을 삭제해 "한 기기=한 유저" 강제 → 계정전환 시 옛 유저에게
    // 푸시 새는 것 차단([[push_token_stale_cross_delivery]]).
    const installId = await getInstallId();
    await supabase.from('push_tokens').upsert(
      {
        user_id: authUid,
        expo_token: expoToken,
        platform: Platform.OS,
        device_id: installId ?? undefined,
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
    // device_id(installId)로 삭제 — Expo 서버 round-trip 불필요라 빠르고
    // 거의 안 실패함. RLS(delete using user_id=auth.uid())가 내 행만 지움.
    // 로그아웃 시 세션 유효할 때 await로 호출 → stale row 안 남음(로그아웃
    // 기기가 계속 푸시 받던 버그 차단). [[push_token_stale_cross_delivery]]
    const installId = await getInstallId();
    if (installId) {
      await supabase.from('push_tokens').delete().eq('device_id', installId);
      return;
    }

    // 폴백 — installId 없을 때만 옛 경로(Expo round-trip).
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');
    if (!Device.isDevice) return;
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      PROJECT_ID ? { projectId: PROJECT_ID } : undefined,
    );
    const expoToken = tokenResp.data;
    if (!expoToken) return;
    await supabase.from('push_tokens').delete().eq('expo_token', expoToken);
  } catch {
    // best-effort.
  }
}

// ── 푸시 탭 → 화면 라우팅 ────────────────────────────────────────────────
// kind 별 딥링크(우선) → 없으면 category 폴백.
//  · terms_updated            → 약관 상세(TermsDetail)
//  · friend_request_accepted  → 내 정보 '친구' 탭(새 친구 보기)
//  · invite_accepted / 일정류  → 내 정보 '달력' 탭(일정 보기)
//  · 그 외(신청·초대 받음·처리결과·안내·리포트·마케팅) → '알림' 탭(kind별 카드+액션)
type Tab = '달력' | '친구' | '알림';
type NavAction =
  | { screen: 'TermsDetail'; termsKey: string }
  | { screen: 'MyInfo'; initialTab: Tab; focusScheduleId?: string };

function resolveRoute(data: Record<string, unknown> | undefined): NavAction {
  const kind = typeof data?.kind === 'string' ? data.kind : undefined;
  const scheduleId =
    typeof data?.scheduleId === 'string' ? data.scheduleId : undefined;
  switch (kind) {
    case 'terms_updated':
      return {
        screen: 'TermsDetail',
        termsKey: typeof data?.termsKey === 'string' ? data.termsKey : 'service',
      };
    case 'friend_request_accepted':
      return { screen: 'MyInfo', initialTab: '친구' };
    // 리마인더·완료확인 → 달력을 그 일정 날짜로 포커스(scheduleId 로 로컬 조회).
    case 'schedule_reminder_prev_day':
    case 'schedule_reminder_1h':
    case 'schedule_completion_prompt':
      return { screen: 'MyInfo', initialTab: '달력', focusScheduleId: scheduleId };
    case 'invite_accepted':
    case 'friend_schedule_overlap':
    case 'friend_joined_my_slot':
      return { screen: 'MyInfo', initialTab: '달력' };
  }
  // kind 없음/그 외 — category 폴백(schedule=달력, 나머지=알림).
  return {
    screen: 'MyInfo',
    initialTab: data?.category === 'schedule' ? '달력' : '알림',
  };
}

async function navigateToNotification(
  data: Record<string, unknown> | undefined,
): Promise<void> {
  // 푸시 탭 = 알림 확인 → 도착지(달력/친구/약관/메시지) 무관하게 읽음 처리.
  // 앱이 "일괄 읽음" 모델이라 markAllRead 호출(메시지 탭 진입과 동일 동작).
  const userCode = useProfile.getState().profile?.id;
  if (userCode) void markAllNotificationsAsRead(userCode);

  const action = resolveRoute(data);
  // navigationRef 준비 대기(콜드스타트 — 앱 부팅 직후 탭 처리 대비).
  for (let i = 0; i < 20; i++) {
    if (navigationRef.isReady()) {
      if (action.screen === 'TermsDetail') {
        navigationRef.navigate('TermsDetail', {
          termsKey: action.termsKey as TermsKey,
        });
      } else {
        navigationRef.navigate('MyInfo', {
          initialTab: action.initialTab,
          focusScheduleId: action.focusScheduleId,
        });
      }
      return;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}

let pushRoutingSetup = false;
/** 앱 마운트 시 1회 — 포그라운드 표시 + 푸시 탭 라우팅 + 콜드스타트 처리. */
export async function setupPushNotificationRouting(): Promise<void> {
  if (pushRoutingSetup) return;
  pushRoutingSetup = true;
  try {
    const Notifications = await import('expo-notifications');

    // 포그라운드(앱 켜진 상태)에서도 배너·사운드 노출. 없으면 iOS는 무음 무표시.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // 탭(앱 실행/백그라운드 중) → 해당 탭으로 이동.
    Notifications.addNotificationResponseReceivedListener((response) => {
      void navigateToNotification(
        response.notification.request.content.data as
          | Record<string, unknown>
          | undefined,
      );
    });

    // 콜드 스타트 — 앱이 꺼진 상태에서 푸시 탭으로 실행된 경우.
    const last = await Notifications.getLastNotificationResponseAsync();
    if (last) {
      void navigateToNotification(
        last.notification.request.content.data as
          | Record<string, unknown>
          | undefined,
      );
    }
  } catch {
    // expo-notifications 미빌드(dev client) 등 — 무시.
  }
}
