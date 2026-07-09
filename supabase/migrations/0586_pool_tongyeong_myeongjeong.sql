-- Pool's day — 통영수영장(POOL_0894) 신규. 경남 통영시 명정동, 공공(통영관광개발공사 TTDC), 자유수영 일일입장.
-- 크리스 제공 운영자 공식 안내판 캡처(1차, 2026-07-09). 옛 남망(동호동 230-1) 50m 풀은 폐쇄되고 명정동 886-3에 신축된 현 통영수영장.
-- 성인 자유수영: 월~금 06:00~11:40·13:00~15:50·17:00~20:30 / 토 09:00~11:30·13:00~17:30 / 일 휴관.
-- 제외: 수질정화 12:00~13:00, 어린이 강습(월~금) 16:00~16:50 성인 입장 불가.
-- 일일요금 일반4000·군인/청소년3500·어린이/경로3000. 규격(레인/길이)은 안내판 미기재→null(백필 대상). 좌표=카카오 POI(명정동 886-3).
insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, website, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_weekday, price_weekend, photo_url, schedule_source_url
) values
  ('POOL_0894', '통영수영장', '경남', '통영시', '경상남도 통영시 명정동 886-3',
   34.858677829342064, 128.41331989200148, 'indoor', 'public',
   null, 'https://corp.ttdc.kr', null, null, null, null,
   '{}', false, false, false,
   true, true, 4000, 4000, null, 'https://corp.ttdc.kr')
on conflict (id) do nothing;
insert into public.schedules (pool_id, author_nickname, by_day, day_notes, updated_at) values
  ('POOL_0894', '풀스데이', $${
    "월":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"15:50","hours":2.83},{"start":"17:00","end":"20:30","hours":3.5}],
    "화":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"15:50","hours":2.83},{"start":"17:00","end":"20:30","hours":3.5}],
    "수":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"15:50","hours":2.83},{"start":"17:00","end":"20:30","hours":3.5}],
    "목":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"15:50","hours":2.83},{"start":"17:00","end":"20:30","hours":3.5}],
    "금":[{"start":"06:00","end":"11:40","hours":5.67},{"start":"13:00","end":"15:50","hours":2.83},{"start":"17:00","end":"20:30","hours":3.5}],
    "토":[{"start":"09:00","end":"11:30","hours":2.5},{"start":"13:00","end":"17:30","hours":4.5}]
  }$$::jsonb, $${
    "월":"12:00~13:00 수질정화, 16:00~16:50 어린이 강습 시간엔 성인 자유수영이 불가합니다.",
    "화":"12:00~13:00 수질정화, 16:00~16:50 어린이 강습 시간엔 성인 자유수영이 불가합니다.",
    "수":"12:00~13:00 수질정화, 16:00~16:50 어린이 강습 시간엔 성인 자유수영이 불가합니다.",
    "목":"12:00~13:00 수질정화, 16:00~16:50 어린이 강습 시간엔 성인 자유수영이 불가합니다.",
    "금":"12:00~13:00 수질정화, 16:00~16:50 어린이 강습 시간엔 성인 자유수영이 불가합니다.",
    "토":"12:00~13:00 수질정화 시간엔 성인 자유수영이 불가합니다."
  }$$::jsonb, '2026-07-09'::timestamptz)
on conflict (pool_id) do nothing;
update public.pools set has_schedule = true where id = 'POOL_0894' and exists (select 1 from public.schedules where pool_id = 'POOL_0894');
