// Supabase에서 자유수영 시간표 fetch — published 본만 (사용자 제출 대기본은 schedule_submissions에 있음).
// usePools와 동일 패턴: snake_case row → camelCase TS 매핑.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
    // 표시 형식 "2026.10.31"로 변환 (DB는 timestamptz)
    updatedAt: row.updated_at.slice(0, 10).replace(/-/g, '.'),
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
  });
}
