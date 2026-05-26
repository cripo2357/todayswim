-- Pool's day — P3 prod 분리 전 인덱스 보강 (2026-05-26).
--
-- 분석: 자주 쓰이는 WHERE/ORDER BY 패턴 중 인덱스 누락 2건 발견.
-- (다른 핵심 컬럼은 0042/0047/0048/0049/0059/0070 에서 이미 커버.)
--
-- 1) notifications 미읽 알림 조회
--    쿼리: WHERE user_code=$1 AND read=false ORDER BY created_at DESC
--    기존: (user_code, created_at desc) — read 필터 X, 읽은 알림까지 풀스캔.
--    추가: 부분 인덱스 (user_code, created_at desc) WHERE read=false
--          → 미읽 행만 인덱싱 → 더 작고 빠름.
--
-- 2) friend_requests 72h 만료 cron
--    쿼리(0086 cron): WHERE status='pending' AND created_at < now() - 72h
--    기존: friend_requests_pending_uq 는 partial unique on (from,to) — dedup
--          용도이고 created_at 시간 비교에는 도움 안 됨.
--    추가: 부분 인덱스 (created_at) WHERE status='pending'
--          → 매 시간 cron 이 pending 전체 풀스캔 회피.

create index if not exists notifications_user_unread_idx
  on public.notifications (user_code, created_at desc)
  where read = false;

create index if not exists friend_requests_pending_created_idx
  on public.friend_requests (created_at)
  where status = 'pending';
