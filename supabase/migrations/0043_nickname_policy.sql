-- Pool's Day — 닉네임 정책 서버측 강제 (운영 사칭 / 욕설 차단).
--
-- 클라이언트(lib/nicknames.nicknameBlockReason)는 즉시 UX 피드백용 1차 필터.
-- 최종 권위·우회 불가 방어선은 여기: profile_nicknames INSERT 시 트리거가
-- 차단어 포함 닉네임을 거부한다. 차단어는 데이터 테이블로 관리(운영자가
-- service_role로 추가/삭제 — 코드 배포 없이 정책 갱신).

-- 차단어 레지스트리
create table if not exists public.nickname_blocklist (
  term       text primary key,
  kind       text not null check (kind in ('reserved', 'profanity')),
  created_at timestamptz not null default now()
);

alter table public.nickname_blocklist enable row level security;

-- 조회는 공개 허용(클라가 목록 동기화에 쓸 수 있게). 변경은 정책 미정의
-- → service_role(운영)만 insert/update/delete 가능.
drop policy if exists nickname_blocklist_select_any on public.nickname_blocklist;
create policy nickname_blocklist_select_any on public.nickname_blocklist
  for select using (true);

-- 초기 시드 — 클라이언트 RESERVED/PROFANITY와 동일 세트
insert into public.nickname_blocklist (term, kind) values
  ('풀스데이','reserved'),('poolsday','reserved'),('poolday','reserved'),
  ('풀스','reserved'),('pools','reserved'),('매니저','reserved'),
  ('manager','reserved'),('운영자','reserved'),('운영진','reserved'),
  ('운영팀','reserved'),('운영','reserved'),('운영측','reserved'),
  ('관리자','reserved'),('관리','reserved'),('어드민','reserved'),
  ('admin','reserved'),('administrator','reserved'),('root','reserved'),
  ('공식','reserved'),('official','reserved'),('고객센터','reserved'),
  ('고객지원','reserved'),('문의','reserved'),('support','reserved'),
  ('cs','reserved'),('스태프','reserved'),('staff','reserved'),
  ('마스터','reserved'),('master','reserved'),('시스템','reserved'),
  ('system','reserved'),('봇','reserved'),('bot','reserved'),
  ('시발','profanity'),('씨발','profanity'),('시바','profanity'),
  ('ㅅㅂ','profanity'),('병신','profanity'),('ㅂㅅ','profanity'),
  ('지랄','profanity'),('ㅈㄹ','profanity'),('개새','profanity'),
  ('새끼','profanity'),('쌍놈','profanity'),('쌍년','profanity'),
  ('썅','profanity'),('좆','profanity'),('존나','profanity'),
  ('죶','profanity'),('니미','profanity'),('보지','profanity'),
  ('자지','profanity'),('걸레','profanity'),('창녀','profanity'),
  ('엿먹','profanity'),('닥쳐','profanity'),('꺼져','profanity'),
  ('죽어','profanity'),('애미','profanity'),('느금','profanity'),
  ('느개비','profanity'),('tlqkf','profanity'),('qudtls','profanity'),
  ('wlfkf','profanity'),('fuck','profanity'),('shit','profanity'),
  ('bitch','profanity'),('asshole','profanity'),('dick','profanity'),
  ('pussy','profanity'),('fck','profanity')
on conflict (term) do nothing;

-- 정규화 후 substring 포함 검사로 차단어 매칭 시 INSERT 거부.
create or replace function public.enforce_nickname_policy()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.nickname_blocklist b
    where position(lower(b.term) in lower(new.nickname)) > 0
  ) then
    raise exception 'nickname_policy_violation: %', new.nickname
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_nickname_policy on public.profile_nicknames;
create trigger trg_enforce_nickname_policy
  before insert on public.profile_nicknames
  for each row execute function public.enforce_nickname_policy();
