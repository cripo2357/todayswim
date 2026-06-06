// 슬롯 주차 운영(TimeSlot.weeks) 단일 유틸 — 등록시트 필터·시간표 뱃지가 같은 규칙을 쓰도록.
//
// 주차 규칙(크리스 정의 2026-06-06):
//  - 기준 = 매월 1일, 한 주의 시작 = 월요일.
//  - 즉 '그 달의 월요일 시작 달력 행' 번호(1~5). 1일이 든 행이 1주차.
//  - 1주차는 부분주일 수 있어 특정 요일이 1주차에 없을 수 있음
//    (예: 1일이 일요일이면 그달 첫 월요일은 2주차).
import type { TimeSlot } from '@/types/schedule';

/** 그 달의 몇째 주(1~5). 월요일 시작, 1일이 든 주가 1주차. */
export function weekOfMonth(date: Date): number {
  const dom = date.getDate(); // 1-based
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDow = (first.getDay() + 6) % 7; // 월=0 … 일=6
  return Math.floor((firstDow + dom - 1) / 7) + 1;
}

/** 슬롯이 해당 날짜에 운영되는가 — weeks 없으면 매주, 있으면 그 주차에만. */
export function slotRunsOnDate(slot: TimeSlot, date: Date): boolean {
  if (!slot.weeks || slot.weeks.length === 0) return true;
  return slot.weeks.includes(weekOfMonth(date));
}

/** 시간표 보기용 주차 라벨. 예: [1,3] → "1·3주". 매주면 null. */
export function formatWeeksLabel(weeks?: number[]): string | null {
  if (!weeks || weeks.length === 0) return null;
  return (
    weeks
      .slice()
      .sort((a, b) => a - b)
      .join('·') + '주'
  );
}
