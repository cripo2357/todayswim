-- Pool's day — donation_thanks 액션 라벨 '내 응원글 보기' → '응원글 보기'.
--
-- 0074에서 박은 라벨이 길다는 사용자 정정(2026-05-21):
--   "버튼명 '내 응원글 보기' 너무 길어. 기존 다른 메시지들의 버튼텍스트와 결을 맞추자."
--
-- 다른 트리거의 액션 라벨 톤(`일정 보기`, `약관 보기`, `근처 수영장 보기`)
-- 과 결을 맞춰 '응원글 보기'로 정정. trigger 함수의 actions JSON 갱신.
--
-- 옛 row(0074로 적재된 row)는 actions=['내 응원글 보기'] 그대로 — 본 마이그
-- 에서 UPDATE로 일괄 정정.

create or replace function public.send_donation_thanks()
returns trigger
language plpgsql
security definer
as $$
declare
  v_nickname text;
  v_body jsonb;
begin
  if new.profile_id is null then
    return new;
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

  insert into public.donations (profile_id, message, hidden)
  values (new.profile_id, 'Pool''s day를 응원합니다.', false);

  v_body := jsonb_build_array(
    coalesce(v_nickname, '회원') || '님의 후원이 도착했어요.',
    'Pool''s day 운영에 소중히 쓰일게요. 감사합니다.'
  );

  insert into public.notifications (user_code, kind, title, body, params, actions, related)
  values (
    new.profile_id,
    'donation_thanks',
    '후원 감사 인사',
    v_body,
    jsonb_build_object('name', coalesce(v_nickname, '')),
    jsonb_build_array('응원글 보기'),
    jsonb_build_object('paymentId', new.id, 'amount', new.amount)
  );

  return new;
end;
$$;

create or replace function public.send_donation_thanks_on_match()
returns trigger
language plpgsql
security definer
as $$
declare
  v_nickname text;
  v_body jsonb;
begin
  if old.profile_id is not null or new.profile_id is null then
    return new;
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

  insert into public.donations (profile_id, message, hidden)
  values (new.profile_id, 'Pool''s day를 응원합니다.', false);

  v_body := jsonb_build_array(
    coalesce(v_nickname, '회원') || '님의 후원이 도착했어요.',
    'Pool''s day 운영에 소중히 쓰일게요. 감사합니다.'
  );

  insert into public.notifications (user_code, kind, title, body, params, actions, related)
  values (
    new.profile_id,
    'donation_thanks',
    '후원 감사 인사',
    v_body,
    jsonb_build_object('name', coalesce(v_nickname, '')),
    jsonb_build_array('응원글 보기'),
    jsonb_build_object('paymentId', new.id, 'amount', new.amount)
  );

  return new;
end;
$$;

-- 기존 row 일괄 정정 — actions 에 '내 응원글 보기' 가 있는 row 를 '응원글 보기' 로.
update public.notifications
set actions = jsonb_build_array('응원글 보기')
where kind = 'donation_thanks'
  and actions @> '["내 응원글 보기"]'::jsonb;
