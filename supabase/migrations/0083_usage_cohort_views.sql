-- Pool's day — 사용성(약식) view 3장.
--
-- SDK·이벤트 인프라 없이 기존 테이블만으로 잡히는 한계 — 가입 코호트와
-- 마지막접속 분포까지. **본격 사용성 분석(DAU/리텐션·세션·체류·funnel)은
-- 외부 analytics 도구가 필요**하고, 그건 약관·`location_privacy_policy`
-- 톤과 맞물려 별도 결정 트랙.
--
-- 모두 service_role 전용 — `security_invoker = on` 으로 base RLS 상속.
-- auth.users 는 anon/authenticated 가 schema 'auth' 접근 권한 없어 자동 차단.

-- ─────────────────────────────────────────────────────────────────────
-- 1. signups_daily_v — 일별 신규 가입자 (KST)
-- ─────────────────────────────────────────────────────────────────────
create or replace view public.signups_daily_v
with (security_invoker = on)
as
select
  (created_at at time zone 'Asia/Seoul')::date as day,
  count(*) as signup_count
from public.profiles
group by (created_at at time zone 'Asia/Seoul')::date;

-- ─────────────────────────────────────────────────────────────────────
-- 2. signups_monthly_v — 월별 신규 가입자 (KST)
-- ─────────────────────────────────────────────────────────────────────
create or replace view public.signups_monthly_v
with (security_invoker = on)
as
select
  extract(year  from (created_at at time zone 'Asia/Seoul'))::int as year,
  extract(month from (created_at at time zone 'Asia/Seoul'))::int as month,
  count(*) as signup_count
from public.profiles
group by
  extract(year  from (created_at at time zone 'Asia/Seoul')),
  extract(month from (created_at at time zone 'Asia/Seoul'));

-- ─────────────────────────────────────────────────────────────────────
-- 3. last_seen_distribution_v — 마지막접속 분포 (auth.users 기반)
-- ─────────────────────────────────────────────────────────────────────
-- 한계: auth.users.last_sign_in_at 은 *마지막 1회*만 — true DAU 가 아닌
-- '마지막 로그인이 N일 이내인 가입자 수'. 그래도 활성/휴면 비율 가늠.
create or replace view public.last_seen_distribution_v
with (security_invoker = on)
as
select
  case
    when last_sign_in_at >= now() - interval '1 day'    then 'within_1d'
    when last_sign_in_at >= now() - interval '7 days'   then 'within_7d'
    when last_sign_in_at >= now() - interval '30 days'  then 'within_30d'
    when last_sign_in_at >= now() - interval '90 days'  then 'within_90d'
    when last_sign_in_at >= now() - interval '180 days' then 'within_180d'
    else 'dormant_180d_plus'
  end as bucket,
  count(*) as user_count
from auth.users
where last_sign_in_at is not null
group by 1;

-- ─────────────────────────────────────────────────────────────────────
-- 운영자 사용 예
-- ─────────────────────────────────────────────────────────────────────
--
--   -- 최근 30일 일별 가입 추이
--   select * from signups_daily_v
--    where day >= (now() at time zone 'Asia/Seoul')::date - 30
--    order by day desc;
--
--   -- 월별 누적 가입자 (running total)
--   select year, month, signup_count,
--          sum(signup_count) over (order by year, month) as cumulative
--     from signups_monthly_v
--    order by year, month;
--
--   -- 활성 분포
--   select bucket, user_count from last_seen_distribution_v
--    order by case bucket
--      when 'within_1d'     then 1
--      when 'within_7d'     then 2
--      when 'within_30d'    then 3
--      when 'within_90d'    then 4
--      when 'within_180d'   then 5
--      else 6
--    end;
