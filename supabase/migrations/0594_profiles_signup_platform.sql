-- 0594 — profiles.signup_platform: 이 사용자가 어느 스토어로 들어왔나.
--
-- 기기 OS 가 곧 스토어다(ios = App Store, android = Google Play). 전에는 이 값이
-- push_tokens.platform 에만 남아서, 알림 권한을 거부한 가입자는 경로를 알 수 없었다.
--
-- 처음 한 번만 쓴다 — 클라이언트가 `signup_platform is null` 조건으로만 UPDATE 하므로
-- 나중에 다른 기기로 로그인해도 덮이지 않는다.
-- 이 컬럼이 생기기 전 가입자는 다음 앱 실행 때 채워지므로 "가입 기기"가 아니라
-- "처음 확인된 기기"다(두 기기를 쓰는 사람만 어긋날 수 있다).

alter table public.profiles
  add column if not exists signup_platform text
  check (signup_platform in ('ios', 'android', 'web'));

comment on column public.profiles.signup_platform is
  '가입(또는 처음 확인된) 기기 OS — ios=App Store, android=Google Play. 한 번 쓰면 덮지 않는다.';
