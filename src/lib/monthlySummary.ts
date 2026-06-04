// Pool's day — 월간 수영 결산. 서버 cron 없이 앱 열 때 클라가 계산해 월 1회 발송.
//
// 왜 클라인가: 결산은 내 일정 집계만 필요하고(남의 데이터 X), 사용자가 앱을 열
// 때 보여주면 충분하다. 항상 켜진 서버 cron 대신 "앱 열림 + 새 달" 트리거로 처리.
//
// 멱등: AsyncStorage에 마지막 발송한 '지난달 키(YYYY-M)'를 사용자별로 저장. 같은
// 달엔 재발송 안 함. 지난달 일정 0건이면 발송 스킵(신규/미사용자 스팸 방지)하되
// 그 달은 '처리됨'으로 기록해 매 열림마다 재계산하지 않음.
//
// 발송: dispatchMessage('monthly_summary', frequency 변형) — recipients 'self'라
// 본인 알림함에만 적재(푸시는 self 제외 정책이라 안 감 = 조용한 인앱 카드).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useProfile } from '@/store/profile';
import { dispatchMessage } from '@/lib/messages/dispatch';

const KEY_PREFIX = 'poolsday.lastSummaryYM.';

export async function maybeSendMonthlySummary(): Promise<void> {
  try {
    const me = useProfile.getState().profile?.id;
    if (!me) return; // 미인증 — dispatch도 어차피 스킵됨

    const now = new Date();
    // 지난달 (전월). now가 1월이면 작년 12월.
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevY = prev.getFullYear();
    const prevMonth = prev.getMonth() + 1; // 1~12
    const ym = `${prevY}-${prevMonth}`;

    const key = `${KEY_PREFIX}${me}`;
    const last = await AsyncStorage.getItem(key);
    if (last === ym) return; // 이미 지난달 결산 처리함

    // 지난달에 속한 내 일정 집계 (date = YYYY-MM-DD)
    const inPrev = useSwimSchedules.getState().schedules.filter((s) => {
      const [yy, mm] = s.date.split('-').map(Number);
      return yy === prevY && mm === prevMonth;
    });

    // 있든 없든 그 달은 처리됨으로 기록(매 열림 재계산 방지).
    await AsyncStorage.setItem(key, ym);
    if (inPrev.length === 0) return; // 활동 없으면 결산 스킵(스팸 방지)

    // 최다 방문 수영장
    const counts = new Map<string, number>();
    for (const s of inPrev) {
      counts.set(s.poolName, (counts.get(s.poolName) ?? 0) + 1);
    }
    let favoritePool = '';
    let max = 0;
    for (const [name, c] of counts) {
      if (c > max) {
        max = c;
        favoritePool = name;
      }
    }

    void dispatchMessage('monthly_summary', {
      variant: 'frequency',
      month: String(prevMonth),
      count2: inPrev.length,
      favoritePool,
    });
  } catch {
    /* best-effort — 실패해도 다음 달 다시 시도 */
  }
}
