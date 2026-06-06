-- Pool's day — pools.price_monthly 컬럼 추가. 일일권 없는 월 등록(정기) 전용 풀의 대표 월요금 표시용.
-- 배경: 일일가(price_per_session/weekday/weekend)가 전부 NULL인 월권 전용 풀(광진문화예술회관·시립구로 등)은
--   카드/리스트에서 가격이 아예 안 보여 사용자가 월권 끊을 판단 정보를 못 받았음 → 대표 월요금 1개를
--   'OO원(1개월)'으로 노출(크리스 결정 2026-06-06). 횟수별(주2/주3/주5회) 상세는 기존 day_note 유지.
alter table public.pools add column if not exists price_monthly integer;
comment on column public.pools.price_monthly is '월 등록(정기) 자유수영 대표 월요금(KRW, 쉼표 없는 정수). 일일권 없는 월권 전용 풀에서 일일가 대신 표시. 횟수별 티어 상세는 day_note.';

-- 백필: 현재 월권 전용(일일가 NULL, 월요금 day_note) 풀의 대표가(최다 빈도 정규반)
update public.pools set price_monthly = 42000 where id = 'POOL_0107'; -- 광진문화예술회관: 주3회(월수금) 성인 42,000
update public.pools set price_monthly = 66000 where id = 'POOL_0068'; -- 시립구로청소년센터: 주5회(월~금) 성인 66,000
