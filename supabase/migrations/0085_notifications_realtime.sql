-- Pool's day — notifications 테이블 realtime 활성화 (P3 후속, 2026-05-22).
--
-- 이전: NotificationsTab 이 useNotifications hook 으로 60s staleTime polling.
-- 새 알림 도착 / read 갱신을 사용자가 인지하려면 ≤60s 지연.
--
-- 지금: Supabase Postgres realtime — INSERT/UPDATE 이벤트 즉시 클라이언트
-- 구독. 새 알림 적재 시 즉시 카드 등장, 다른 기기에서 read 처리 시 dot
-- 즉시 사라짐.
--
-- 정책:
--   · publication 'supabase_realtime' 에 notifications 추가
--   · 클라이언트 측 channel.on('postgres_changes') 으로 user_code 필터 구독
--   · query invalidate 패턴 — fetch 결과로 갱신 (channel payload 직접 사용 X)
--
-- ⚠️ Supabase 무료 tier 도 realtime 200 동시 연결까지 무료. 출시 후 사용량
--    체크 필요.

-- Supabase 는 보통 `supabase_realtime` publication 을 디폴트로 생성하지만
-- 일부 환경에선 빠져 있을 수 있어 IF NOT EXISTS 패턴 안전.
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end$$;

-- notifications 가 publication 에 이미 포함됐는지 확인 후 추가.
do $$
begin
  if not exists (
    select 1
      from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end$$;
