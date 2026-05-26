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

-- ─────────────────────────────────────────────────────────────────────
-- 합병 (옛 0073_faqs_category): prefix 중복 회피 + 의존 순서 유지.
-- ─────────────────────────────────────────────────────────────────────
-- Pool's day — FAQ 카테고리 컬럼 추가 + 분류 (Figma 245:5819 탭 그룹).
--
-- 처음 / 정보 / 활동 / 설정 4그룹으로 UI 탭 필터링.
-- 키는 영문 enum, 화면 라벨은 클라이언트에서 한글 매핑.
--
--   first    — 가입·계정 라이프사이클 (서비스 소개, 로그인, 약관, 닉네임,
--               친구 ID, 로그아웃, 탈퇴)
--   info     — 수영장·시간표 조회 (지도, 필터, 즐겨찾기, 요금, 시간표, 제보)
--   activity — 일정·친구·레슨 인터랙션 (일정 추가/완료/초대, 친구 추가/차단/삭제,
--               레슨 등록/해제)
--   settings — 프로필·공개범위·알림·개인정보 (프로필 수정/공개, 친구 신청
--               받기, 레슨 가시성, 알림 토글, 위치·사진 권한, 개인정보)

alter table public.faqs
  add column if not exists category text not null
    default 'first'
    check (category in ('first', 'info', 'activity', 'settings'));

create index if not exists faqs_category_idx
  on public.faqs (category, sort_order asc);

-- 0072 시드 44개 분류. sort_order 기준으로 UPDATE.
-- (sort_order 가 0072 시드의 안정적 키 — 운영자가 별도 행 추가했더라도 영향 X)

-- 처음 (8): 1-6, 43, 44
update public.faqs set category = 'first'
  where sort_order in (1, 2, 3, 4, 5, 6, 43, 44);

-- 정보 (12): 12-21, 41, 42
update public.faqs set category = 'info'
  where sort_order in (12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 41, 42);

-- 활동 (11): 22-27, 29-32, 34
update public.faqs set category = 'activity'
  where sort_order in (22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 34);

-- 설정 (13): 7-11, 28, 33, 35-40
update public.faqs set category = 'settings'
  where sort_order in (7, 8, 9, 10, 11, 28, 33, 35, 36, 37, 38, 39, 40);
