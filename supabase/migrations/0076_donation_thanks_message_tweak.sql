-- Pool's day — donation_thanks 본문 2번째 줄 톤 다듬기.
--
-- 변경(2026-05-21 크리스):
--   "Pool's day 운영에 소중히 쓰일게요. 감사합니다."  →  "운영에 소중히 쓸게요."
--
-- 의도: 수동형 "쓰일게요" → 운영자(서비스) 입장의 능동형 "쓸게요" 로 인격적
-- 인사. "Pool's day" 주어 + 끝 "감사합니다." 는 1번째 줄에서 닉네임 + 도착
-- 알림으로 이미 컨텍스트가 있으므로 중복 정리해 간결화.
--
-- trigger 함수 두 곳(send_donation_thanks · send_donation_thanks_on_match)
-- 모두 갱신. 0075 이전 row(옛 문구로 적재된) 도 UPDATE 로 일괄 정정.

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
    '운영에 소중히 쓸게요.'
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
    '운영에 소중히 쓸게요.'
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

-- 기존 row 일괄 정정 — body[1] (2번째 줄) 을 새 문구로 교체.
update public.notifications
set body = jsonb_set(body, '{1}', '"운영에 소중히 쓸게요."'::jsonb)
where kind = 'donation_thanks';
