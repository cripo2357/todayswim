-- Pool's day — 탈퇴 "즉시 전체 파기" 전환에 따른 90일 tombstone/cron 정리.
--
-- 정책 변경(2026-06-03): 탈퇴 시 notifications + profile_nicknames 를 즉시 삭제
-- (delete-account Edge Function 3a). 따라서 0084 의 90일 보류 인프라
-- (deleted_users tombstone + cleanup_expired_data() + pg_cron 일일 스케줄)는
-- 더 이상 불필요. PIPA "지체 없는 파기" 원칙에 더 부합.
-- (후원 거래기록 5년 보존 = donation_payments, 별개로 유지.)
--
-- ⚠️ 적용 순서: delete-account Edge Function 을 먼저 재배포(즉시 삭제 버전)한 뒤
--    본 마이그레이션 실행 권장. 순서가 바뀌어도 구 함수의 tombstone insert 는
--    per-step try/catch 라 비치명적(핵심 auth 삭제는 성공).

-- 1) pg_cron 일일 스케줄 해제 (pg_cron 미활성 환경이면 skip).
do $$
begin
  if exists (select 1 from cron.job where jobname = 'cleanup_expired_data_daily') then
    perform cron.unschedule('cleanup_expired_data_daily');
  end if;
exception
  when undefined_table or undefined_function then
    raise notice 'pg_cron not available — nothing to unschedule';
end$$;

-- 2) cleanup 함수 + tombstone 테이블 제거.
drop function if exists public.cleanup_expired_data();
drop table if exists public.deleted_users;
