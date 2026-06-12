-- '수영 일정 초대 안 받기'(profiles.schedule_invite='off') 사용자에게는
-- schedule_invites 행 생성도 DB 레벨에서 차단한다. (0278 의 일정초대 테이블판)
--
-- 배경: 0278 은 invite_received '알림'만 막았다. 0296 에서 초대 관계를 영속화하는
-- schedule_invites 테이블이 생기면서, 초대 안 받기 유저에게도 클라(createInvites)가
-- pending 행을 직접 insert 할 수 있게 됐다. 그러면 알림은 안 가도 72h 뒤
-- expire_schedule_invites() 가 양측에 'invite_auto_expired' 를 보내 → 차단했어야 할
-- 유저가 "초대 만료" 푸시를 받는 누수. 0278 과 동일하게 단일 방어선(DB 트리거)로 막는다.
--
-- 동작: BEFORE INSERT 트리거가 NEW.invitee_id 의 schedule_invite='off' 면 RETURN NULL
-- 로 조용히 스킵(에러 없음 → 발신 클라는 성공으로 보지만 행은 안 생긴다). 배치 insert 중
-- opted-out 인 행만 드롭, 나머지는 정상. security definer 로 invitee 설정 조회.
-- schedule_invite NULL/미설정 = 기본 'on'(차단 안 함).

create or replace function public.block_schedule_invite_if_opted_out()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  if (
    select schedule_invite from public.profiles where id = NEW.invitee_id
  ) = 'off' then
    return null; -- 초대 안 받기 → 행 생성 스킵
  end if;
  return NEW;
end;
$func$;

drop trigger if exists trg_block_schedule_invite_if_opted_out on public.schedule_invites;
create trigger trg_block_schedule_invite_if_opted_out
  before insert on public.schedule_invites
  for each row execute function public.block_schedule_invite_if_opted_out();