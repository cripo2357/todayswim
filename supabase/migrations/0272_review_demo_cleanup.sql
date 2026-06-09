-- Pool's day — App Store 승인 후 "데모 계정 정리".
--
-- ## 배경
-- 0266에서 심사(Guideline 2.1)용 example 계정 6개(DEMO11~16) + 친구요청
-- 자동수락 트리거를 넣었음. 2026-06-09 Apple 승인 완료(eligible for distribution).
-- 실사용자가 가짜 자동수락 계정을 만나지 않도록 승인 직후 정리한다.
--
-- ## 정리 내용 (계정/일정은 보존, 검색·자동수락만 비활성)
-- 1) 자동수락 트리거 + 함수 제거 → 더 이상 자동으로 친구 안 맺힘.
-- 2) 데모 계정 friend_request_mode='off' → 검색(닉네임·코드)에 안 뜸.
--    (search_friends_by_nickname / find_friend_by_code 가 off 제외, 0225)
-- is_demo 컬럼·계정 행·일정은 그대로 둠(무해, 추후 필요 시 별도 삭제).

-- 1) 자동수락 트리거 + 함수 제거
drop trigger if exists trg_demo_auto_accept on public.friend_requests;
drop function if exists public.demo_auto_accept_friend_request();

-- 2) 데모 계정 검색 숨김
update public.profiles
  set friend_request_mode = 'off'
  where is_demo;

-- ── 완전 삭제를 원하면(나중에) 아래 주석 해제하여 별도 적용 ──
--   delete from public.user_schedules where profile_id like 'DEMO1%';
--   delete from public.profiles where is_demo;  -- friendships/요청은 cascade
