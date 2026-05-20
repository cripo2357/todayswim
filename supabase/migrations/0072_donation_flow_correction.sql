-- Pool's day — Phase 3: 후원 흐름 정정 (사용자 직접 작성 X / 운영자 자동 등록).
--
-- ## 정정 사유
--
-- 0070에서 trigger가 'donation_thanks' notifications만 insert했음. 사용자가 직접
-- DonationScreen에서 응원 메시지를 작성하는 흐름이었음. 크리스 정정(2026-05-21):
--
--   "사용자가 직접 응원 작성 X. 운영자가 입금 확인 후 닉네임 매칭으로
--    후원자 목록에 자동 등록(응원 문구도 자동 생성), 감사 알림도 같이 발송.
--    사용자는 추후 본인 카드의 문구를 수정하거나 비공개 처리 가능."
--
-- ## 이번 0072가 하는 것
--
-- send_donation_thanks / send_donation_thanks_on_match 함수 CREATE OR REPLACE.
-- INSERT/매칭 시점에 다음 두 가지를 같이 적재:
--
-- 1. **`donations` row** — 기본 메시지 'Pool''s day를 응원합니다.' 로 자동 생성.
--    사용자가 추후 message UPDATE 또는 hidden=true 토글 가능.
-- 2. **`notifications` row** — 'donation_thanks' 본인 알림함 (기존과 동일).
--
-- ## 비공개(hidden) 의미 정정
--
-- 0069에서 hidden=true는 "본인만 보임"이었으나 정정 후엔 **본인도 안 보이는
-- 실질적 삭제** 효과. 클라이언트 dedupeDonationsForDisplay 가 hidden true 행을
-- 모두 제외. DB 정책은 그대로(이력은 보존, 표시만 제외).

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
    return new; -- 매칭 전이면 보류, 매칭 UPDATE 시 발화.
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

  -- 1) 응원 카드 자동 생성. 사용자는 본인 카드에서 문구 수정/비공개 가능.
  insert into public.donations (profile_id, message, hidden)
  values (new.profile_id, 'Pool''s day를 응원합니다.', false);

  -- 2) 감사 알림.
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
    '[]'::jsonb,
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
    return new; -- 이미 매칭됐던 row UPDATE는 중복 방지.
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

  -- 매칭 시점에도 동일하게 응원 카드 자동 생성 + 감사 알림.
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
    '[]'::jsonb,
    jsonb_build_object('paymentId', new.id, 'amount', new.amount)
  );

  return new;
end;
$$;
