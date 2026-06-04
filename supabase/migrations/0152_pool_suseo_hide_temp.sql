-- Pool's day — 시립수서청소년센터(POOL_0050) 임시 숨김.
-- 0147이 임시 좌표(강남스포츠문화센터 근사)로 적용돼 지도에서 강남스포츠와 핀이 겹침.
-- 카카오 쿼터 401로 정확 좌표를 못 뽑는 동안, 잘못된 위치 노출 대신 is_active=false로 숨김.
-- ★자정 카카오 리셋 후: ① 광평로 144 좌표 UPDATE ② is_active=true 복구.

update public.pools set is_active = false where id = 'POOL_0050';
