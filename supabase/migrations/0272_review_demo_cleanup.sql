-- Pool's day — App Store 승인 후 "데모 계정 완전 삭제".
--
-- ## 배경
-- 0266에서 심사(Guideline 2.1)용 example 계정 6개(DEMO11~16) + 친구요청
-- 자동수락 트리거를 넣었음. 2026-06-09 Apple 승인 완료(eligible for distribution).
-- 이미 승인되어 재심사가 없으므로 데모 계정을 남길 이유가 없음 → 완전 삭제.
-- (hide=mode='off'는 친구 '검색'만 막을 뿐, visibility='public' 데모 일정이
--  실사용자에게 노출될 수 있어 부적합. 삭제가 정답.)
--
-- ## 삭제 내용
-- 1) 자동수락 트리거 + 함수 제거.
-- 2) 데모 계정(is_demo) profiles 삭제 → FK on delete cascade 로
--    friendships / friend_requests / user_schedules 자동 정리.
-- (is_demo 컬럼은 무해하므로 보존. 필요 시 후속에서 drop.)

-- 1) 자동수락 트리거 + 함수 제거
drop trigger if exists trg_demo_auto_accept on public.friend_requests;
drop function if exists public.demo_auto_accept_friend_request();

-- 2) 데모 계정 완전 삭제 (cascade로 친구관계·요청·일정 동반 삭제)
delete from public.profiles where is_demo;
