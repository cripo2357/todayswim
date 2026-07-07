// Supabase에서 자유수영 시간표 fetch — published 본만 (사용자 제출 대기본은 schedule_submissions에 있음).
// usePools와 동일 패턴: snake_case row → camelCase TS 매핑.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/dateFormat';
import type { Schedule } from '@/types/schedule';

interface ScheduleRow {
  pool_id: string;
  author_nickname: string;
  by_day: Schedule['byDay']; // jsonb는 자동 parse
  day_notes: Schedule['dayNotes'] | null;
  slot_groups: Schedule['slotGroups'] | null;
  updated_at: string;
}

function rowToSchedule(row: ScheduleRow): Schedule {
  return {
    poolId: row.pool_id,
    authorNickname: row.author_nickname,
    byDay: row.by_day,
    dayNotes: row.day_notes ?? undefined,
    slotGroups: row.slot_groups ?? undefined,
    // 앱 통일 날짜 포맷 YY.MM.DD(요일) — DB timestamptz의 날짜 부분만.
    updatedAt: formatDate(row.updated_at.slice(0, 10)),
  };
}

export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async (): Promise<Schedule[]> => {
      const { data, error } = await supabase.from('schedules').select('*');
      if (error) throw error;
      return (data as ScheduleRow[]).map(rowToSchedule);
    },
    // 시간표도 정적(운영자 관리) — pools와 동일하게 세션 중 재fetch 억제(재처리 방지).
    staleTime: 60 * 60_000, // 1h
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
