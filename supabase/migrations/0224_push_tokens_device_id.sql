-- Pool's day — push_tokens.device_id 추가 + "한 기기 = 한 유저" 강제 트리거.
-- 배경(2026-06-07): 계정 전환/재설치 시 옛 토큰행이 다른 유저에 매핑된 채 남아
--   "엉뚱한 사람이 남의 푸시를 받는" 오배달 발생([[push_token_stale_cross_delivery]]).
--   expo_token unique upsert 만으론 토큰 문자열이 바뀌면(재설치 등) 옛 행이 살아남음.
-- 해법: 로그인 시 설치 단위 안정 ID(getInstallId)를 device_id 로 기록 → 트리거가
--   같은 device_id 의 다른 행(옛 토큰·옛 유저)을 자동 삭제. RLS상 클라가 타 유저 행을
--   못 지우므로 security definer 트리거로 DB에서 처리(정상 1폰 1계정 유저엔 무영향).
alter table public.push_tokens add column if not exists device_id text;
create index if not exists push_tokens_device_idx on public.push_tokens (device_id);

-- 같은 device_id 의 최신 행만 남김(방금 insert/update 된 NEW 1개). 옛 행 전부 삭제.
-- delete 는 insert/update 트리거를 재발화하지 않아 재귀 없음. device_id null(웹/레거시)은 건드리지 않음.
create or replace function public.push_tokens_one_per_device()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.device_id is not null then
    delete from public.push_tokens
     where device_id = new.device_id
       and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_push_tokens_one_per_device on public.push_tokens;
create trigger trg_push_tokens_one_per_device
  after insert or update on public.push_tokens
  for each row execute function public.push_tokens_one_per_device();
