-- Pool's day — 무안종합스포츠파크실내수영장(POOL_0182) 수심 백필 (크리스 캡처).
-- 캡처: 성인풀 1.3~1.5m, 유아풀 1m, 25m×8레인. 성인풀 기준 1.3~1.5 백필.
-- 이로써 전라도 14곳(POOL_0170~0183) 규격(레인·길이·수심) 전부 완비.
update public.pools
set depth_min = 1.3, depth_max = 1.5
where id = 'POOL_0182';
