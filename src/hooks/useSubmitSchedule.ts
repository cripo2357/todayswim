// 시간표 작성/수정 요청 → schedule_submissions INSERT.
// ScheduleNicknameScreen에서 마지막 단계로 호출. status='pending'으로 들어가고 운영자가 검수 후 schedules에 반영.

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Schedule } from '@/types/schedule';
import { isAnonNickname } from '@/types/schedule';

interface SubmitArgs {
  poolId: string;
  nickname: string; // ANON_NICKNAME일 수도 있음 — DB엔 NULL로 저장
  byDay: Schedule['byDay'];
  dayNotes?: Schedule['dayNotes'];
}

export function useSubmitSchedule() {
  return useMutation({
    mutationFn: async (args: SubmitArgs) => {
      // 슬롯 1개+ 있는 요일의 note만 유지 (방어적 필터링 — UI 상에서 막혀있지만 보장).
      const cleanedNotes: NonNullable<Schedule['dayNotes']> = {};
      if (args.dayNotes) {
        for (const [day, note] of Object.entries(args.dayNotes) as [
          keyof Schedule['byDay'],
          string,
        ][]) {
          if ((args.byDay[day]?.length ?? 0) > 0 && note?.trim()) {
            cleanedNotes[day] = note.trim();
          }
        }
      }
      const { error } = await supabase.from('schedule_submissions').insert({
        pool_id: args.poolId,
        nickname: isAnonNickname(args.nickname) ? null : args.nickname.trim(),
        by_day: args.byDay,
        day_notes: cleanedNotes,
      });
      if (error) throw error;
    },
  });
}
