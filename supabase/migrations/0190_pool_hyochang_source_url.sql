-- Pool's day — 효창종합사회복지관(POOL_0086) schedule_source_url 기록.
-- 크리스 제공 공식 출처(2026-06-06): hyochang.or.kr 복지관프로그램 자유수영 페이지.
-- 자동 시간표 검증(0054, Phase2 cron)이 이 URL을 재fetch해 by_day 대조 + 출처 증빙.
update public.pools set schedule_source_url = 'https://www.hyochang.or.kr/hprogram1/24586' where id = 'POOL_0086';
