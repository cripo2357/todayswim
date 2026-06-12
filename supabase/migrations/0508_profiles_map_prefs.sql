-- 지도 설정(시작 풀·친구/사람들 일정 지평선) 서버 미러 — 재설치/기기변경 복구.
--
-- 0269(공개·일정초대) / 0195(notif_prefs) / 0225(friend_request_mode) 와 동일 패턴:
-- 명시적 변경 시 클라(prefs setter)가 push, 로그인 후 prefs.serverSync 가 restore.
-- 값은 클라 enum(친구='d1'/'h12'/'h6'/'h3'/'off', 사람들='d1'/'h12'/'h6'/'off')과
-- 풀 id(text). 서버는 보관만 — 유효성 검증은 클라(*_HORIZON_VALUES)가 한다.
-- RLS 는 기존 profiles update 정책(auth_uid 본인)으로 충분.

alter table public.profiles
  add column if not exists map_start_pool_id text;
alter table public.profiles
  add column if not exists map_friend_horizon text;
alter table public.profiles
  add column if not exists map_public_horizon text;