-- Pool's day — 알림 카테고리 푸시 게이팅 (앱 토글이 실제 푸시를 막게).
--
-- 배경: 알림 설정 화면 5개 토글(+마케팅)은 로컬(AsyncStorage)에만 있어 서버
-- send-push 가 못 봐서, 토글이 푸시를 실제로 게이팅하지 못했다. 또 처리결과·
-- 서비스안내·수영리포트 카테고리는 푸시 발송 경로 자체가 없었다.
--
-- 이 마이그레이션:
--  1) profiles.notif_prefs (jsonb) — 앱 토글의 서버 미러. send-push 가 읽어 게이팅.
--  2) notifications.category (text) — 메시지의 게이팅 카테고리(dispatch/트리거 적재).
--  3) notify_push_on_insert 트리거 — send-push 호출 body 에 category 전달.

-- 1) 알림 토글 서버 미러. 가입 기본: 5종 ON, 마케팅 OFF(정통망법 §50).
alter table public.profiles
  add column if not exists notif_prefs jsonb not null default
    '{"push_on":true,"friend":true,"schedule":true,"submission":true,"service":true,"report":true,"marketing":false}'::jsonb;

-- 2) 푸시 게이팅 카테고리. 적재 시 dispatch.ts(클라) 또는 트리거가 채움.
--    값: friend|schedule|submission|service|report|marketing|none (null=레거시).
alter table public.notifications
  add column if not exists category text;

-- 3) 0106 notify_push_on_insert 갱신 — send-push body 에 category 추가(게이팅용).
--    (서버/cron 적재분만 이 트리거가 푸시. 클라 적재분은 dispatch.ts 가 직접 호출.)
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

  -- 2) Vault 에서 secret 조회. 미등록 / 권한 없음 시 silent return.
  begin
    select decrypted_secret into v_supabase_url
      from vault.decrypted_secrets where name = 'supabase_url' limit 1;
    select decrypted_secret into v_service_key
      from vault.decrypted_secrets where name = 'service_role_key' limit 1;
  exception when others then
    return new;
  end;

  if v_supabase_url is null or v_supabase_url = ''
     or v_service_key  is null or v_service_key  = '' then
    return new;
  end if;

  -- 3) user_code(profile.id) → auth_uid lookup. 없으면 push 불가 → skip.
  select auth_uid into v_auth_uid
    from public.profiles where id = new.user_code limit 1;
  if v_auth_uid is null then
    return new;
  end if;

  -- 4) body[] (string[]) → 단일 텍스트 (개행 join). 빈 줄 제외.
  select string_agg(elem, E'\n') into v_body_text
    from jsonb_array_elements_text(new.body) elem
   where length(elem) > 0;

  -- 5) pg_net.http_post — fire-and-forget. category 전달(send-push 가 게이팅).
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
      'data',     new.related,
      'category', new.category
    )
  );

  return new;
exception
  when undefined_function then
    raise notice 'pg_net not available — push skipped for notification %', new.id;
    return new;
  when others then
    raise notice 'notify_push_on_insert failed: %', sqlerrm;
    return new;
end;
$$;
