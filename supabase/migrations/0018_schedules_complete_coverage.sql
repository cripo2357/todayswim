-- Pool's Day v1 — 정책: 자유수영 시간표 없는 수영장은 등록 X.
-- 기존 샘플 풀 중 시간표 미등록 3곳(충무체육관/두류/시그니엘)에 시간표 추가 + has_schedule=true 갱신.

-- 1) schedules INSERT — pool_id PK, ON CONFLICT do nothing.
insert into public.schedules (pool_id, author_nickname, by_day, updated_at) values
  -- 충무체육관 (대전 25m) — 평일 새벽+저녁
  ('POOL_DAEJEON_0001', '대전수영러', $${
    "월": [{"start":"06:00","end":"08:00","hours":2}, {"start":"19:00","end":"21:00","hours":2}],
    "화": [{"start":"06:00","end":"08:00","hours":2}, {"start":"19:00","end":"21:00","hours":2}],
    "수": [{"start":"06:00","end":"08:00","hours":2}, {"start":"19:00","end":"21:00","hours":2}],
    "목": [{"start":"06:00","end":"08:00","hours":2}, {"start":"19:00","end":"21:00","hours":2}],
    "금": [{"start":"06:00","end":"08:00","hours":2}],
    "토": [{"start":"09:00","end":"12:00","hours":3}],
    "일": []
  }$$::jsonb, '2026-05-05'::timestamptz),

  -- 두류 (대구 outdoor 50m) — 여름 시즌형 (평일+주말 풍성)
  ('POOL_DAEGU_0001', '대구야외수영', $${
    "월": [{"start":"10:00","end":"18:00","hours":8}],
    "화": [{"start":"10:00","end":"18:00","hours":8}],
    "수": [{"start":"10:00","end":"18:00","hours":8}],
    "목": [{"start":"10:00","end":"18:00","hours":8}],
    "금": [{"start":"10:00","end":"19:00","hours":9}],
    "토": [{"start":"09:00","end":"20:00","hours":11}],
    "일": [{"start":"09:00","end":"20:00","hours":11}]
  }$$::jsonb, '2026-05-04'::timestamptz),

  -- 시그니엘 (서울 호텔 25m) — 평일 새벽+저녁, 주말 종일 운영
  ('POOL_SEOUL_HOTEL_0001', '시그니엘투숙객', $${
    "월": [{"start":"06:00","end":"09:00","hours":3}, {"start":"18:00","end":"22:00","hours":4}],
    "화": [{"start":"06:00","end":"09:00","hours":3}, {"start":"18:00","end":"22:00","hours":4}],
    "수": [{"start":"06:00","end":"09:00","hours":3}, {"start":"18:00","end":"22:00","hours":4}],
    "목": [{"start":"06:00","end":"09:00","hours":3}, {"start":"18:00","end":"22:00","hours":4}],
    "금": [{"start":"06:00","end":"09:00","hours":3}, {"start":"18:00","end":"22:00","hours":4}],
    "토": [{"start":"08:00","end":"22:00","hours":14}],
    "일": [{"start":"08:00","end":"22:00","hours":14}]
  }$$::jsonb, '2026-05-03'::timestamptz)
on conflict (pool_id) do nothing;

-- 2) 두류는 outdoor + 시즌제 운영 안내문구 (참고용)
update public.schedules set day_notes = $${
  "월": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능.",
  "화": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능.",
  "수": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능.",
  "목": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능.",
  "금": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능.",
  "토": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능.",
  "일": "여름 시즌(6~8월) 한정 운영. 우천 시 단축 가능."
}$$::jsonb where pool_id = 'POOL_DAEGU_0001';

-- 3) pools.has_schedule 동기화 — 시간표 가진 풀은 모두 true.
update public.pools
set has_schedule = true
where id in (select pool_id from public.schedules);
