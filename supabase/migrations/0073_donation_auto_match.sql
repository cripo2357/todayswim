-- Pool's day — Phase 3: donation_payments 입금자명 자동 매칭.
--
-- ## 정정 사유
--
-- 0070/0072에서 운영자가 매번 `select id from profiles where nickname='X'`로
-- profile_id를 조회해 INSERT 컬럼에 박는 흐름이었음. 크리스 정정(2026-05-21):
--
--   "입금 쿼리에서 id가 왜 필요해 닉네임만 있으면 되잖아"
--
-- → 운영자는 depositor_name(=입금자명=닉네임)만 INSERT, 트리거가 자동으로
-- profile_id를 채운다. 매칭 실패 시 profile_id는 NULL로 남고, 이후 운영자가
-- 수동 UPDATE 시점에 send_donation_thanks_on_match 트리거가 발화한다.
--
-- ## 동작 순서 (donation_payments INSERT 시)
--
-- 1. BEFORE INSERT — match_donor_profile_id: profile_id NULL이고 depositor_name
--    이 있으면 profiles.nickname 으로 매칭 시도. 성공 시 NEW.profile_id 자동 채움.
-- 2. AFTER INSERT — send_donation_thanks (0072): profile_id 확정되면 donations
--    자동 row 생성 + notifications 'donation_thanks' 적재.
--
-- ## 새 운영자 절차 (간소화)
--
-- insert into public.donation_payments (depositor_name, amount, received_at)
-- values ('입금자명', 10000, now());
--
-- — id 조회 없음. 매칭 실패 시 row에 profile_id NULL만 남고 알림 미발송 →
-- 운영자가 닉네임 오타·탈퇴 확인 후 별도 UPDATE.

create or replace function public.match_donor_profile_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.profile_id is null and new.depositor_name is not null then
    select id into new.profile_id
      from public.profiles
      where nickname = new.depositor_name
      limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_match_donor_profile_id on public.donation_payments;
create trigger trg_match_donor_profile_id
  before insert on public.donation_payments
  for each row execute function public.match_donor_profile_id();
