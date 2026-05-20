-- Pool's day v1 — pools.free_swim_available 컬럼 추가.
-- 자유수영 자체가 가능한 풀인지 (false면 PoolBottomCard에서 "자유수영 불가능" 표시).
-- NULL = 미상 (UI에서 가능으로 간주). false = 명시적으로 불가능.

alter table public.pools
  add column if not exists free_swim_available boolean;
