-- Pool's day — 제주 코오롱위탁 2곳(서부·동부)+혁신도시 요금·규격·시간표 보강. 2026-06-12.
--
-- ## 출처 [1차 — 크리스 제공 + jeju-sporex.com 교차확인]
-- - POOL_0218 서부국민체육센터: 일일 자유수영 성인 2,000, 수심 1.5m. 코오롱스포렉스 위탁.
-- - POOL_0219 동부국민체육센터: 일일 2,000, 유아풀 보유. **시간표 정정** — psf 등록값(평일10–15·주말휴관)은
--   구 정보였고, 코오롱 위탁 실제 운영은 평일 06–21·주말 08–18·월휴관(jeju-sporex.com 직접 확인과 일치).
-- - 서부·동부 공통: 평일 06–12·14–21 / 주말 08–12·14–18 (정비 12–14), 월휴관 → by_day 교체.
-- - POOL_0220 제주혁신도시복합혁신센터: 일일 자유수영 성인 3,000, 수심 1m(1~3레인)/1.5m(4~8레인). 시간표 기존 유지.
-- prod 직접 적용 완료, 파일은 기록용.

update public.pools set price_weekday = 2000, price_weekend = 2000, depth_min = 1.5, depth_max = 1.5 where id = 'POOL_0218';
update public.schedules set by_day = $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"08:00","end":"12:00","hours":4},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"08:00","end":"12:00","hours":4},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, updated_at = '2026-06-12'::timestamptz where pool_id = 'POOL_0218';

update public.pools set price_weekday = 2000, price_weekend = 2000, has_kids_pool = true where id = 'POOL_0219';
update public.schedules set by_day = $${"화":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"수":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"목":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"금":[{"start":"06:00","end":"12:00","hours":6},{"start":"14:00","end":"21:00","hours":7}],"토":[{"start":"08:00","end":"12:00","hours":4},{"start":"14:00","end":"18:00","hours":4}],"일":[{"start":"08:00","end":"12:00","hours":4},{"start":"14:00","end":"18:00","hours":4}]}$$::jsonb, updated_at = '2026-06-12'::timestamptz where pool_id = 'POOL_0219';

update public.pools set price_weekday = 3000, price_weekend = 3000, depth_min = 1, depth_max = 1.5 where id = 'POOL_0220';
