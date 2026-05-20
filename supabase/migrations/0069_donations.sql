-- Pool's day — Phase 3: donations 테이블 (후원 메시지).
--
-- ## 데이터 모델
--
-- 사용자가 후원금 송금 후 작성하는 응원 메시지. Figma 238:8643 화면의
-- "Pool's day를 응원해주신 분들" 리스트에 노출. 본인 카드엔 "후원 비공개" /
-- "문구 수정" 액션.
--
-- 사용자 결정(2026-05-21):
-- - **여러 행 누적 가능** — 사용자가 시간 두고 여러 번 작성 OK. UI는 사용자별
--   최신 1건만 표시(클라에서 dedup), 목록 정렬은 created_at desc.
-- - **hidden = "비공개"** — 다른 사용자에게는 안 보이고 본인 카드엔 표시.
--   row 진짜 delete 아님(이력 보존). 본인이 다시 새 메시지 작성 가능.
--
-- ## 컬럼
--
-- - id          : uuid PK
-- - profile_id  : 작성자 친구코드. profiles.id FK on update/delete cascade.
-- - message     : 메시지 본문. 1~300자.
-- - hidden      : 다른 사용자에게 미노출(본인은 보임).
-- - created_at  : 작성 시각(UI 정렬·표시 기준).
-- - updated_at  : 문구 수정 시각.
--
-- ## RLS (P2 보수적 톤 — write만 본인 검증, select은 true)
--
-- - select: (true) — hidden 필터는 클라가 본인 vs 타인 분기로 처리.
-- - insert/update/delete: profile_id 의 auth_uid = auth.uid()

create table if not exists public.donations (
  id          uuid        primary key default gen_random_uuid(),
  profile_id  text        not null references public.profiles(id)
                            on update cascade on delete cascade,
  message     text        not null
                            check (char_length(message) between 1 and 300),
  hidden      boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 사용자별 최신 1건 dedup용 — (profile_id, created_at desc) 인덱스로 쿼리 가속.
create index if not exists donations_profile_created_idx
  on public.donations (profile_id, created_at desc);

-- 목록(최근순, hidden 필터) 가속용.
create index if not exists donations_created_idx
  on public.donations (created_at desc);

-- updated_at 자동 갱신 트리거 (profiles의 동일 패턴).
create or replace function public.donations_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_donations_set_updated_at on public.donations;
create trigger trg_donations_set_updated_at
  before update on public.donations
  for each row execute function public.donations_set_updated_at();

alter table public.donations enable row level security;

drop policy if exists donations_select_any on public.donations;
create policy donations_select_any on public.donations
  for select using (true);

drop policy if exists donations_insert_self on public.donations;
create policy donations_insert_self on public.donations
  for insert with check (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );

drop policy if exists donations_update_self on public.donations;
create policy donations_update_self on public.donations
  for update
    using (
      (select auth_uid from public.profiles where id = profile_id) = auth.uid()
    )
    with check (
      (select auth_uid from public.profiles where id = profile_id) = auth.uid()
    );

drop policy if exists donations_delete_self on public.donations;
create policy donations_delete_self on public.donations
  for delete using (
    (select auth_uid from public.profiles where id = profile_id) = auth.uid()
  );
