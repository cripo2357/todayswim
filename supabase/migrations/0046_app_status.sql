-- Pool's day — 앱 상태 게이트 (점검 / 강제 업데이트).
-- 단일 행(id=1)으로 운영. 운영자가 Supabase 대시보드/SQL로 ON/OFF.
-- 클라이언트는 부팅 시 Splash에서 1회 fetch → Maintenance / AppUpdateRequired 로 reset.

create table if not exists public.app_status (
  id integer primary key check (id = 1) default 1,
  maintenance_active boolean not null default false,
  -- 점검 화면 배지에 표시될 라벨 (예: "오후 6시 재오픈"). null → 화면 기본 문구.
  maintenance_label text,
  -- 강제 업데이트 임계값. 클라이언트 expo.version < 이 값이면 AppUpdateRequired.
  -- null → 강제 업데이트 게이트 비활성.
  min_app_version text,
  ios_store_url text,
  android_store_url text,
  updated_at timestamptz not null default now()
);

alter table public.app_status enable row level security;

drop policy if exists "app_status read-all" on public.app_status;
create policy "app_status read-all" on public.app_status
  for select using (true);

-- 단일 행 보장 (초기 OFF 상태).
insert into public.app_status (id, maintenance_active)
values (1, false)
on conflict (id) do nothing;
