-- Pool's day — donation 누적 집계 view 2장.
--
-- 운영자가 "크게 도움 주신 분" 식별 / 연도별 운영 보고용. 사용자 노출 X
-- (donation_payments RLS = service_role 전용이고, view에 security_invoker=on
-- 을 걸어 base table 권한을 그대로 상속).
--
-- ## 1. donation_totals_v — 종합 누적 (profile_id 단위 전체 기간 합계)
-- ## 2. donation_yearly_totals_v — 연도별 누적 (KST 기준 year × profile_id)
--
-- 연도 기준은 Asia/Seoul. UTC 그대로 쓰면 연말연시 입금이 한 해 어긋남.
--
-- profile_id IS NULL row (미매칭 입금) 는 그대로 한 그룹으로 묶임 — 운영자가
-- "미매칭 합계가 얼마인지" 도 같은 쿼리로 볼 수 있음.
--
-- ## 운영자 사용 예
--
--   -- 종합 큰손 Top 20
--   select p.nickname, t.total_amount, t.payment_count, t.last_at
--     from donation_totals_v t
--     left join profiles p on p.id = t.profile_id
--    order by t.total_amount desc nulls last
--    limit 20;
--
--   -- 2026년 누적 Top 20
--   select p.nickname, y.total_amount, y.payment_count
--     from donation_yearly_totals_v y
--     left join profiles p on p.id = y.profile_id
--    where y.year = 2026
--    order by y.total_amount desc
--    limit 20;

create or replace view public.donation_totals_v
with (security_invoker = on)
as
select
  profile_id,
  sum(amount)::bigint as total_amount,
  count(*)            as payment_count,
  min(received_at)    as first_at,
  max(received_at)    as last_at
from public.donation_payments
group by profile_id;

create or replace view public.donation_yearly_totals_v
with (security_invoker = on)
as
select
  profile_id,
  extract(year from (received_at at time zone 'Asia/Seoul'))::int as year,
  sum(amount)::bigint as total_amount,
  count(*)            as payment_count,
  min(received_at)    as first_at,
  max(received_at)    as last_at
from public.donation_payments
group by
  profile_id,
  extract(year from (received_at at time zone 'Asia/Seoul'));
