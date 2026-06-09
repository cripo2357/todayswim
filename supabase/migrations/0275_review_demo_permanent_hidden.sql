-- Pool's day — 데모 계정을 "영구 + 실사용자 비노출"로 전환.
--
-- ## 배경
-- 매 릴리스마다 데모 계정을 seed(심사 전)→delete(승인 후) 반복하던 수작업을
-- 없앤다. 데모 계정을 영구 유지하되 실사용자에겐 안 보이게 설정:
--   1) friend_request_mode='id' → 닉네임 검색에서 사라짐. 정확한 6자리 코드
--      (DEMO11~16, 글자에 O·1 포함 = 실코드 생성/추측 불가)로만 찾아짐.
--   2) 데모 일정 visibility='friends' → 친구만 노출. 심사관은 자동수락으로
--      친구가 되어 보지만, 실사용자는 친구가 아니라 못 봄.
--   3) 자동수락 트리거는 0274에서 만든 것 그대로 유지(코드로 찾은 심사관만 친구됨).
--
-- 이후 심사 때마다 아무 조치 불필요. 심사 노트는 "코드 DEMO11로 검색"으로 안내.

-- 1) 닉네임 검색에서 숨김 (코드 전용)
update public.profiles
  set friend_request_mode = 'id'
  where is_demo;

-- 2) 데모 일정 친구 전용(실사용자 비노출)
update public.user_schedules
  set visibility = 'friends'
  where profile_id in (select id from public.profiles where is_demo);

-- 트리거/함수는 0274에서 생성됨 — 변경 없음(영구 유지).
