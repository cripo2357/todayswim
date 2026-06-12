-- Pool's day — 제주 규격 추가 검증분. 2026-06-12.
-- psf.kr 1차로 검증된 길이만 반영:
--   동부국민체육센터 25m(psf "25m×5레인"), 외도실내수영장 51m(psf "경영장 비정규 51m×11m").
-- 외도는 비정규 51m 정확값 유지(50으로 왜곡 X). 필터를 마커와 동일 >=50 기준으로 바꿔(poolFilter.ts)
-- 51m도 '50m' 필터에 잡히게 함.
-- 보류(검증 실패/출처 불명): 애월 6레인(→4레인이 맞음, 제주시국민과 혼동), 서귀포국민·동부·표선면 수심,
--   서귀포시민·해돋이·표선면 레인 — 2차 출처에도 근거 없어 미반영.
update public.pools set pool_length = 25 where id = 'POOL_0219';
update public.pools set pool_length = 51 where id = 'POOL_0269';
