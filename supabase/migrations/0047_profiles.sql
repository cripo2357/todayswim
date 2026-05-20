-- Pool's day — Phase 2 첫 마이그레이션: profiles 본체 테이블.
--
-- P1까지 프로필 본체는 클라이언트 로컬(AsyncStorage)이었음(0019 주석 참고).
-- P2 진입 — 사람 그래프의 SSOT(profiles → friends → 친구 일정/알림)를 위해
-- 본체를 서버로 옮긴다. 이번 단계는 "profiles만" — friends/blocks는 후속.
--
-- ## 설계 결정
--
-- 1) **PK = `id text`** (6자리 친구코드, profile.id).
--    - mock-auth 단계라 auth.uid 가 아직 없음. notifications(0042) / profile_nicknames(0019)
--      가 이미 user_code(친구코드) 기반이라 일관.
--    - 실 auth 진입 시 `auth_uid uuid references auth.users(id) unique` 컬럼을 별도
--      마이그레이션으로 추가 + 가입 후 binding. 친구코드는 표시·식별·공유용으로 유지.
--
-- 2) **RLS = P1 톤** (`(true)` for select/insert/update).
--    - 친구코드 알면 누구나 read — notifications/profile_nicknames와 동일 정책.
--    - 실 auth 진입 시 update를 `auth.uid() = auth_uid` 본인 행만으로 하드닝.
--    - delete 정책 없음 → service_role만(운영 탈퇴 처리).
--
-- 3) **컬럼 매핑** = UserProfile(src/store/profile.ts) 1:1.
--    - enum/배열은 Postgres 제약 없이 `text`/`text[]`/`jsonb` — 클라이언트가 단일
--      진실원본 enum 선언(Stroke/Certification/IM100Record/Gender). 운영자가
--      Dashboard에서 임의 값 넣을 가능성보다, 클라이언트 enum 변경 시 매번
--      마이그레이션 부담을 줄이는 게 P2 단계 비용 절감.
--
-- 4) **lesson_pool_id FK** → `pools(id) on delete set null` — 풀이 운영자에 의해
--    삭제돼도 프로필은 살아남고 lesson 표기만 비움. lesson_pool_name 캐시도 보존
--    하되, 풀이 살아있으면 클라이언트 join으로 최신 이름 우선.
--
-- 5) **친구코드 변경(regenerateId) 처리**: PK가 친구코드라 변경 = 새 row insert +
--    옛 row의 참조 정리. P2 첫 단계엔 friends/notifications 외부 참조가 아직
--    없어 옛 row를 그대로 두어도 무해. 후속 friends 마이그레이션에서 친구코드
--    변경 시 cascade/migrate 정책 별도 결정.

create table if not exists public.profiles (
  id                  text        primary key,
  -- 핵심 식별/표시
  nickname            text        not null,
  gender              text        not null,           -- 'male' | 'female' | 'other'
  birth_date          text        not null,           -- YYYY-MM-DD
  -- 수영 메타
  experience_years    integer     not null default 0, -- 0~30 (30 = "30년 이상")
  strokes             text[]      not null default '{}'::text[], -- Stroke enum
  bio                 text,                            -- 내 소개 (클라 max 20자)
  certifications      text[]      not null default '{}'::text[], -- Certification enum
  im100_record        text,                            -- IM100Record enum
  -- 사진/아바타 — 번들 AvatarId / 업로드 URL / 소셜 URL 통합 저장(text)
  photo_uri           text,
  photo_thumb_uri     text,
  -- 레슨
  swim_classes        jsonb       not null default '[]'::jsonb, -- [{id,day,start,end}]
  lesson_pool_id      text        references public.pools(id) on delete set null,
  lesson_pool_name    text,
  -- 공개 토글 (undefined=클라 기본값으로 해석. DB는 명시 boolean.)
  show_service_years  boolean     not null default true,
  show_strokes        boolean     not null default true,
  show_certs          boolean     not null default false,
  show_im100          boolean     not null default true,
  show_swim_classes   boolean     not null default true,
  -- 타임스탬프
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 닉네임 부분일치 검색용 — friend search seam(src/lib/friendSearch.ts)의 P2 교체 대상.
-- pg_trgm 미사용(인덱스 부담), 일단 단순 컬럼 인덱스로 prefix 검색만 빠르게.
create index if not exists profiles_nickname_idx on public.profiles (nickname);

-- updated_at 자동 갱신 트리거 — 클라이언트가 잊어도 서버가 보장.
create or replace function public.profiles_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.profiles_set_updated_at();

-- RLS — P1 톤(공개 read, 누구나 insert/update). 실 auth 진입 시 강화.
alter table public.profiles enable row level security;

drop policy if exists profiles_select_any on public.profiles;
create policy profiles_select_any on public.profiles
  for select using (true);

drop policy if exists profiles_insert_any on public.profiles;
create policy profiles_insert_any on public.profiles
  for insert with check (true);

drop policy if exists profiles_update_any on public.profiles;
create policy profiles_update_any on public.profiles
  for update using (true) with check (true);
-- delete 정책 없음 → service_role 전용.
