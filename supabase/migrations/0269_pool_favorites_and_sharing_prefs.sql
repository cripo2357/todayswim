-- Pool's day — 즐겨찾기 서버 동기화 + 공개/공유 설정 서버 미러.
--
-- 배경: 즐겨찾기(favorites)와 공개/공유 설정(profileVisibility/scheduleInvite)이
-- AsyncStorage 로컬에만 있어, 기기 변경·앱 재설치 시 소실됐다. 프로필·일정·
-- 친구·약관 동의는 이미 서버 백업되는데 이 둘만 누락(계정 자산 누수).
--
-- 이 마이그레이션:
--  1) pool_favorites — 즐겨찾기(auth_uid × pool_id) 서버 보관. 재설치/기기변경
--     복구 + 다기기 공유. auth_uid 스코프라 처음부터 엄격 RLS(본인 행만).
--  2) profiles.profile_visibility / schedule_invite — 공개/공유 설정 서버 미러
--     (notif_prefs · friend_request_mode 와 동일 패턴). 명시적 토글 변경 시 push,
--     로그인 후 1회 restore. others_schedule_view 는 profile_visibility 의 미러
--     (UI 단일 제어)라 별도 컬럼 불필요 — 복원 시 profile_visibility 에서 파생.

-- ── 1) 즐겨찾기 테이블 ────────────────────────────────────────────────────
-- 계정 정체성 = auth_uid 로 스코프(친구코드 profiles.id 가 아님 — 안정적 키).
-- 사용자 탈퇴(auth.users 삭제) 시 cascade 정리. pool 삭제돼도 행은 남겨
-- (pool_id 는 opaque text, 풀 재등록·정정 대비) — 표시 시 pools 조인이 알아서 거름.
create table if not exists public.pool_favorites (
  auth_uid   uuid        not null references auth.users(id) on delete cascade,
  pool_id    text        not null,
  created_at timestamptz not null default now(),
  primary key (auth_uid, pool_id)
);

-- 본인 즐겨찾기 일괄 조회용(PK 가 (auth_uid, pool_id)라 prefix 로 커버되지만
-- created_at 정렬 fetch 대비 명시).
create index if not exists pool_favorites_auth_uid_idx
  on public.pool_favorites (auth_uid);

-- RLS — 엄격(본인 행만). auth_uid = auth.uid() 매핑.
alter table public.pool_favorites enable row level security;

drop policy if exists pool_favorites_select_own on public.pool_favorites;
create policy pool_favorites_select_own on public.pool_favorites
  for select using (auth_uid = auth.uid());

drop policy if exists pool_favorites_insert_own on public.pool_favorites;
create policy pool_favorites_insert_own on public.pool_favorites
  for insert with check (auth_uid = auth.uid());

drop policy if exists pool_favorites_delete_own on public.pool_favorites;
create policy pool_favorites_delete_own on public.pool_favorites
  for delete using (auth_uid = auth.uid());
-- update 정책 없음 — 즐겨찾기는 insert/delete 만(토글). 본인 외 변경 차단.

-- ── 2) 공개/공유 설정 서버 미러 ───────────────────────────────────────────
-- 가입 기본: profileVisibility='friends'(더 비공개), scheduleInvite='on'.
-- 클라 prefs 초기값과 일치. 실제 공개 강제는 user_schedules.visibility 가 하고,
-- 이 값은 "새 일정 기본 공개범위 + 토글 위치"라 손실돼도 노출 누수는 없음.
alter table public.profiles
  add column if not exists profile_visibility text not null default 'friends'
    check (profile_visibility in ('friends', 'public'));

alter table public.profiles
  add column if not exists schedule_invite text not null default 'on'
    check (schedule_invite in ('on', 'off'));
