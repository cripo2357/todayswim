-- Pool's day — donation 카드 디폴트 메시지 = 10개 후보 중 랜덤.
--
-- 변경(2026-05-21 크리스):
--   기존 단일 디폴트 'Pool''s day를 응원합니다.' 만 박히면 카드 목록이
--   똑같이 보여 어색. 응원/감사/일상/추천/보탬 톤 섞은 10개 풀 중 랜덤 1개.
--
-- 사용자는 본인 카드에서 그대로 두거나 "문구 수정" 으로 자유 변경.
-- 알림 본문(`body[1]` "Pool's day 운영에 소중히 쓸게요. 고맙습니다.") 은
-- 별개 — 운영자 → 후원자 인사라 고정 유지.
--
-- trigger 함수 두 곳(send_donation_thanks · send_donation_thanks_on_match)
-- 모두 갱신.

create or replace function public.send_donation_thanks()
returns trigger
language plpgsql
security definer
as $$
declare
  v_nickname text;
  v_body jsonb;
  v_messages text[] := array[
    'Pool''s day를 응원합니다.',
    '앞으로도 계속 응원할게요!',
    'Pool''s day 화이팅!',
    '좋은 서비스 만들어주셔서 감사해요.',
    '잘 사용하고 있어요. 응원합니다.',
    '좋은 서비스라 더 잘 됐으면 좋겠어요.',
    'Pool''s day 덕분에 수영이 더 즐거워졌어요.',
    '수영 친구들에게도 추천 중이에요.',
    '매일 잘 쓰고 있어요. 감사합니다.',
    '작은 도움이지만 보탬이 되길 바라요.'
  ];
  v_default_message text;
begin
  if new.profile_id is null then
    return new;
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

  -- 랜덤 1개 픽 — array 1-indexed, random() ∈ [0,1) → [1, N].
  v_default_message := v_messages[1 + floor(random() * array_length(v_messages, 1))::int];

  insert into public.donations (profile_id, message, hidden)
  values (new.profile_id, v_default_message, false);

  v_body := jsonb_build_array(
    coalesce(v_nickname, '회원') || '님의 후원이 도착했어요.',
    'Pool''s day 운영에 소중히 쓸게요. 고맙습니다.'
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
  v_messages text[] := array[
    'Pool''s day를 응원합니다.',
    '앞으로도 계속 응원할게요!',
    'Pool''s day 화이팅!',
    '좋은 서비스 만들어주셔서 감사해요.',
    '잘 사용하고 있어요. 응원합니다.',
    '좋은 서비스라 더 잘 됐으면 좋겠어요.',
    'Pool''s day 덕분에 수영이 더 즐거워졌어요.',
    '수영 친구들에게도 추천 중이에요.',
    '매일 잘 쓰고 있어요. 감사합니다.',
    '작은 도움이지만 보탬이 되길 바라요.'
  ];
  v_default_message text;
begin
  if old.profile_id is not null or new.profile_id is null then
    return new;
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

  v_default_message := v_messages[1 + floor(random() * array_length(v_messages, 1))::int];

  insert into public.donations (profile_id, message, hidden)
  values (new.profile_id, v_default_message, false);

  v_body := jsonb_build_array(
    coalesce(v_nickname, '회원') || '님의 후원이 도착했어요.',
    'Pool''s day 운영에 소중히 쓸게요. 고맙습니다.'
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
