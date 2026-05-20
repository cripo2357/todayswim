-- Pool's day — Phase 3: donation_payments 테이블 + 자동 감사 알림 트리거.
--
-- ## 운영자 입금 확인 프로세스
--
-- 1. 운영자가 카카오뱅크 입금 확인 (입금자명 = 사용자 닉네임 규칙).
-- 2. Supabase Dashboard에서 입금자명으로 profile 매칭:
--    `select id from public.profiles where nickname = '입금자명';`
-- 3. donation_payments INSERT (depositor_name + amount + received_at + profile_id):
--    `insert into public.donation_payments
--       (profile_id, depositor_name, amount, received_at)
--     values ('XXXXXX', '입금자명', 10000, now());`
-- 4. 트리거가 자동으로 notifications에 'donation_thanks' 적재 → 사용자 알림함 표시.
--
-- 매칭 실패(닉네임 변경/탈퇴/오타) 시 profile_id null로 insert만 — 운영자가 추후
-- 수동 매칭 후 UPDATE.
--
-- ## RLS — service_role 전용
--
-- 입금 정보(금액·입금자명)는 사용자에게 미노출. 운영자만 Dashboard에서 service_role
-- 권한으로 처리. anon/authenticated 모든 액션 막힘.

create table if not exists public.donation_payments (
  id              uuid        primary key default gen_random_uuid(),
  profile_id      text        references public.profiles(id)
                                on update cascade on delete set null,
  depositor_name  text        not null,
  amount          integer     not null check (amount > 0),
  received_at     timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists donation_payments_profile_idx
  on public.donation_payments (profile_id, received_at desc);
create index if not exists donation_payments_received_idx
  on public.donation_payments (received_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- 자동 감사 알림 트리거 — donation_payments INSERT 시 'donation_thanks'
-- notifications row 생성. profile_id가 매칭됐을 때만 (null이면 운영자가
-- 추후 매칭 UPDATE → 그 시점에도 알림 발송).
-- ─────────────────────────────────────────────────────────────────────
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
    return new; -- 매칭 전이면 알림 보류, 운영자가 매칭 UPDATE 시 발화.
  end if;

  -- 발송 시점 닉네임 스냅샷 — 추후 닉네임 변경돼도 알림 본문은 보존.
  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

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

drop trigger if exists trg_send_donation_thanks_on_insert on public.donation_payments;
create trigger trg_send_donation_thanks_on_insert
  after insert on public.donation_payments
  for each row execute function public.send_donation_thanks();

-- profile_id null → not null UPDATE(나중 매칭) 시에도 알림 발화.
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
    return new; -- 이미 매칭됐던 row UPDATE는 알림 중복 방지.
  end if;

  select nickname into v_nickname
    from public.profiles
    where id = new.profile_id;

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

drop trigger if exists trg_send_donation_thanks_on_match on public.donation_payments;
create trigger trg_send_donation_thanks_on_match
  after update on public.donation_payments
  for each row execute function public.send_donation_thanks_on_match();

-- ─────────────────────────────────────────────────────────────────────
-- RLS — service_role 전용. 사용자에게 입금 정보 노출 X.
-- ─────────────────────────────────────────────────────────────────────
alter table public.donation_payments enable row level security;
-- 정책 미정의 → anon/authenticated 모든 액션 차단. service_role만 RLS 우회.
