// 즐겨찾기 서버 동기화 — pool_favorites 테이블(0269).
//
// 정책(profileSync/userSchedulesSync 와 동일 톤):
// - **로컬(AsyncStorage)이 권위**. UI 즉시 반영, 서버는 백그라운드 best-effort.
// - 모든 호출 try/catch silent — 미로그인/네트워크/RLS/미적용 마이그 어떤 경우든
//   로컬 보존, 사용자 인지 X.
// - 스코프 = auth.uid()(계정 정체성). 친구코드(profiles.id) 가 아님 — 재설치·
//   기기변경·친구코드 변경에도 안정적.
//
// references: favorites store, supabase, profileSync(best-effort 패턴).

import { supabase } from './supabase';

interface FavoriteRow {
  pool_id: string;
}

/** 현 세션 auth.uid — 없으면(미로그인) null. */
async function currentUid(): Promise<string | null> {
  try {
    return (await supabase.auth.getSession()).data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * 본인 즐겨찾기 pool_id 목록 서버 조회. 재설치/기기변경/다기기 복구용.
 * 미로그인·에러면 null(빈 배열과 구분 — 호출부가 "서버 못 읽음"을 알도록).
 */
export async function tryFetchFavorites(): Promise<string[] | null> {
  try {
    const uid = await currentUid();
    if (!uid) return null;
    const { data, error } = await supabase
      .from('pool_favorites')
      .select('pool_id')
      .eq('auth_uid', uid);
    if (error || !data) return null;
    return (data as FavoriteRow[]).map((r) => r.pool_id);
  } catch {
    return null;
  }
}

/** 즐겨찾기 1건 서버 추가(idempotent upsert). 실패 silent. */
export async function tryAddFavorite(poolId: string): Promise<void> {
  try {
    const uid = await currentUid();
    if (!uid) return;
    await supabase
      .from('pool_favorites')
      .upsert({ auth_uid: uid, pool_id: poolId }, { onConflict: 'auth_uid,pool_id' });
  } catch {
    /* best-effort */
  }
}

/** 즐겨찾기 1건 서버 제거. 실패 silent. */
export async function tryRemoveFavorite(poolId: string): Promise<void> {
  try {
    const uid = await currentUid();
    if (!uid) return;
    await supabase
      .from('pool_favorites')
      .delete()
      .eq('auth_uid', uid)
      .eq('pool_id', poolId);
  } catch {
    /* best-effort */
  }
}

/** 여러 즐겨찾기 일괄 서버 추가(로컬→서버 1회 백필용). 실패 silent. */
export async function tryAddFavorites(poolIds: string[]): Promise<void> {
  if (poolIds.length === 0) return;
  try {
    const uid = await currentUid();
    if (!uid) return;
    const rows = poolIds.map((pool_id) => ({ auth_uid: uid, pool_id }));
    await supabase
      .from('pool_favorites')
      .upsert(rows, { onConflict: 'auth_uid,pool_id' });
  } catch {
    /* best-effort */
  }
}
