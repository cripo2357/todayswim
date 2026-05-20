// Pool's day — Phase 3: 후원 메시지 서버 best-effort 동기 (donations 테이블, 0069).
//
// 정책 (profileSync / friendsSync 와 동일 톤):
// - 본인이 작성한 메시지는 클라가 직접 insert/update — useDonations 훅이 best-effort 호출.
// - 사용자별 여러 row 누적 가능. 표시는 클라가 사용자별 최신 1건만 dedup(최근순 정렬 후).
// - hidden = true 면 다른 사용자에게 미노출. 본인 카드엔 표시(본인 후원 이력).
// - 실 auth 세션 없으면 호출 자체가 RLS로 막힘 — 클라가 사전에 useProfile.id 가드.
//
// references: 0069_donations.sql, profiles_schema, project_phases.

import { supabase } from './supabase';

export interface DonationRow {
  id: string;
  profile_id: string;
  message: string;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

/** 신규 후원 메시지 작성 — 본인 profile_id 로 1행 insert. */
export async function tryInsertDonation(
  profileId: string,
  message: string,
): Promise<DonationRow | null> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert({ profile_id: profileId, message })
      .select()
      .maybeSingle();
    if (error || !data) return null;
    return data as DonationRow;
  } catch {
    return null;
  }
}

/** 문구 수정 — id 로 update. 본인 row 한정(RLS). */
export async function tryUpdateDonationMessage(
  id: string,
  message: string,
): Promise<void> {
  try {
    await supabase.from('donations').update({ message }).eq('id', id);
  } catch {
    /* best-effort */
  }
}

/** 비공개 토글 — Figma 239:3426 모달 동의 후 호출. row delete 아님(이력 보존). */
export async function tryUpdateDonationHidden(
  id: string,
  hidden: boolean,
): Promise<void> {
  try {
    await supabase.from('donations').update({ hidden }).eq('id', id);
  } catch {
    /* best-effort */
  }
}

/** 전체 후원 목록 — 최근순(서버 정렬). 사용자별 dedup·hidden 필터는 클라. */
export async function tryFetchDonations(): Promise<DonationRow[]> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error || !data) return [];
    return data as DonationRow[];
  } catch {
    return [];
  }
}

/**
 * 사용자별 최신 1건 dedup + visibility 필터.
 *
 *  - hidden=true 행은 본인(myProfileId)에게만 표시, 그 외에는 제외.
 *  - 같은 profile_id 면 최신 created_at 1건만 채택.
 *  - 결과 = "Pool's day를 응원해주신 분들" 리스트 (Figma 238:8643).
 */
export function dedupeDonationsForDisplay<T extends DonationRow>(
  rows: readonly T[],
  myProfileId: string | null,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    if (seen.has(r.profile_id)) continue;
    if (r.hidden && r.profile_id !== myProfileId) {
      seen.add(r.profile_id); // 비공개라도 사용자별 dedup 대상으로 처리 — 옛 메시지 노출 방지.
      continue;
    }
    seen.add(r.profile_id);
    out.push(r);
  }
  return out;
}
