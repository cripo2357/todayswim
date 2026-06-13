-- 프로필 몸무게(kg, 자연수) — 선택 입력. 칼로리 계산에만 사용.
-- 가입 때 안 받고 로그인 후 프로필에서만 입력. 미입력=null('정보 없음' 표시).
-- smallint(0~32767)로 충분.
alter table public.profiles
  add column if not exists weight smallint;