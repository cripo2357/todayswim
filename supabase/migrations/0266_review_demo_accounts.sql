-- Pool's day — App Store 심사용 example(데모) 사용자 시드 + 자동수락 장치.
--
-- ## 배경
-- Apple 심사 반려(2026-06-07, 제출 0.1.1 build 25):
--   Guideline 2.1 — "Please add more example users to make friends as we can't
--   fully review the app." (심사관이 친구 추가 기능을 끝까지 체험 못 함)
--
-- 우리 친구 흐름:
--   · 검색은 friend_request_mode='all'(닉네임) / 'id'·'all'(코드) 프로필만 노출
--     (search_friends_by_nickname / find_friend_by_code, 0225)
--   · 친구 요청은 "상대방 수락"이 있어야 성립(friendships 양방향 두 행, 0048)
-- 로그인이 소셜 전용(Apple/Google/Kakao)이라 데모 계정으로 "수동 수락"이 불가능.
-- → 검색 가능한 example 계정 + "데모 계정에 온 요청은 즉시 자동수락" 트리거로 해결.
--
-- ## 설계
-- 1) profiles.is_demo 플래그 추가(default false). 자동수락 트리거의 게이트이자
--    승인 후 정리 대상 마커. 실 사용자는 항상 false → 영향 0.
-- 2) example 프로필 6개 — DEMO11~DEMO16. 친구코드 생성기는 혼동문자(O,0,1,I,L)를
--    제외하므로 'O'·'1' 포함 코드는 실 계정에서 절대 생성 불가 = 충돌 불가.
--    friend_request_mode='all' → 닉네임·코드 모두 검색됨.
-- 3) example 계정끼리 친구관계로 묶어 프로필이 비어보이지 않게(friend_count > 0).
-- 4) 공개(public) 자유수영 일정 시드 — 친구 수락 후 달력/참여자 화면에 노출.
--    날짜는 CURRENT_DATE 상대값(적용 시점 기준 향후 2~12일)으로 항상 "예정"이게.
-- 5) friend_requests BEFORE INSERT 트리거 — to_profile 이 is_demo면 status를
--    'accepted'로 세팅 + 양방향 friendships insert. security definer(RLS 우회).
--
-- ## 승인 후 정리 (별도 적용 — 이 파일 맨 아래 롤백 블록 참고)
--   실 사용자가 "가짜 자동수락 계정"을 만나지 않도록, 승인되면:
--   트리거 제거 + 데모 계정 friend_request_mode='off'(검색 숨김).

-- ─────────────────────────────────────────────────────────────────────
-- 1) is_demo 플래그
-- ─────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists is_demo boolean not null default false;

-- ─────────────────────────────────────────────────────────────────────
-- 2) example 프로필 6개
-- ─────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────
-- 3) example 계정끼리 친구관계 (양방향 두 행)
-- ─────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────
-- 4) 공개 자유수영 일정 시드 — 적용 시점 기준 향후 2~12일 (항상 "예정")
--    pool_id/name 은 실제 등록된 풀. visibility='public' → 친구/비친구 노출.
-- ─────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────
-- 5) 데모 계정 자동수락 트리거
--    심사관(실 Apple 계정)이 데모 계정에 친구요청 → 즉시 accepted + 친구 성립.
-- ─────────────────────────────────────────────────────────────────────
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
-- ★ 승인 후 정리 (별도 마이그레이션으로 적용 — 지금은 적용하지 말 것)
-- ─────────────────────────────────────────────────────────────────────
--   drop trigger if exists trg_demo_auto_accept on public.friend_requests;
--   drop function if exists public.demo_auto_accept_friend_request();
--   update public.profiles set friend_request_mode = 'off' where is_demo;
--   -- (계정/일정은 보존해도 무해. 완전 삭제 원하면:)
--   -- delete from public.user_schedules where profile_id like 'DEMO1%';
--   -- delete from public.profiles where is_demo;  -- friendships는 cascade
