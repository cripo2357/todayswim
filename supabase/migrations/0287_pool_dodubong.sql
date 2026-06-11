-- Pool's day — 도두봉실내수영장(제주시 도두, 사설) 등록. POOL_0227.
--
-- ## 출처 [1차 — 운영자 캡처]
-- 크리스가 현장 공식 안내판('자유 수영 시간 안내')+공식 요금표 캡처 제공(2026-06-12).
-- 안내판과 요금표의 자유수영 시간이 일치 → 그대로 반영. 사설이나 자유수영 일일입장 운영하므로 등록 적합.
--
-- ## 데이터
-- - 휴무 월요일 → 화~일 운영(평일=화~금, 주말=토·일).
-- - 자유수영: 평일 08–10·12–14 / 주말 06–08·12–14·19–21 (마감 10분 전 퇴장).
-- - 일일입장료 비회원 성인 10,000(어린이 8,000)·회원 성인 6,000 → price=비회원 성인 10,000(평일·주말 동일).
--   월 회원권(주중/주말 분리)은 스키마 단순화 위해 미반영.
-- - 레인/길이/수심: 안내판·공식 미표기 → null(추후 보강).
-- - 좌표: 카카오 Local API(지번·POI 약 10m 일치). prod 직접 적용 완료, 파일은 기록용.
--
-- ## 같은 확인에서 제외 확정
-- - 서귀포홍리실내수영장: 자유수영 운영 안 함(크리스 확인 2026-06-12) → 등록 제외.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0227', '도두봉실내수영장', '제주', '제주시', '제주특별자치도 제주시 서해안로 202',
    33.5062768216452, 126.470005058515, 'indoor', 'private',
    '064-742-0133', 'https://doduswim.com', null, null, null, null,
    '{}', false, false, false,
    true, true, 10000, 10000, null, 'https://doduswim.com')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0227', '풀스데이', $${"화":[{"start":"08:00","end":"10:00","hours":2},{"start":"12:00","end":"14:00","hours":2}],"수":[{"start":"08:00","end":"10:00","hours":2},{"start":"12:00","end":"14:00","hours":2}],"목":[{"start":"08:00","end":"10:00","hours":2},{"start":"12:00","end":"14:00","hours":2}],"금":[{"start":"08:00","end":"10:00","hours":2},{"start":"12:00","end":"14:00","hours":2}],"토":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"19:00","end":"21:00","hours":2}],"일":[{"start":"06:00","end":"08:00","hours":2},{"start":"12:00","end":"14:00","hours":2},{"start":"19:00","end":"21:00","hours":2}]}$$::jsonb, '{}'::jsonb, '2026-06-12'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0227' and exists (select 1 from public.schedules where pool_id = 'POOL_0227');
