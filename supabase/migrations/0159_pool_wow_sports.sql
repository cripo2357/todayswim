-- Pool's day — 와우스포츠아카데미(POOL_0065) 신규. 영등포 여의도 사설, 자유수영 일일입장 개방.
-- 크리스 제공 공식 안내 캡처(2026-06-05): 자유수영 평일(월~금) 08:00~12:50 5타임(각 50분), 1일입장권 17000.
-- 사설 일일개방 → [[pool_eligibility_exceptions]] 등록 대상(성일스포렉스 0063과 동일 패턴). 25m 7레인.
-- 카카오 POI 좌표(여의도동 42-1 = 국제금융로 79). 사진 POOL_0065.jpg 업로드 후 표시.
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available,
  price_per_session, price_weekday, price_weekend, photo_url
) values
  ('POOL_0065', '와우스포츠아카데미', '서울', '영등포구',
    '서울특별시 영등포구 국제금융로 79',
    37.52060412037966, 126.93342846535543, 'indoor', 'private',
    '02-786-0955', 'http://www.wowsportsacademy.com/',
    7, 25, null, null,
    '{}', false, false, false,
    true, true,
    17000, 17000, 17000,
    'https://hldfsstyzbnqnrlqhhtc.supabase.co/storage/v1/object/public/pool-photos/POOL_0065.jpg')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0065', '풀스데이', $${
    "월": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "화": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "수": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "목": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}],
    "금": [{"start":"08:00","end":"08:50","hours":0.83},{"start":"09:00","end":"09:50","hours":0.83},{"start":"10:00","end":"10:50","hours":0.83},{"start":"11:00","end":"11:50","hours":0.83},{"start":"12:00","end":"12:50","hours":0.83}]
  }$$::jsonb, $${
    "월": "어린이 방학특강·생존수영 수업 시 자유수영 시간이 변동될 수 있습니다.",
    "화": "어린이 방학특강·생존수영 수업 시 자유수영 시간이 변동될 수 있습니다.",
    "수": "어린이 방학특강·생존수영 수업 시 자유수영 시간이 변동될 수 있습니다.",
    "목": "어린이 방학특강·생존수영 수업 시 자유수영 시간이 변동될 수 있습니다.",
    "금": "어린이 방학특강·생존수영 수업 시 자유수영 시간이 변동될 수 있습니다."
  }$$::jsonb, '2026-06-05'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0065' and exists (select 1 from public.schedules where pool_id = 'POOL_0065');
