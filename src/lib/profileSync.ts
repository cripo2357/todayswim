// Pool's day — Phase 2 첫 단계: profiles 본체 서버 동기화.
//
// 정책(2026-05-20):
// - **로컬 우선**. AsyncStorage가 권위 — 사용자가 다중 기기를 쓰기 시작하는 건
//   실 auth 진입 이후라, 단순 정책으로 충분. 재설치/기기변경 케이스만 서버에서
//   복구(`tryFetchProfileById`).
// - **save 시 서버 best-effort upsert** — 실패해도 로컬 보존, 사용자 인지 X.
//   네트워크 단절·RLS 거부·미적용 마이그레이션 어떤 경우든 catch silent.
// - **mock-auth 톤**. 0047_profiles RLS는 select/insert/update `(true)` —
//   실 auth 진입 시 update를 auth.uid()=auth_uid 본인 행으로 강화 예정.
// - **row ↔ UserProfile** 1:1 매핑. snake_case ↔ camelCase 한 곳.
//
// references: project_phases (P2 진입), supabase, message_rules_architecture
// (notifications 동기화 패턴 — best-effort try/catch).

import { supabase } from './supabase';
import type {
  UserProfile,
  Gender,
  Stroke,
  Certification,
  IM100Record,
  SwimClass,
} from '@/store/profile';

// Postgres row 형태 — public.profiles 컬럼과 1:1.
interface ProfileRow {
  id: string;
  nickname: string;
  gender: string;
  birth_date: string;
  experience_years: number;
  strokes: string[];
  bio: string | null;
  certifications: string[];
  im100_record: string | null;
  photo_uri: string | null;
  photo_thumb_uri: string | null;
  swim_classes: SwimClass[];
  lesson_pool_id: string | null;
  lesson_pool_name: string | null;
  show_service_years: boolean;
  show_strokes: boolean;
  show_certs: boolean;
  show_im100: boolean;
  show_swim_classes: boolean;
  created_at: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.nickname,
    gender: row.gender as Gender,
    birthDate: row.birth_date,
    experienceYears: row.experience_years,
    strokes: row.strokes as Stroke[],
    photoUri: row.photo_uri ?? undefined,
    photoThumbUri: row.photo_thumb_uri ?? undefined,
    bio: row.bio ?? undefined,
    certifications: row.certifications.length
      ? (row.certifications as Certification[])
      : undefined,
    im100Record: (row.im100_record as IM100Record | null) ?? undefined,
    swimClasses: row.swim_classes.length ? row.swim_classes : undefined,
    lessonPoolId: row.lesson_pool_id ?? undefined,
    lessonPoolName: row.lesson_pool_name ?? undefined,
    showServiceYears: row.show_service_years,
    showStrokes: row.show_strokes,
    showCerts: row.show_certs,
    showIm100: row.show_im100,
    showSwimClasses: row.show_swim_classes,
    createdAt: row.created_at,
  };
}

// upsert payload — DB가 채울 컬럼(updated_at)은 제외. 미지정 boolean은
// DB default(true)로 떨어지므로 명시적으로 보내 클라이언트 상태와 일치 보장.
function profileToRow(p: UserProfile): Omit<ProfileRow, 'updated_at'> {
  return {
    id: p.id,
    nickname: p.name,
    gender: p.gender,
    birth_date: p.birthDate,
    experience_years: p.experienceYears,
    strokes: p.strokes,
    bio: p.bio ?? null,
    certifications: p.certifications ?? [],
    im100_record: p.im100Record ?? null,
    photo_uri: p.photoUri ?? null,
    photo_thumb_uri: p.photoThumbUri ?? null,
    swim_classes: p.swimClasses ?? [],
    lesson_pool_id: p.lessonPoolId ?? null,
    lesson_pool_name: p.lessonPoolName ?? null,
    // undefined → 클라 기본값으로 해석(PROFILE_VIS_DEFAULT)이지만 DB는 명시.
    show_service_years: p.showServiceYears ?? true,
    show_strokes: p.showStrokes ?? true,
    show_certs: p.showCerts ?? false,
    show_im100: p.showIm100 ?? true,
    show_swim_classes: p.showSwimClasses ?? true,
    created_at: p.createdAt,
  };
}

/**
 * 친구코드로 서버 profile 1건 조회. 재설치/기기변경 복구용.
 * 없거나(404) 에러면 null — best-effort, 호출부가 로컬 폴백.
 */
export async function tryFetchProfileById(
  id: string,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return rowToProfile(data as ProfileRow);
  } catch {
    return null;
  }
}

/**
 * 서버 profiles에 upsert. 실패해도 silent — 로컬이 권위.
 * save·regenerateId 양쪽에서 동일하게 호출.
 */
export async function tryUpsertProfile(p: UserProfile): Promise<void> {
  try {
    const row = profileToRow(p);
    await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  } catch {
    /* best-effort */
  }
}

/**
 * 친구코드 변경(regenerateId) — profiles.id 를 UPDATE.
 *
 * 0048(friends/blocks/friend_requests) 진입 후 정책 전환: friendships
 * /friend_requests/blocks가 profiles.id를 FK로 참조(ON UPDATE CASCADE) —
 * PK를 UPDATE 하면 자식 자동 갱신, 옛 친구코드는 사라지고 새 코드로 통일.
 *
 * 이전 정책("옛 row 보존")은 외부 참조 없을 때의 임시안이었음.
 * 외부 참조가 생긴 지금 옛 row를 두면 옛 코드로 검색한 사람이 "유령"
 * row를 보고 친구추가가 옛 PK에 묶이는 UX 함정. cascade로 정정.
 *
 * 옛 row가 cascade로 사라지므로 별도 delete 불필요. 다른 필드도 함께
 * 변경된 경우 fallback upsert로 보장.
 */
export async function tryRenameProfileId(
  next: UserProfile,
  prevId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ id: next.id })
      .eq('id', prevId);
    if (error) {
      // UPDATE 실패(미적용 마이그레이션 등) → 새 row 삽입 폴백.
      await tryUpsertProfile(next);
      return;
    }
    // PK 변경 후 나머지 필드도 동기화(닉네임 등이 같이 바뀐 경우).
    await tryUpsertProfile(next);
  } catch {
    await tryUpsertProfile(next);
  }
}
