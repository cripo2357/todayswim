-- Pool's day — 약관 버전 관리 + 동의 이력 (Phase 2 초안 / 미적용).
--
-- ⚠️ Phase 2 설계 초안. 아직 적용하지 말 것.
--   현행(P1)은 src/lib/terms.ts 가 AsyncStorage 에 "기기 단위"로 service /
--   privacy_consent 동의 시각만 저장한다(계정 아님). 본 스키마 활성화 시
--   클라이언트를 "계정 단위 + 버전 고정 + 철회 이벤트"로 이관해야 한다.
--   docs/SPEC.md §8.2 및 사용자 합의 설계 기준.
--
-- 약관 5종(앱 TermsKey ↔ 본 type enum):
--   service        ↔ service          서비스 이용약관           (가입 필수 동의)
--   privacyConsent ↔ privacy_consent  개인정보 수집·이용 동의   (가입 필수 동의)
--   privacyPolicy  ↔ privacy_policy   개인정보 처리방침         (고지=통지, 동의 대상 아님)
--   location       ↔ location         위치기반서비스 이용약관   (가입 필수 동의)
--   marketing      ↔ marketing        마케팅 정보 수신 동의     (선택 동의)
-- ※ 가입 게이트 필수 동의는 위 3개(service/privacy_consent/location) +
--   '만 14세 이상' 연령확인(약관 문서 아님, 클라이언트 게이트 — 본 테이블
--   대상 아님). 마케팅만 선택.
--
-- 설계 원칙:
--   1) 문서/버전 마스터(terms)와 동의 이력(terms_agreements) 분리.
--   2) 동의 이력은 append-only 감사 로그 — UPDATE/DELETE 금지(법적 증빙).
--   3) 동의 시점 버전을 문자열로 고정 보관(약관 개정과 무관하게 불변 스냅샷).
--   4) 약관 개정 = terms 새 row(새 version), is_active 1건으로 교체 → 필수
--      약관의 active version 이 올라가면 클라이언트가 재동의 유도.
--   5) 철회(action='withdraw')도 이벤트로 적재 — on/off 덮어쓰기 금지.
--   6) RLS 는 P1 개방형(submissions/notifications)과 달리 본인 행 한정 —
--      법적 개인정보라 실 Supabase Auth(auth.uid) 전제. (Google/Kakao 실인증,
--      Apple 목업 제외.)

-- ① 약관 문서·버전 마스터 ---------------------------------------------------
create table if not exists public.terms (
  id               uuid primary key default gen_random_uuid(),
  type             text not null check (type in
                     ('service','privacy_consent','privacy_policy',
                      'location','marketing')),
  version          text not null,                       -- 예 '1.0.0'
  effective_date   date not null,                       -- 시행일
  -- 섹션 배열 [{title, body}, ...] — src/lib/termsContent.ts sections 구조와 1:1.
  content          jsonb not null,
  -- 가입 게이트 필수 동의 여부 (service/privacy_consent/location=true,
  --   marketing=false[선택], privacy_policy=false[고지]).
  is_required      boolean not null default true,
  -- 동의 대상 여부 — privacy_policy 는 '통지' 문서라 false(동의 행 미생성).
  requires_consent boolean not null default true,
  -- 현재 게시(효력) 버전 여부. type 별 1건만 true.
  is_active        boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (type, version)
);

-- type 별 활성(게시) 버전은 동시에 1개만.
create unique index if not exists terms_one_active_per_type
  on public.terms (type) where is_active;

-- ② 동의 이력 — append-only 감사 로그 ---------------------------------------
create table if not exists public.terms_agreements (
  id            uuid primary key default gen_random_uuid(),
  -- 실 인증 사용자(Phase 2). 계정 삭제 시 동의 이력도 파기 —
  --   법적 보존(legal hold)이 필요하면 정책에 따라 CASCADE 재검토.
  user_id       uuid not null references auth.users(id) on delete cascade,
  terms_type    text not null check (terms_type in
                  ('service','privacy_consent','privacy_policy',
                   'location','marketing')),
  -- 동의 시점 버전 고정(법적 증빙). terms(type,version)을 가리키나 약관 row
  --   삭제로 이력이 깨지면 안 되므로 FK 미설정 — 문자열 스냅샷으로 불변 보관.
  terms_version text not null,
  action        text not null check (action in ('agree','withdraw')),
  -- (선택) 동의 정황 — ip/user_agent 등. 미사용 시 빈 객체.
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists terms_agreements_user_idx
  on public.terms_agreements (user_id, terms_type, created_at desc);

-- 현재 동의 상태 — 유저·약관별 최신 이벤트 1건(파생 뷰, 별도 상태컬럼 없음).
create or replace view public.terms_agreement_current as
select distinct on (user_id, terms_type)
  user_id, terms_type, terms_version, action, created_at
from public.terms_agreements
order by user_id, terms_type, created_at desc;

-- RLS ----------------------------------------------------------------------
alter table public.terms enable row level security;
alter table public.terms_agreements enable row level security;

-- 약관 문서: 전체 read(게시본 열람). write 정책 없음 → service_role(운영자)만.
drop policy if exists terms_read_all on public.terms;
create policy terms_read_all on public.terms
  for select using (true);

-- 동의 이력: 본인 행만 read/insert. UPDATE/DELETE 정책 없음 = 불변(append-only).
drop policy if exists terms_agreements_select_own on public.terms_agreements;
create policy terms_agreements_select_own on public.terms_agreements
  for select using (auth.uid() = user_id);

drop policy if exists terms_agreements_insert_own on public.terms_agreements;
create policy terms_agreements_insert_own on public.terms_agreements
  for insert with check (auth.uid() = user_id);
