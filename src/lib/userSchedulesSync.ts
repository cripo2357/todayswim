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

// ─── 친구 일정 fetch (MOCK_OTHER_SCHEDULES 교체용, 후속 배치에서 호출 부착) ───

/** 친구 일정 — 친구 profile_id 목록으로 일괄 fetch. private 행은 RLS-후
 *  단계에서 자연 제외 예정(P1 톤이라 지금은 클라가 visibility 필터 책임).
 *  현 단계 호출처 없음 — MOCK_OTHER_SCHEDULES 교체 시 사용. */
export async function tryFetchSchedulesByProfileIds(
  profileIds: string[],
): Promise<UserScheduleRow[]> {
  if (profileIds.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('user_schedules')
      .select('*')
      .in('profile_id', profileIds)
      .neq('visibility', 'private'); // private은 절대 노출 X
    if (error || !data) return [];
    return data as UserScheduleRow[];
  } catch {
    return [];
  }
}

/** 특정 풀+날짜 슬롯의 참여자 일정 fetch — 슬롯 참여자 더보기/스택용.
 *  현 단계 호출처 없음. */
export async function tryFetchSchedulesByPoolDate(
  poolId: string,
  date: string,
): Promise<UserScheduleRow[]> {
  try {
    const { data, error } = await supabase
      .from('user_schedules')
      .select('*')
      .eq('pool_id', poolId)
      .eq('date', date)
      .neq('visibility', 'private');
    if (error || !data) return [];
    return data as UserScheduleRow[];
  } catch {
    return [];
  }
}
