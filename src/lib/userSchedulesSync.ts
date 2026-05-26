// Pool's day — Phase 2 네 번째 배치: 수영 일정 서버 best-effort 동기.
//
// useSwimSchedules 5개 mutation에 부착 + 친구 일정 fetch 함수(현 단계
// 호출처 없음, MOCK_OTHER_SCHEDULES 교체는 후속). 정책은 profileSync/
// friendsSync와 동일:
// - 로컬 우선(AsyncStorage 권위). 서버는 백그라운드 best-effort.
// - 현재 유저 친구코드 없으면 skip(가입 전).
// - 일정 id는 클라가 생성(text PK) → mutation 일관성 유지.
//
// references: 0049_user_schedules, profiles_schema, participant_visibility_policy.

// store/swimSchedule 가 이 파일을 import — 순환 의존을 피하려고 type-only.
// `import type`은 erased라 런타임 모듈 그래프에 안 들어감(circular 안전).
import { supabase } from './supabase';
import type {
  MySwimSchedule,
  ScheduleVisibility,
} from '@/store/swimSchedule';

interface UserScheduleRow {
  id: string;
  profile_id: string;
  pool_id: string | null;
  pool_name: string;
  pool_photo_url: string | null;
  date: string;
  start_time: string;
  end_time: string;
  visibility: ScheduleVisibility;
  completed: boolean;
  created_at: string;
}

function scheduleToRow(
  s: MySwimSchedule,
  meId: string,
): Omit<UserScheduleRow, 'created_at'> & { created_at: string } {
  return {
    id: s.id,
    profile_id: meId,
    pool_id: s.poolId,
    pool_name: s.poolName,
    pool_photo_url: s.poolPhotoUrl ?? null,
    date: s.date,
    start_time: s.start,
    end_time: s.end,
    visibility: s.visibility,
    completed: s.completed ?? false,
    created_at: s.createdAt,
  };
}

/** 일정 추가 — user_schedules insert. */
export async function tryInsertSchedule(
  meId: string,
  schedule: MySwimSchedule,
): Promise<void> {
  try {
    await supabase
      .from('user_schedules')
      .insert(scheduleToRow(schedule, meId));
  } catch {
    /* best-effort */
  }
}

/** 일정 삭제 — id로 delete. */
export async function tryDeleteSchedule(id: string): Promise<void> {
  try {
    await supabase.from('user_schedules').delete().eq('id', id);
  } catch {
    /* best-effort */
  }
}

/** 공개범위 변경. */
export async function tryUpdateScheduleVisibility(
  id: string,
  visibility: ScheduleVisibility,
): Promise<void> {
  try {
    await supabase
      .from('user_schedules')
      .update({ visibility })
      .eq('id', id);
  } catch {
    /* best-effort */
  }
}

/** 수영 완료 토글. */
export async function tryUpdateScheduleCompleted(
  id: string,
  completed: boolean,
): Promise<void> {
  try {
    await supabase
      .from('user_schedules')
      .update({ completed })
      .eq('id', id);
  } catch {
    /* best-effort */
  }
}

/** 다른 사람 일정 보기 '친구 일정만' 전환 시 — 내 예정 public을 friends로 강등.
 *  - 예정(date >= today) 한정. completed=false. visibility='public' → 'friends'.
 *  - 로컬과 동일한 조건이라 동기화 일관. */
export async function tryDowngradePublicToFriends(
  meId: string,
  todayDateKey: string,
): Promise<void> {
  try {
    await supabase
      .from('user_schedules')
      .update({ visibility: 'friends' })
      .eq('profile_id', meId)
      .eq('visibility', 'public')
      .gte('date', todayDateKey);
  } catch {
    /* best-effort */
  }
}

/** 내 일정 fetch — 다기기 동기/재설치 복구용. swimSchedule store 의 serverSync
 *  가 호출. session 있는데 server 0건이면 신규 가입자 = 시드 mock 안 쓰고
 *  빈 배열 반환(서버가 권위). */
export async function tryFetchMySchedules(
  meId: string,
): Promise<UserScheduleRow[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_schedules')
      .select('*')
      .eq('profile_id', meId)
      .order('date', { ascending: true });
    if (error) return null;
    return (data ?? []) as UserScheduleRow[];
  } catch {
    return null;
  }
}

/** row → MySwimSchedule 매핑 (snake_case → camelCase). swimSchedule store
 *  serverSync 가 사용. */
export function rowToSchedule(row: UserScheduleRow): MySwimSchedule {
  return {
    id: row.id,
    poolId: row.pool_id ?? '',
    poolName: row.pool_name,
    poolPhotoUrl: row.pool_photo_url ?? undefined,
    date: row.date,
    start: row.start_time,
    end: row.end_time,
    visibility: row.visibility,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

// ─── 친구 일정 fetch (MOCK_OTHER_SCHEDULES 교체용) ───

/** 친구 일정 + owner(profiles.nickname/photo_uri) join — MOCK_OTHER_SCHEDULES
 *  교체용. mapProfileStacks/scheduleParticipants 가 nickname·avatar 필요.
 *  Supabase nested select(`profiles!inner(...)`)로 한 쿼리. */
export interface ScheduleWithOwnerRow extends UserScheduleRow {
  profiles: { nickname: string; photo_uri: string | null } | null;
}
export async function tryFetchSchedulesWithOwner(
  profileIds: string[],
): Promise<ScheduleWithOwnerRow[]> {
  if (profileIds.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('user_schedules')
      .select('*, profiles!inner(nickname, photo_uri)')
      .in('profile_id', profileIds)
      .neq('visibility', 'private');
    if (error || !data) return [];
    return data as ScheduleWithOwnerRow[];
  } catch {
    return [];
  }
}

