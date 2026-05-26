-- Pool's day — Phase 2: 수영장 1곳 추가: 신길종합사회복지관 (POOL_0016).
--
-- ## 시간표 출처
--
-- 운영자(크리스) 직접 제공: 신길종합사회복지관 26-06 생활체육프로그램표 PDF
-- — pool_schedule_source_priority 1차 출처. 2차(블로그·헬로우스윔 등) 일체 미사용.
--
-- - 월·수·금: 15:00-15:50, 16:00-16:50, 18:00-18:50
-- - 화·목  : 08:00-08:50, 13:00-13:50, 14:00-14:50, 15:00-15:50, 18:00-18:50, 21:00-21:50
-- - 토     : 06:00-08:50, 10:00-11:50, 13:00-14:50, 16:00-17:50
-- - 일     : 휴관 (키 미포함)
--
-- PDF 비고("평일 자유수영 유아풀 사용 불가", "부력 보조기구 사용 불가",
-- "평일 월,수,금 11:30~14:30 남자탈의실/샤워장 이용불가") 는 슬롯 단위가 아닌
-- 풀 전체 비고라 schedules.day_notes 미사용 (day_note_constraint: byDay 슬롯 1개일 때만).
--
-- ## 메타데이터 출처
--
-- - 시설(레인 6, 25m, 수심 1.1~1.2m): 운영자 확인.
-- - 유아풀 있음 (단 평일 자유수영 시간엔 사용 불가 — PDF 비고).
-- - 가격: PDF 그대로. 평일 성인 5,300원 / 토요일 성인 6,800원 (아동 별도).
-- - 평일 정기권 95,000원/월은 별도 모델(추가 필드 없어 미반영).
-- - 좌표 [신뢰도 높음]: 카카오 POI "신길종합사회복지관 수영장" 정확 매치
--   (영등포구 신길동 465-1, 도로명 영등포로84길 24-5).
-- - 전화: 02-2138-1277 (1F 접수처, PDF 명시).

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0016', '신길종합사회복지관', '서울', '영등포구',
    '서울특별시 영등포구 영등포로84길 24-5',
    37.5111632459002, 126.92143625805, 'indoor', 'public',
    '02-2138-1277',
    6, 25, 1.1, 1.2,
    '{}', true, false, false,
    true, true,
    5300, 5300, 6800,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0016.jpg')
on conflict (id) do nothing;

-- 자유수영 시간표 (PDF 그대로).
-- hours = (종료 - 시작) 분/60. 50분=0.83, 1h50m=1.83, 2h50m=2.83.
-- 일요일 휴관 → 키 미포함.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  ('POOL_0016', '풀스데이', $${
    "월": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "화": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "수": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "목": [
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83},
      {"start":"21:00","end":"21:50","hours":0.83}
    ],
    "금": [
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"18:00","end":"18:50","hours":0.83}
    ],
    "토": [
      {"start":"06:00","end":"08:50","hours":2.83},
      {"start":"10:00","end":"11:50","hours":1.83},
      {"start":"13:00","end":"14:50","hours":1.83},
      {"start":"16:00","end":"17:50","hours":1.83}
    ]
  }$$::jsonb, '2026-05-26'::timestamptz)
on conflict (pool_id) do nothing;

-- has_schedule 동기화 (안전)
update public.pools
set has_schedule = true
where id = 'POOL_0016'
  and exists (select 1 from public.schedules where pool_id = 'POOL_0016');

-- ─────────────────────────────────────────────────────────────────────
-- 합병 (옛 0093_rls_strict_read): prefix 중복 회피.
-- ─────────────────────────────────────────────────────────────────────
-- Pool's day — P3 prod 출시 전 RLS read 정책 strict 화 (2026-05-26).
--
-- 분석 ([[P3-DEPLOY-CHECKLIST]] + P3-ENV-PROD-SETUP):
-- 0060(P2) 은 INSERT/UPDATE/DELETE 만 본인화, SELECT 는 대부분 (true) 유지.
-- 0081(P3) 가 notifications + storage avatars 본인화. 다음 5개 테이블은 여전히
-- SELECT (true) → 누구나 친구관계·차단목록·일정 그래프 조회 가능 (데이터 누설).
--
-- 본 마이그 = prod 출시 전 마지막 RLS 게이트.
--
-- 적용 대상:
--   1. friendships         — 본인이 양쪽 어느쪽이든 포함된 행만
--   2. friend_requests     — 본인이 송수신자인 행만
--   3. blocks              — 본인이 차단자인 행만
--   4. user_schedules      — 본인 + visibility=public + visibility=friends 인 친구 일정 (차단자 제외)
--   5. donations           — hidden=false (공개) 또는 본인 행
--
-- 미적용 (이미 적정):
--   - profiles: SELECT (true) 유지 — 닉네임 검색·친구코드 공유에 필수. 민감
--     정보(생년월일 등)는 클라 UI 가 자체 필터(공개범위 prefs).
--   - notifications, terms_agreements, push_tokens, donation_payments: 이미 strict.

-- ─────────────────────────────────────────────────────────────────────
-- Helper: 현재 인증 사용자의 profile.id(친구코드) 반환
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.current_profile_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select id from public.profiles where auth_uid = auth.uid() limit 1
$$;

grant execute on function public.current_profile_id() to authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────
-- 1. friendships — 본인 관여 행만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists friendships_select_any on public.friendships;
drop policy if exists friendships_select_owner on public.friendships;

create policy friendships_select_owner on public.friendships
  for select using (
    profile_id = public.current_profile_id()
    or friend_id = public.current_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 2. friend_requests — 본인 송수신만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists friend_requests_select_any on public.friend_requests;
drop policy if exists friend_requests_select_owner on public.friend_requests;

create policy friend_requests_select_owner on public.friend_requests
  for select using (
    from_profile_id = public.current_profile_id()
    or to_profile_id = public.current_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 3. blocks — 본인 차단 행만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists blocks_select_any on public.blocks;
drop policy if exists blocks_select_owner on public.blocks;

create policy blocks_select_owner on public.blocks
  for select using (
    blocker_id = public.current_profile_id()
  );

-- ─────────────────────────────────────────────────────────────────────
-- 4. user_schedules — 본인 + 공개 + 친구공개(친구 관계 있을 때)
--    private 자동 제외. blocked 사용자 일정 제외.
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists user_schedules_select_any on public.user_schedules;
drop policy if exists user_schedules_select_visible on public.user_schedules;

create policy user_schedules_select_visible on public.user_schedules
  for select using (
    -- (a) 본인 일정
    profile_id = public.current_profile_id()
    or (
      -- (b) 차단되지 않은 사용자 + visibility 충족
      profile_id not in (
        select blocked_id from public.blocks
        where blocker_id = public.current_profile_id()
      )
      and (
        visibility = 'public'
        or (
          visibility = 'friends'
          and exists (
            select 1 from public.friendships
            where profile_id = user_schedules.profile_id
              and friend_id = public.current_profile_id()
          )
        )
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- 5. donations — 공개(hidden=false) 또는 본인
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists donations_select_any on public.donations;
drop policy if exists donations_select_visible on public.donations;

create policy donations_select_visible on public.donations
  for select using (
    hidden = false
    or profile_id = public.current_profile_id()
  );
