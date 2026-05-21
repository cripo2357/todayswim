-- Pool's day — notifications INSERT 시 자동 OS 푸시 (pg_net, P3 마무리 2026-05-22).
--
-- 이전: dispatch.ts (클라) 의 send-push 호출만 푸시 발사. cron 함수(0086)는
-- notifications insert 만 해서 백그라운드 푸시 안 됨.
--
-- 지금: AFTER INSERT trigger 가 service_role / system 컨텍스트일 때만 pg_net
-- 으로 send-push 호출 → cron / donation_thanks trigger 등 시스템 발 알림도
-- 자동 OS 푸시.
--
-- 조건 분기 — auth.uid() 로 호출자 구분:
--   · auth.uid() IS NOT NULL  → 클라이언트 (user JWT) → trigger skip
--     (dispatch.ts 가 supabase.functions.invoke('send-push') 직접 호출 = 빠른 경로)
--   · auth.uid() IS NULL      → service_role / cron / security_definer trigger
--                              → trigger 가 pg_net 으로 push
--
-- 설정 (Supabase Studio SQL Editor 에서 1회 수동):
--   alter database postgres set "app.settings.supabase_url"      = 'https://<project>.supabase.co';
--   alter database postgres set "app.settings.service_role_key"  = '<service_role_key>';
--   -- 또는 vault:
--   -- select vault.create_secret('SERVICE_ROLE_KEY', '<key>');
--   -- (이 경우 함수에서 vault.decrypted_secrets 조회 — 본 마이그는 current_setting 패턴)
--
-- 설정 안 되면 trigger 가 silent return — 마이그 자체는 무해.

create extension if not exists pg_net;

create or replace function public.notify_push_on_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  v_supabase_url text;
  v_service_key  text;
  v_auth_uid     uuid;
  v_body_text    text;
begin
  -- 1) 클라이언트(user JWT) 호출이면 dispatch.ts 가 이미 send-push 처리 — skip.
  if auth.uid() is not null then
    return new;
  end if;

  -- 2) 본인이 본인 알림함에 적재한 (self) 경우는 OS 푸시 노이즈 → skip.
  --    cron / system 인서트는 auth.uid() null 이라 이 if 통과 안 함. 모든
  --    service_role 인서트가 의미상 "다른 사람에게 가는 알림" 으로 간주.
  --    (예외: donation_thanks trigger 는 본인에게 가는 self 알림 — 정상 푸시.)

  -- 3) Config 확인 — 설정 안 됐으면 silent return.
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_key  := current_setting('app.settings.service_role_key', true);
  if v_supabase_url is null or v_supabase_url = ''
     or v_service_key  is null or v_service_key  = '' then
    return new;
  end if;

  -- 4) user_code(profile.id) → auth_uid lookup. 없으면 push 불가 → skip.
  select auth_uid into v_auth_uid
    from public.profiles
   where id = new.user_code
   limit 1;
  if v_auth_uid is null then
    return new;
  end if;

  -- 5) body[] (string[]) → 단일 텍스트 (개행 join). 빈 줄 제외.
  select string_agg(elem, E'\n') into v_body_text
    from jsonb_array_elements_text(new.body) elem
   where length(elem) > 0;

  -- 6) pg_net.http_post — fire-and-forget. 실패 silent (네트워크 / Edge
  --    Function 응답 X 등). notifications 적재 자체는 영향 없음.
  perform net.http_post(
    url     := v_supabase_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := jsonb_build_object(
      'user_ids', jsonb_build_array(v_auth_uid::text),
      'title',    new.title,
      'body',     coalesce(v_body_text, ''),
      'data',     new.related
    )
  );

  return new;
exception
  when undefined_function then
    -- pg_net 미설치 환경. raise notice 만 남기고 silent.
    raise notice 'pg_net not available — push skipped for notification %', new.id;
    return new;
  when others then
    -- 그 외 알림 적재 자체를 막지 않도록 catch-all.
    raise notice 'notify_push_on_insert failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists trg_notify_push_on_insert on public.notifications;
create trigger trg_notify_push_on_insert
  after insert on public.notifications
  for each row execute function public.notify_push_on_insert();
