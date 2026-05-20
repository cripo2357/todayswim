-- Pool's day — donation_thanks 알림에 '내 응원글 보기' 액션 버튼 추가.
--
-- 0072 trigger 함수가 actions = '[]' 빈 배열로 적재했음. NotificationsTab 의
-- 알림 카드에 본인 후원 화면으로 이동하는 버튼이 없었음. 사용자 정정(2026-05-21):
-- "후원 감사 메시지에 본인 응원글로 갈 수 있는 버튼 넣어주는건 어때?"
--
-- 0072의 send_donation_thanks / send_donation_thanks_on_match 함수를
-- CREATE OR REPLACE 로 갱신. actions 값에 ['내 응원글 보기'] 추가.
-- 다른 로직(매칭, donations row 자동 생성, body 본문)은 동일 유지.
--
-- 클라이언트 NotificationsTab.handleAction 이 label '내 응원글 보기' +
-- kind 'donation_thanks' 매칭 시 navigation.navigate('Donation') 호출.
--
-- 이전 row(0072 적용 후 적재된 row)는 actions=[] 그대로 — 신규 row만 새
-- 액션 포함. (필요 시 별도 UPDATE 가능하나 사용자 카드 자동 갱신이 더
-- 자연스러우므로 우선 신규만.)

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
    jsonb_build_array('내 응원글 보기'),
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
    jsonb_build_array('내 응원글 보기'),
    jsonb_build_object('paymentId', new.id, 'amount', new.amount)
  );

  return new;
end;
$$;
