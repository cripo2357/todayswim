// 수영 일기 서버 best-effort 동기 (0581 swim_diaries). userSchedulesSync 패턴.
// 로컬(AsyncStorage) 우선, 서버는 백그라운드 best-effort. 일정당 1건(profile_id+schedule_id 유니크).
import { supabase } from './supabase';
import type { SwimDiary } from '@/store/swimDiary';
import type { ScheduleVisibility } from '@/store/swimSchedule';
import type { StrokeKey } from './swimCalories';

interface DiaryRow {
  id: string;
  profile_id: string;
  schedule_id: string;
  pool_id: string | null;
  pool_name: string;
  date: string;
  start_time: string;
  end_time: string;
  lane_length: number;
  reps: Partial<Record<StrokeKey, number>>;
  note: string | null;
  visibility: string;
  created_at: string;
}

function diaryToRow(meId: string, d: SwimDiary) {
  return {
    ...(d.id ? { id: d.id } : {}),
    profile_id: meId,
    schedule_id: d.scheduleId,
    pool_id: d.poolId || null,
    pool_name: d.poolName,
    date: d.date,
    start_time: d.start,
    end_time: d.end,
    lane_length: d.laneLength,
    reps: d.reps,
    note: d.note ?? null,
    visibility: d.visibility,
  };
}

export function rowToDiary(r: DiaryRow): SwimDiary {
  return {
    id: r.id,
    scheduleId: r.schedule_id,
    poolId: r.pool_id ?? '',
    poolName: r.pool_name,
    date: r.date,
    start: r.start_time,
    end: r.end_time,
    laneLength: r.lane_length,
    reps: r.reps ?? {},
    note: r.note ?? undefined,
    visibility: (r.visibility as ScheduleVisibility) ?? 'private',
    createdAt: r.created_at,
  };
}

/** 일기 저장(추가/수정) — (profile_id, schedule_id) upsert. 저장된 id 반환. */
export async function tryUpsertDiary(
  meId: string,
  d: SwimDiary,
): Promise<{ id: string } | null> {
  try {
    const { data } = await supabase
      .from('swim_diaries')
      .upsert(diaryToRow(meId, d), { onConflict: 'profile_id,schedule_id' })
      .select('id')
      .maybeSingle();
    return (data as { id: string } | null) ?? null;
  } catch {
    return null;
  }
}

/** 일기 삭제 — id로. */
export async function tryDeleteDiary(id: string): Promise<void> {
  try {
    await supabase.from('swim_diaries').delete().eq('id', id);
  } catch {
    /* best-effort */
  }
}

/** 내 일기 fetch — 다기기/재설치 복구. */
export async function tryFetchMyDiaries(
  meId: string,
): Promise<DiaryRow[] | null> {
  try {
    const { data, error } = await supabase
      .from('swim_diaries')
      .select('*')
      .eq('profile_id', meId);
    if (error) return null;
    return (data ?? []) as DiaryRow[];
  } catch {
    return null;
  }
}
