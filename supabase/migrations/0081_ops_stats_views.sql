-- Pool's day — 운영성 통계 view 묶음 (제보·약관·알림·후원 보강·카탈로그 헬스).
--
-- 모두 service_role 전용. 두 가지 방식으로 비공개 유지:
--   1. `security_invoker = on` — base table 의 RLS 정책을 그대로 상속.
--   2. base table 이 read_all 인 경우(notifications, pools, schedules) 는
--      view 권한 자체를 `anon`/`authenticated` 에서 revoke.
--
-- 사용성 분석(신규방문/재방문/세션·체류·funnel) 은 별도 트랙 — 외부
-- analytics 도구(PostHog 등) 선택 필요. 본 마이그레이션은 운영성만.

-- ─────────────────────────────────────────────────────────────────────
-- 1. pool_submissions_stats_v — 풀 등록 제보 처리 통계
-- ─────────────────────────────────────────────────────────────────────
-- 운영 질문: "대기 건수 / 평균 처리일 / 가장 오래 대기 중인 건 언제?"
create or replace view public.pool_submissions_stats_v
with (security_invoker = on)
as
select
  status,
  mode,
  count(*) as submission_count,
  avg(extract(epoch from (reviewed_at - submitted_at)) / 86400)::numeric(10, 1)
    as avg_processing_days,
  min(submitted_at) as oldest_submitted_at,
  max(submitted_at) as newest_submitted_at
from public.pool_submissions
group by status, mode;

-- ─────────────────────────────────────────────────────────────────────
-- 2. schedule_submissions_stats_v — 시간표 제보 처리 통계
-- ─────────────────────────────────────────────────────────────────────
-- pool_submissions 와 달리 nickname 컬럼이 있어 unique 제보자 집계 가능.
create or replace view public.schedule_submissions_stats_v
with (security_invoker = on)
as
select
  status,
  count(*) as submission_count,
  count(distinct pool_id) as unique_pools,
  count(distinct nickname) filter (where nickname is not null)
    as unique_submitters,
  avg(extract(epoch from (reviewed_at - submitted_at)) / 86400)::numeric(10, 1)
    as avg_processing_days,
  min(submitted_at) as oldest_submitted_at,
  max(submitted_at) as newest_submitted_at
from public.schedule_submissions
group by status;

-- ─────────────────────────────────────────────────────────────────────
-- 3. terms_consent_v — 약관별 현재 동의 현황
-- ─────────────────────────────────────────────────────────────────────
-- terms_agreement_current(0044 파생 view) 위에 한 번 더 집계.
-- 운영 질문: "마케팅 동의자 N명 / 약관 개정(예: service v2.0) 후 재동의
-- 진행률 = active version agree 수 / 전체 가입자 수?"
create or replace view public.terms_consent_v
with (security_invoker = on)
as
select
  terms_type,
  terms_version,
  action,
  count(*) as user_count
from public.terms_agreement_current
group by terms_type, terms_version, action;

-- ─────────────────────────────────────────────────────────────────────
-- 4. notifications_kind_v — 알림 kind 별 발송·읽음률
-- ─────────────────────────────────────────────────────────────────────
-- 운영 질문: "donation_thanks 효과? pool_submission_approved 읽음률?
-- 최근 30일 동안 어떤 kind 가 많이 발송됐나?"
create or replace view public.notifications_kind_v
with (security_invoker = on)
as
select
  kind,
  count(*) as total_count,
  count(*) filter (where read) as read_count,
  (count(*) filter (where read))::numeric / nullif(count(*), 0)
    as read_rate,
  count(*) filter (where created_at >= now() - interval '30 days')
    as last_30d_count,
  count(*) filter (
    where created_at >= now() - interval '30 days' and read
  ) as last_30d_read_count,
  count(distinct user_code) as unique_recipients,
  max(created_at) as last_sent_at
from public.notifications
group by kind;

-- notifications base 는 select_any 라 invoker 만으로는 anon 차단 안 됨.
revoke select on public.notifications_kind_v from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 5. donation_monthly_v — 후원 월별 누적 (KST)
-- ─────────────────────────────────────────────────────────────────────
-- 0080 의 연도별 view 를 한 단계 더 잘게 — 월별 추이 그래프 입력용.
create or replace view public.donation_monthly_v
with (security_invoker = on)
as
select
  extract(year  from (received_at at time zone 'Asia/Seoul'))::int as year,
  extract(month from (received_at at time zone 'Asia/Seoul'))::int as month,
  sum(amount)::bigint as total_amount,
  count(*) as payment_count,
  count(distinct profile_id) filter (where profile_id is not null)
    as unique_donors
from public.donation_payments
group by
  extract(year  from (received_at at time zone 'Asia/Seoul')),
  extract(month from (received_at at time zone 'Asia/Seoul'));

-- ─────────────────────────────────────────────────────────────────────
-- 6. donation_new_vs_repeat_v — 신규/재후원 분해 (월별)
-- ─────────────────────────────────────────────────────────────────────
-- 각 payment 가 그 후원자의 첫 입금인지(window function) 라벨링 후 월별로.
-- profile_id NULL(미매칭) 제외 — new/repeat 판정 불가.
create or replace view public.donation_new_vs_repeat_v
with (security_invoker = on)
as
with ranked as (
  select
    profile_id,
    amount,
    received_at,
    row_number() over (
      partition by profile_id
      order by received_at, id
    ) as rn_per_donor
  from public.donation_payments
  where profile_id is not null
)
select
  extract(year  from (received_at at time zone 'Asia/Seoul'))::int as year,
  extract(month from (received_at at time zone 'Asia/Seoul'))::int as month,
  case when rn_per_donor = 1 then 'new' else 'repeat' end as donor_type,
  sum(amount)::bigint as total_amount,
  count(*)            as payment_count,
  count(distinct profile_id) as unique_donors
from ranked
group by
  extract(year  from (received_at at time zone 'Asia/Seoul')),
  extract(month from (received_at at time zone 'Asia/Seoul')),
  case when rn_per_donor = 1 then 'new' else 'repeat' end;

-- ─────────────────────────────────────────────────────────────────────
-- 7. pools_coverage_v — 풀 카탈로그 헬스(누락 항목 todo)
-- ─────────────────────────────────────────────────────────────────────
-- 풀별 누락 플래그 row. 운영자가 `where missing_* = true` 로 todo 추출.
-- 좌표(lat/lng) 는 NOT NULL 이라 누락 항목에 포함 안 함.
create or replace view public.pools_coverage_v
with (security_invoker = on)
as
select
  p.id,
  p.name,
  p.region,
  p.district,
  (s.pool_id is null)                              as missing_schedule,
  (p.photo_url is null or p.photo_url = '')        as missing_photo,
  (p.lane_count is null)                           as missing_lane_count,
  (p.pool_length is null)                          as missing_pool_length,
  (p.depth_min is null or p.depth_max is null)    as missing_depth,
  (p.price_per_session is null)                    as missing_price
from public.pools p
left join public.schedules s on s.pool_id = p.id;

-- pools/schedules 는 read_all 이라 invoker 만으로는 anon 차단 안 됨.
revoke select on public.pools_coverage_v from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 운영자 사용 예 (Supabase Studio, service_role)
-- ─────────────────────────────────────────────────────────────────────
--
--   -- (a) 대기 중인 풀 등록 제보 + 평균 처리일
--   select * from pool_submissions_stats_v
--    where status = 'pending';
--
--   -- (b) 시간표 제보 Top 5 (직접 base table 쿼리, view 외)
--   select nickname, count(*) as n
--     from schedule_submissions
--    where nickname is not null
--    group by nickname order by n desc limit 5;
--
--   -- (c) 마케팅 동의자 수
--   select user_count from terms_consent_v
--    where terms_type = 'marketing' and action = 'agree';
--
--   -- (d) 알림 kind 별 읽음률 Top
--   select kind, read_rate, total_count
--     from notifications_kind_v
--    order by total_count desc;
--
--   -- (e) 최근 12개월 후원 추이
--   select year, month, total_amount, unique_donors
--     from donation_monthly_v
--    order by year desc, month desc limit 12;
--
--   -- (f) 이번 달 신규 vs 재후원
--   select donor_type, total_amount, payment_count, unique_donors
--     from donation_new_vs_repeat_v
--    where year = extract(year from now() at time zone 'Asia/Seoul')
--      and month = extract(month from now() at time zone 'Asia/Seoul');
--
--   -- (g) 시간표 없는 풀 (운영 todo)
--   select id, name, region, district
--     from pools_coverage_v
--    where missing_schedule
--    order by region, district;

-- ─────────────────────────────────────────────────────────────────────
-- 합병 (옛 0081_rls_hardening_p3): prefix 중복 회피 + 의존 순서 유지.
-- ─────────────────────────────────────────────────────────────────────
-- Pool's day — P3-C2/C3 RLS·Storage 최종 하드닝 (0060 후속).
--
-- 0060 (P2 마무리) 가 profiles/friend_requests/friendships/blocks/
-- user_schedules/notifications 의 write 정책을 본인 검증으로 잠궜다.
-- 출시 직전 P3 에서 남은 두 영역을 마저 잠근다:
--
--   1) notifications.select_any → **본인 행만**
--      (user_code = profiles.id where auth_uid = auth.uid())
--   2) avatars Storage 개방 정책 → **본인 폴더만** (0020 원형 복원)
--
-- ⚠️ notifications.insert_any 는 의도적으로 유지.
--    dispatchMessageTo(상대 user_code 로 알림 적재) 패턴이 RPC 로
--    리팩토링되기 전까지 insert 를 본인 행으로 잠그면 알림 발송 자체가
--    깨짐. P3 후속: dispatchMessageTo → security_definer RPC 함수 +
--    insert 정책 좁히기.
--
-- ⚠️ Apple TEST MODE 사용자는 auth.uid 가 없어 본 정책 하에서 알림 fetch /
--    아바타 업로드 불가. NotificationsTab 은 0 rows → mock 갤러리 폴백.
--    실 출시 후엔 Apple TEST MODE 자체를 비활성화 + 정식 Apple 로그인 전환.

-- ─────────────────────────────────────────────────────────────────────
-- 1) notifications.select — 본인 행만
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists notifications_select_any on public.notifications;
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (
    user_code in (select id from public.profiles where auth_uid = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────
-- 2) avatars Storage — 본인 폴더만 (0020 원형 복원, 0045 개방 폐기)
--
-- 경로 규약: '{auth.uid()}/avatar.jpg' + '{auth.uid()}/avatar_thumb.jpg'
-- (storage.foldername(name))[1] = auth.uid()::text 매칭으로 본인 폴더 검증.
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists "avatars p1 open insert" on storage.objects;
drop policy if exists "avatars p1 open update" on storage.objects;
drop policy if exists "avatars p1 open delete" on storage.objects;
drop policy if exists "avatar owner insert" on storage.objects;
drop policy if exists "avatar owner update" on storage.objects;
drop policy if exists "avatar owner delete" on storage.objects;

create policy "avatar owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
