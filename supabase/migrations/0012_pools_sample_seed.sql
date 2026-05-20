-- Pool's day v1 — 샘플 풀 11개 시드 (UI 테스트용).
-- 컨셉: 자유수영 가능한 대형/공공 위주 + 호텔풀 1곳(분류 칩·마커 테스트).
-- 광역시 다양화 (서울 4 + 인천·부산·대전·대구·광주·경기 6 + 호텔 1) + 25m/50m 혼합.
-- 좌표는 공개된 시설 인근 근사값. 사진은 photo_url NULL (Storage 업로드 후 별도 UPDATE).
-- has_kids_pool/has_diving_pool/is_hotel_pool — 0013 마이그레이션 이후 의미 있음.
-- ON CONFLICT — 같은 ID 재실행해도 안전.

insert into public.pools (
  id, name, region, district, address, lat, lng, type, ownership,
  phone, lane_count, pool_length, depth_min, depth_max,
  facilities, has_kids_pool, has_diving_pool, is_hotel_pool,
  has_schedule, free_swim_available, price_per_session
) values
  ('POOL_SEOUL_0001', '잠실종합운동장 수영장', '서울', '송파구', '서울특별시 송파구 올림픽로 25',
    37.5159, 127.0731, 'indoor', 'public',
    '02-2240-8800', 8, 50, 1.2, 1.8,
    ARRAY['샤워실','주차장','사물함','수영용품 대여'], true, true, false,
    true, true, 6000),

  ('POOL_SEOUL_0002', '올림픽수영장', '서울', '송파구', '서울특별시 송파구 올림픽로 424',
    37.5202, 127.1213, 'indoor', 'public',
    '02-410-1114', 10, 50, 2.0, 5.0,
    ARRAY['샤워실','주차장','사물함','수영용품 대여'], false, true, false,
    true, true, 7000),

  ('POOL_SEOUL_0003', '강남스포츠문화센터 수영장', '서울', '강남구', '서울특별시 강남구 광평로31길 20',
    37.4870, 127.0993, 'indoor', 'public',
    '02-459-4711', 8, 25, 1.2, 1.5,
    ARRAY['샤워실','주차장','사물함'], true, false, false,
    true, true, 7500),

  ('POOL_SEOUL_0004', '광진구민체육센터 수영장', '서울', '광진구', '서울특별시 광진구 자양로 117',
    37.5384, 127.0824, 'indoor', 'public',
    '02-450-7800', 6, 25, 1.2, 1.5,
    ARRAY['샤워실','주차장'], true, false, false,
    true, true, 6000),

  ('POOL_INCHEON_0001', '문학박태환수영장', '인천', '미추홀구', '인천광역시 미추홀구 매소홀로 618',
    37.4364, 126.6924, 'indoor', 'public',
    '032-456-7800', 10, 50, 1.4, 2.0,
    ARRAY['샤워실','주차장','사물함','수영용품 대여'], true, true, false,
    true, true, 5000),

  ('POOL_BUSAN_0001', '사직실내수영장', '부산', '동래구', '부산광역시 동래구 사직로 45',
    35.1947, 129.0617, 'indoor', 'public',
    '051-550-1820', 8, 50, 1.3, 1.8,
    ARRAY['샤워실','주차장','사물함'], true, false, false,
    true, true, 5500),

  ('POOL_DAEJEON_0001', '충무체육관 수영장', '대전', '중구', '대전광역시 중구 대종로 488',
    36.3275, 127.4209, 'indoor', 'public',
    '042-580-4800', 6, 25, 1.2, 1.5,
    ARRAY['샤워실','주차장','사물함'], false, false, false,
    false, true, 4500),

  ('POOL_DAEGU_0001', '두류수영장', '대구', '달서구', '대구광역시 달서구 공원순환로 36',
    35.8553, 128.5570, 'outdoor', 'public',
    '053-625-3700', 8, 50, 1.0, 2.0,
    ARRAY['샤워실','주차장','매점'], true, false, false,
    false, true, 5000),

  ('POOL_GWANGJU_0001', '염주종합체육관 수영장', '광주', '서구', '광주광역시 서구 회재로 897',
    35.1371, 126.8553, 'indoor', 'public',
    '062-360-7800', 6, 25, 1.2, 1.4,
    ARRAY['샤워실','주차장'], true, false, false,
    true, true, 4500),

  ('POOL_GYEONGGI_0001', '수원종합운동장 수영장', '경기', '수원시 장안구', '경기도 수원시 장안구 경수대로 893',
    37.2862, 127.0367, 'indoor', 'public',
    '031-228-4800', 8, 50, 1.3, 1.8,
    ARRAY['샤워실','주차장','사물함','수영용품 대여'], true, false, false,
    true, true, 5500),

  -- 호텔 풀 샘플 — marker-hotel.png 분기 + 호텔 칩 테스트용.
  ('POOL_SEOUL_HOTEL_0001', '시그니엘 서울 수영장', '서울', '송파구', '서울특별시 송파구 올림픽로 300',
    37.5125, 127.1025, 'indoor', 'private',
    '02-3213-1100', 4, 25, 1.2, 1.5,
    ARRAY['샤워실','사우나','자쿠지','사물함'], false, false, true,
    false, true, 50000)
on conflict (id) do nothing;
