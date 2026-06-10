-- '수영 일정 초대 안 받기'(profiles.schedule_invite='off') 사용자에게는
-- invite_received 알림 적재를 DB 레벨에서 차단한다.
--
-- 배경: 초대장은 클라(dispatchMessageTo)가 notifications 에 직접 insert 한다.
-- "초대 안 받기" 설정을 화면(앱)에서만 거르면 옛 앱 버전·우회로 뚫린다. 모든
-- 앱 버전에 즉시 강제하려면 서버(DB 트리거)가 단일 방어선이어야 한다.
--
-- 동작: BEFORE INSERT 트리거가 kind='invite_received' 이고 수신자
-- (NEW.user_code = profiles.id)의 schedule_invite='off' 면 RETURN NULL 로
-- 조용히 스킵(에러 없음 → 발신 클라는 성공으로 보지만 행은 안 생긴다).
-- security definer: 발신자(inviter)가 수신자 schedule_invite 를 RLS 로 못 읽어도
-- 트리거는 소유자 권한으로 조회. schedule_invite NULL/미설정은 기본 'on' 취급
-- (= 차단 안 함, 초대 수신).

create or replace function public.block_invite_if_opted_out()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.kind = 'invite_received' then
    if (
      select schedule_invite from public.profiles where id = NEW.user_code
    ) = 'off' then
      return null; -- 초대 안 받기 → 적재 스킵
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_block_invite_if_opted_out on public.notifications;
create trigger trg_block_invite_if_opted_out
  before insert on public.notifications
  for each row execute function public.block_invite_if_opted_out();
