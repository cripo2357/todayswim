-- Pool's day — 타인 친구 수 RPC (security definer).
--
-- friendships SELECT는 0093에서 owner-only(본인 관련 행만)로 강화돼, 클라가 타인
-- 프로필의 친구 수를 직접 count 못 함(0~1만 보임). 행을 노출하지 않고 숫자만
-- 돌려주는 security definer 함수로 정확한 친구 수 제공(OtherUserProfile 화면).
--
-- friendships는 양방향 2행 구조라 profile_id=대상 행 수 = 그 사람의 친구 수.

create or replace function public.friend_count(p_profile_id text)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::int
  from public.friendships
  where profile_id = p_profile_id;
$$;

-- 익명/인증 사용자 모두 호출 가능(숫자만 반환 — 민감정보 없음).
grant execute on function public.friend_count(text) to anon, authenticated;
