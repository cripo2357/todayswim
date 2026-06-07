-- Pool's day — 동대문야외수영장(POOL_0110) 전체 삭제.
-- 크리스 결정(2026-06-07): 등록 철회. 0229에서 추가했던 풀·시간표를 모두 제거.
-- schedules(FK) 먼저 삭제 후 pools 삭제.
delete from public.schedules where pool_id = 'POOL_0110';
delete from public.pools where id = 'POOL_0110';
