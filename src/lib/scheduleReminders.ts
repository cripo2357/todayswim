// Pool's day — 내 수영 일정 로컬 알림(단말 예약). 서버 cron 없이 폰이 직접 예약.
//
// 왜 단말 알람인가: "내 일정 리마인더"는 시간이 되면 울리면 되고 남의 데이터가
// 필요 없으므로, 항상 켜진 서버 대신 기기 OS 예약(expo-notifications)이 더 단순·
// 견고하다. (상대에게 가는 알림·집계가 필요한 것은 dispatch/푸시 경로 — 별개.)
//
// 보내는 알림 (RULES schedule_reminder_*/completion_prompt 카피와 일치):
//   · 전날 20:00       — "내일 수영 일정 / {풀} {시각}"
//   · 시작 1시간 전     — "곧 수영 일정 / {풀}"
//   · 종료 시각         — "오늘 수영 어땠어요? / {풀}"  (완료 확인 리마인드)
//
// 재조정(reconcile) 패턴: 일정 추가/삭제/완료/서버동기/부팅 시 **기존 로컬 예약
// 전부 취소 후 미래 일정만 재예약**. 우리가 만든 로컬 예약 외엔 없으므로 멱등·
// 안전하고, 예약 id 추적이 불필요(재설치로 OS가 잃어버려도 다음 reconcile에 복구).
//
// 권한: registerForPush(로그인 시)가 이미 알림 권한을 요청. 미허용이면 조용히
// 무동작. dynamic import — 네이티브 모듈 격리(pushNotifications.ts 패턴).

import { Platform } from 'react-native';
import type { MySwimSchedule } from '@/store/swimSchedule';

let handlerSet = false;

/** 포그라운드에서도 배너 표시 — 앱 시작 1회(App.tsx). */
export async function initLocalNotifications(): Promise<void> {
  if (Platform.OS === 'web' || handlerSet) return;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  } catch {
    /* 네이티브 미빌드(dev 클라이언트) 등 — 무시 */
  }
}

/** "YYYY-MM-DD" + 시각(시,분) → 로컬 Date */
function at(dateISO: string, hh: number, mm: number): Date {
  const [y, m, d] = dateISO.split('-').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/**
 * 전체 일정 → 로컬 알림 재조정. 기존 예약 전부 취소 후 미래 일정만 재예약(멱등).
 * 권한 없거나 네이티브 미빌드면 조용히 무동작.
 */
export async function reconcileSwimReminders(
  schedules: MySwimSchedule[],
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const DATE = Notifications.SchedulableTriggerInputTypes.DATE;
    // 우리가 만든 로컬 예약만 존재 → 전부 취소 후 재구성.
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    for (const s of schedules) {
      const [eh, em] = s.end.split(':').map(Number);
      const end = at(s.date, eh, em).getTime();
      if (end <= now) continue; // 끝난 일정 제외

      const [sh, sm] = s.start.split(':').map(Number);
      const start = at(s.date, sh, sm).getTime();

      // 전날 20:00
      const prev = at(s.date, 20, 0);
      prev.setDate(prev.getDate() - 1);
      if (prev.getTime() > now) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '내일 수영 일정', body: `${s.poolName} ${s.start}` },
          trigger: { type: DATE, date: prev },
        });
      }
      // 시작 1시간 전
      const oneH = new Date(start - 60 * 60 * 1000);
      if (oneH.getTime() > now) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '곧 수영 일정', body: s.poolName },
          trigger: { type: DATE, date: oneH },
        });
      }
      // 종료 시각 — 완료 확인 리마인드(이미 완료 표시한 일정은 제외)
      if (!s.completed) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '오늘 수영 어땠어요?', body: s.poolName },
          trigger: { type: DATE, date: new Date(end) },
        });
      }
    }
  } catch {
    /* best-effort — 네이티브 미빌드/권한 변동/예약 실패 모두 무시 */
  }
}
