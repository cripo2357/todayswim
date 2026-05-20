-- Pool's day — Phase 2 두 번째 배치: 친구 시스템 스키마 (요청/관계/차단).
--
-- profiles(0047) 본체 위에 사람 그래프 SSOT를 얹는다. useFriendList 서버
-- 커서 페이지네이션 교체는 별도 배치(다음 commit) — 이번엔 DB만.
--
-- ## 설계 결정
--
-- 1) **friendships = 양방향 두 행** (a→b, b→a). 조회 단순(WHERE profile_id=$1
--    한 줄), block 트리거가 쌍 양쪽 다 정리하기 쉬움. 짝 보장은 클라이언트가
--    수락 시 두 번 insert(또는 후속 P2에서 RPC 함수로). 표준 패턴.
--
-- 2) **모든 profile_id FK = `ON UPDATE CASCADE ON DELETE CASCADE`**.
--    profiles.id(친구코드)는 사용자가 regenerateId로 변경 가능 — cascade로
--    자식 자동 갱신. profile_schema 메모리의 "옛 row 보존" 결정은 외부 참조
--    없을 때의 임시안이었고, 이번 배치와 함께 "PK UPDATE cascade"로 정정.
--    profileSync.tryRenameProfileId도 새 row insert → UPDATE id 로 변경.
--
-- 3) **blocks → friendships 자동 삭제 트리거 (안전망).** 차단 정책은 [[block_policy_enforcement]]
--    영구·전면. 클라가 잊어도 DB가 보장 — block insert 시 양쪽 friendships
--    행 + 양쪽 pending friend_requests 모두 삭제.
--
-- 4) **friend_requests 72h 만료 = view-time 처리.** 컬럼에 status='expired'
--    추가하되 자동 만료 cron은 P3 또는 추후. 클라이언트가 created_at 기준으로
--    pending+expired 구분 표시. message_rules_architecture 72h 자동만료 정책
--    호환.
--
-- 5) **RLS = P1 톤** (`(true)`). 실 auth 진입 시 from_profile_id/blocker_id 본인 행만
--    insert로 강화.

-- ─────────────────────────────────────────────────────────────────────
-- friend_requests — 친구 요청(요청-수락 흐름)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.friend_requests (
  id              uuid        primary key default gen_random_uuid(),
  from_profile_id text        not null references public.profiles(id)
                                on update cascade on delete cascade,
  to_profile_id   text        not null references public.profiles(id)
                                on update cascade on delete cascade,
  status          text        not null default 'pending'
                                check (status in (
                                  'pending', 'accepted', 'rejected',
                                  'cancelled', 'expired'
                                )),
  created_at      timestamptz not null default now(),
  responded_at    timestamptz,
  check (from_profile_id <> to_profile_id)
);

-- 같은 from→to 의 pending 중복 방지(partial unique). 거절·취소 후 재요청은 가능.
create unique index if not exists friend_requests_pending_uq
  on public.friend_requests (from_profile_id, to_profile_id)
  where status = 'pending';

-- 조회 인덱스(받은요청·보낸요청·상태 필터링)
create index if not exists friend_requests_to_status_idx
  on public.friend_requests (to_profile_id, status);
create index if not exists friend_requests_from_status_idx
  on public.friend_requests (from_profile_id, status);

-- ─────────────────────────────────────────────────────────────────────
-- friendships — 성립된 친구 관계(양방향 두 행)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.friendships (
  profile_id  text        not null references public.profiles(id)
                            on update cascade on delete cascade,
  friend_id   text        not null references public.profiles(id)
                            on update cascade on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, friend_id),
  check (profile_id <> friend_id)
);

create index if not exists friendships_friend_idx
  on public.friendships (friend_id);

-- ─────────────────────────────────────────────────────────────────────
-- blocks — 차단(단방향)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.blocks (
  blocker_id  text        not null references public.profiles(id)
                            on update cascade on delete cascade,
  blocked_id  text        not null references public.profiles(id)
                            on update cascade on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists blocks_blocked_idx
  on public.blocks (blocked_id);

-- 차단 시 양쪽 친구관계 + pending 요청 자동 정리. 클라가 잊어도 DB 보장.
-- block_policy_enforcement(영구·전면) 안전망.
create or replace function public.enforce_block_cleanup()
returns trigger
language plpgsql
as $$
begin
  -- 양쪽 friendships 삭제
  delete from public.friendships
   where (profile_id = new.blocker_id and friend_id = new.blocked_id)
      or (profile_id = new.blocked_id and friend_id = new.blocker_id);
  -- 양쪽 pending friend_requests 취소 (이력은 'cancelled'로 보존, 삭제 X)
  update public.friend_requests
     set status = 'cancelled', responded_at = now()
   where status = 'pending'
     and (
       (from_profile_id = new.blocker_id and to_profile_id = new.blocked_id) or
       (from_profile_id = new.blocked_id and to_profile_id = new.blocker_id)
     );
  return new;
end;
$$;

drop trigger if exists trg_enforce_block_cleanup on public.blocks;
create trigger trg_enforce_block_cleanup
  after insert on public.blocks
  for each row execute function public.enforce_block_cleanup();

-- ─────────────────────────────────────────────────────────────────────
-- RLS — P1 톤(누구나 read/insert/delete). 실 auth 진입 시 본인 행 한정.
-- ─────────────────────────────────────────────────────────────────────
alter table public.friend_requests enable row level security;
alter table public.friendships     enable row level security;
alter table public.blocks          enable row level security;

drop policy if exists friend_requests_select_any on public.friend_requests;
create policy friend_requests_select_any on public.friend_requests
  for select using (true);
drop policy if exists friend_requests_insert_any on public.friend_requests;
create policy friend_requests_insert_any on public.friend_requests
  for insert with check (true);
drop policy if exists friend_requests_update_any on public.friend_requests;
create policy friend_requests_update_any on public.friend_requests
  for update using (true) with check (true);
drop policy if exists friend_requests_delete_any on public.friend_requests;
create policy friend_requests_delete_any on public.friend_requests
  for delete using (true);

drop policy if exists friendships_select_any on public.friendships;
create policy friendships_select_any on public.friendships
  for select using (true);
drop policy if exists friendships_insert_any on public.friendships;
create policy friendships_insert_any on public.friendships
  for insert with check (true);
drop policy if exists friendships_delete_any on public.friendships;
create policy friendships_delete_any on public.friendships
  for delete using (true);

drop policy if exists blocks_select_any on public.blocks;
create policy blocks_select_any on public.blocks
  for select using (true);
drop policy if exists blocks_insert_any on public.blocks;
create policy blocks_insert_any on public.blocks
  for insert with check (true);
drop policy if exists blocks_delete_any on public.blocks;
create policy blocks_delete_any on public.blocks
  for delete using (true);
