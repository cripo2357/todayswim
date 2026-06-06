-- Pool's day — 레거시 price_per_session 컬럼 삭제. 가격 모델을 평일/주말(+토·일)/월/회차권으로 단일화.
-- 분석(2026-06-06): pps 있는 100곳 중 85곳은 price_weekday와 동일(중복), 충돌 0곳, 15곳만 폴백 의존이나
--   그 15곳 전부 price_weekend에 값 존재 → 무손실. 앱은 formatPoolPrice가 주말-only도 표시하도록 보강(별도 커밋).
-- pools_coverage_v.missing_price가 pps를 참조하므로 뷰를 새 가격 컬럼 기준으로 재정의 후 컬럼 drop.
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
  (p.price_weekday is null and p.price_weekend is null and p.price_per_sat is null
   and p.price_per_sun is null and p.price_monthly is null and p.price_per_time is null)
                                                   as missing_price
from public.pools p
left join public.schedules s on s.pool_id = p.id;

revoke select on public.pools_coverage_v from anon, authenticated;

alter table public.pools drop column if exists price_per_session;
