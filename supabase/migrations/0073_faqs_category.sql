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
