-- Pool's day — 온보딩 완료(profiles INSERT) 시 운영자 폰으로 푸시 알림.
--
-- 신규 유저가 프로필을 생성(=닉네임 등 입력 끝, 진짜 유저)하면 운영자(cripo2357)의
-- 등록 기기로 Expo Push API 직접 호출해 푸시 발송. **외부 서비스/키/Vault 전부 불필요**
-- (Expo Push 엔드포인트는 인증키 없이 수신 토큰만으로 발송 — send-push 와 동일 경로).
--
-- 가입(auth.users) 아닌 온보딩 완료 시점이라 봇·중도이탈은 자동 제외되고,
-- 알림에 닉네임을 담을 수 있다.
--
-- ── 안전 설계 ──────────────────────────────────────────────────
--  · SECURITY DEFINER — push_tokens/auth.users 읽기 + net.http_post 권한.
--  · 함수 전체 EXCEPTION 캐치 → 알림 실패가 절대 프로필 생성을 막지 않음.
--  · 운영자 토큰 없으면 조용히 no-op. 운영자 기기 여러 대면 전 기기 발송.

create extension if not exists pg_net;

-- 구버전(가입 시점·메일) 정리 — 폐기. (이전 dev 적용분 잔존 객체 포함)
drop trigger if exists on_auth_user_created_notify on auth.users;
drop function if exists public.notify_new_user_email();
drop function if exists public.notify_new_user_signup();

create or replace function public.notify_new_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_uid uuid;
  v_tokens    text[];
begin
  select id into v_admin_uid
    from auth.users where email = 'cripo2357@gmail.com' limit 1;
  if v_admin_uid is null then
    return new;
  end if;

  select array_agg(expo_token) into v_tokens
    from public.push_tokens where user_id = v_admin_uid;
  if v_tokens is null or array_length(v_tokens, 1) is null then
    return new; -- 운영자 토큰 없음 → no-op.
  end if;

  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := (
      select jsonb_agg(jsonb_build_object(
        'to', t,
        'title', '🏊 풀스데이 새 유저!',
        'body', coalesce(new.nickname, '(닉네임 없음)') || ' 님이 가입했어요',
        'sound', 'default',
        'data', jsonb_build_object('kind', 'admin_new_user', 'profile_id', new.id)
      ))
      from unnest(v_tokens) as t
    )
  );

  return new;
exception when others then
  return new; -- 어떤 오류도 프로필 생성을 막지 않는다.
end;
$$;

drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute function public.notify_new_profile();
