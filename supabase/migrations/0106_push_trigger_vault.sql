-- Pool's day — 0087 notify_push_on_insert 트리거를 vault 조회 패턴으로 교체.
--
-- 배경: 0087 는 current_setting('app.settings.supabase_url') / .service_role_key
-- 패턴이고, 그 값은 `alter database postgres set ...` 으로 주입해야 했다.
-- 그런데 Supabase managed Postgres 는 일반 사용자에게 ALTER DATABASE / ALTER
-- ROLE 의 app.settings.* 변경 권한을 막아두어 (ERROR 42501 permission denied)
-- prod 에 적용 불가.
--
-- 해결: vault.decrypted_secrets 조회로 교체. Studio SQL Editor 에서 1회만
-- 아래 명령 실행하면 secret 등록 완료.
--
--   select vault.create_secret(
--     'https://<project-ref>.supabase.co', 'supabase_url'
--   );
--   select vault.create_secret('<service_role_key>', 'service_role_key');
--
-- secret 미등록 시 트리거는 silent return — system 발 OS 푸시만 비활성, 다른
-- 기능 영향 X. (클라 dispatch.ts 가 직접 발사하는 push 는 본 트리거 무관.)

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
      from vault.decrypted_secrets
     where name = 'supabase_url'
     limit 1;
    select decrypted_secret into v_service_key
      from vault.decrypted_secrets
     where name = 'service_role_key'
     limit 1;
  exception when others then
    -- vault 자체 조회 실패 (extension 미설치 / 권한 없음).
    return new;
  end;

  if v_supabase_url is null or v_supabase_url = ''
     or v_service_key  is null or v_service_key  = '' then
    return new;
  end if;

  -- 3) user_code(profile.id) → auth_uid lookup. 없으면 push 불가 → skip.
  select auth_uid into v_auth_uid
    from public.profiles
   where id = new.user_code
   limit 1;
  if v_auth_uid is null then
    return new;
  end if;

  -- 4) body[] (string[]) → 단일 텍스트 (개행 join). 빈 줄 제외.
  select string_agg(elem, E'\n') into v_body_text
    from jsonb_array_elements_text(new.body) elem
   where length(elem) > 0;

  -- 5) pg_net.http_post — fire-and-forget. 실패 silent.
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
    raise notice 'pg_net not available — push skipped for notification %', new.id;
    return new;
  when others then
    raise notice 'notify_push_on_insert failed: %', sqlerrm;
    return new;
end;
$$;

-- 트리거 자체는 0087 에서 이미 만들었음. 함수만 교체.
