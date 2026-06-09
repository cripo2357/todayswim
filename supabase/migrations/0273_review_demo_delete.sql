-- Pool's day — 데모 계정 완전 삭제 (0272 후속).
--
-- ## 배경
-- 0272는 hide(friend_request_mode='off') 버전으로 먼저 적용됨. 그러나 hide는
-- 친구 '검색'만 막을 뿐, visibility='public' 데모 일정이 실사용자에게 노출될 수
-- 있어 부적합. 이미 Apple 승인 완료(재심사 없음)라 데모 계정을 남길 이유가 없으므로
-- 완전 삭제한다. (0272는 적용 추적상 재실행되지 않으므로 별도 마이그레이션)
--
-- profiles delete → FK on delete cascade 로 friendships / friend_requests /
-- user_schedules 동반 삭제. 트리거/함수는 0272에서 이미 제거됨(안전망으로 재시도).

drop trigger if exists trg_demo_auto_accept on public.friend_requests;
drop function if exists public.demo_auto_accept_friend_request();

delete from public.profiles where is_demo;
