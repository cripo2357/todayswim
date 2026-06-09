-- Pool's day — 1.0.1 심사용 데모 계정 재시드 (0266 복원).
--
-- ## 배경
-- 0266에서 1.0 심사(Guideline 2.1)용 데모 계정+자동수락을 깔았고, 승인 후
-- 0273으로 완전 삭제했음. 1.0.1 업데이트 심사에서도 친구 기능을 검증할 수 있도록
-- 동일 구성을 재시드한다. is_demo 컬럼은 0266에서 추가됐고 0273은 행만 삭제해
-- 컬럼은 남아있음(여기선 행+트리거만 복원).
--
-- ## 1.0.1 승인 후 정리
-- 0273과 동일하게: 트리거/함수 제거 + delete from profiles where is_demo.
-- (이 파일 맨 아래 롤백 블록 참고 — 별도 새 마이그레이션으로 적용)

-- 안전망: is_demo 컬럼 보장(0273 이후에도 남아있지만 멱등 보강)
alter table public.profiles
  add column if not exists is_demo boolean not null default false;

-- 1) 데모 프로필 6개 재삽입 (DEMO11~16, friend_request_mode='all' → 검색됨)
insert into public.profiles (
  id, nickname, gender, birth_date, experience_years, strokes, bio,
  certifications, im100_record, photo_uri,
  show_service_years, show_strokes, show_certs, show_im100, show_swim_classes,
  friend_request_mode, is_demo
) values
  ('DEMO11', '물보라',     'female', '1992-03-14',  5, array['자유형','배영']::text[], '아침수영 좋아요',
     '{}'::text[], '2분 이내',       'avatar-female-1', true, true, false, true, true, 'all', true),
  ('DEMO12', '자유형러버', 'male',   '1988-07-22',  8, array['자유형']::text[],       '주말 자유수영러',
     array['생활스포츠지도사 2급']::text[], '1분 30초 이내', 'avatar-male-2',   true, true, true,  true, true, 'all', true),
  ('DEMO13', '새벽수영',   'female', '1995-11-02',  3, array['평영','자유형']::text[], '6시 입수 도전',
     '{}'::text[], '3분 이내',       'avatar-female-3', true, true, false, true, true, 'all', true),
  ('DEMO14', '접영하나',   'female', '1990-05-19', 10, array['접영','자유형']::text[], '접영 연습 중',
     array['수상구조사']::text[], '2분 이내',          'avatar-female-4', true, true, true,  true, true, 'all', true),
  ('DEMO15', '평영킹',     'male',   '1985-09-30', 12, array['평영','배영']::text[],   '평영이 제일 편해',
     '{}'::text[], '1분 30초 이내', 'avatar-male-5',   true, true, false, true, true, 'all', true),
  ('DEMO16', '백수영러',   'male',   '1998-01-25',  2, array['배영']::text[],          '배영 입문',
     '{}'::text[], '4분 이내',       'avatar-male-3',   true, true, false, true, true, 'all', true)
on conflict (id) do update set
  nickname            = excluded.nickname,
  friend_request_mode = excluded.friend_request_mode,
  is_demo             = excluded.is_demo,
  photo_uri           = excluded.photo_uri;

-- 2) 데모 계정끼리 친구관계 (양방향 두 행)
insert into public.friendships (profile_id, friend_id)
select a, b from (values
  ('DEMO11','DEMO12'), ('DEMO11','DEMO13'), ('DEMO11','DEMO14'),
  ('DEMO12','DEMO13'), ('DEMO12','DEMO15'), ('DEMO13','DEMO16'),
  ('DEMO14','DEMO15'), ('DEMO15','DEMO16')
) as pairs(a, b)
on conflict do nothing;

insert into public.friendships (profile_id, friend_id)
select b, a from (values
  ('DEMO11','DEMO12'), ('DEMO11','DEMO13'), ('DEMO11','DEMO14'),
  ('DEMO12','DEMO13'), ('DEMO12','DEMO15'), ('DEMO13','DEMO16'),
  ('DEMO14','DEMO15'), ('DEMO15','DEMO16')
) as pairs(a, b)
on conflict do nothing;

-- 3) 공개 자유수영 일정 — 적용 시점 기준 향후 2~12일 (항상 "예정")
insert into public.user_schedules (
  id, profile_id, pool_id, pool_name, date, start_time, end_time, visibility
) values
  ('demo-sch-1', 'DEMO11', 'POOL_0014', '동대문구민체육센터',     to_char(current_date + 2,  'YYYY-MM-DD'), '06:00', '08:00', 'public'),
  ('demo-sch-2', 'DEMO12', 'POOL_0009', '동작구민체육센터',       to_char(current_date + 3,  'YYYY-MM-DD'), '19:00', '21:00', 'public'),
  ('demo-sch-3', 'DEMO13', 'POOL_0014', '동대문구민체육센터',     to_char(current_date + 4,  'YYYY-MM-DD'), '06:00', '07:50', 'public'),
  ('demo-sch-4', 'DEMO14', 'POOL_0017', '금천구민문화체육센터',   to_char(current_date + 5,  'YYYY-MM-DD'), '20:00', '22:00', 'public'),
  ('demo-sch-5', 'DEMO15', 'POOL_0010', '서울여성플라자 스포츠센터', to_char(current_date + 7,  'YYYY-MM-DD'), '18:00', '20:00', 'public'),
  ('demo-sch-6', 'DEMO16', 'POOL_0019', '양천구민체육센터',       to_char(current_date + 9,  'YYYY-MM-DD'), '07:00', '09:00', 'public'),
  ('demo-sch-7', 'DEMO11', 'POOL_0011', '영등포제1스포츠센터',     to_char(current_date + 11, 'YYYY-MM-DD'), '19:00', '21:00', 'public'),
  ('demo-sch-8', 'DEMO12', 'POOL_0014', '동대문구민체육센터',     to_char(current_date + 12, 'YYYY-MM-DD'), '06:00', '08:00', 'public')
on conflict (id) do nothing;

-- 4) 자동수락 트리거 복구 (데모 계정에 온 친구요청 즉시 수락)
create or replace function public.demo_auto_accept_friend_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.profiles p
    where p.id = new.to_profile_id and p.is_demo
  ) then
    new.status := 'accepted';
    new.responded_at := now();
    insert into public.friendships (profile_id, friend_id)
      values (new.from_profile_id, new.to_profile_id),
             (new.to_profile_id, new.from_profile_id)
      on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_demo_auto_accept on public.friend_requests;
create trigger trg_demo_auto_accept
  before insert on public.friend_requests
  for each row execute function public.demo_auto_accept_friend_request();

-- ─────────────────────────────────────────────────────────────────────
-- ★ 1.0.1 승인 후 정리 (별도 마이그레이션으로 적용 — 지금은 적용하지 말 것)
-- ─────────────────────────────────────────────────────────────────────
--   drop trigger if exists trg_demo_auto_accept on public.friend_requests;
--   drop function if exists public.demo_auto_accept_friend_request();
--   delete from public.profiles where is_demo;  -- friendships/요청/일정 cascade
