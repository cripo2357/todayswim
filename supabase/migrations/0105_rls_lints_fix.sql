-- Pool's day — Supabase 보안 lints 정리.
--
-- Studio Table Editor 에서 빨간 ⚠️ + UNRESTRICTED 라벨 붙은 객체들 일괄 정합:
--
-- 1) View 7개: `security_invoker = true` 토글
--    - 기본값(SECURITY DEFINER)은 view 소유자(superuser) 권한으로 실행 →
--      underlying 테이블 RLS 우회. INVOKER 로 바꾸면 호출자 권한으로 실행되어
--      underlying 테이블 RLS 가 그대로 적용됨.
--    - Postgres 15+ 표준 옵션. underlying 테이블의 RLS 정책이 이미 잘 박혀있어서
--      view 만 토글하면 정합 회복.
--
-- 2) nickname_blocklist: RLS enable (0043 에서 이미 enable + select-any 정책.
--    dev/prod 분리 전 마이그레이션이라 prod 에 빠져있을 수 있어 idempotent 재적용.)
--
-- 멱등성: 모든 명령이 alter (no-op safe) + drop/create policy (재실행 안전).

begin;

-- 1) View security_invoker 토글
alter view public.last_seen_distribution_v       set (security_invoker = true);
alter view public.pool_submissions_stats_v       set (security_invoker = true);
alter view public.schedule_submissions_stats_v   set (security_invoker = true);
alter view public.signups_daily_v                set (security_invoker = true);
alter view public.signups_monthly_v              set (security_invoker = true);
alter view public.terms_consent_v                set (security_invoker = true);
alter view public.terms_agreement_current        set (security_invoker = true);

-- 2) nickname_blocklist RLS 보강 (0043 정책 재선언 — prod 누락분 흡수)
alter table public.nickname_blocklist enable row level security;

drop policy if exists nickname_blocklist_select_any on public.nickname_blocklist;
create policy nickname_blocklist_select_any on public.nickname_blocklist
  for select using (true);
-- write 정책 미정의 = service_role(운영자) 만 insert/update/delete.

commit;
