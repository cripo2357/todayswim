-- Pool's day — Phase 2: 큐레이션된 4개 풀만 남기고 샘플 시드 정리.
--
-- 0012_pools_sample_seed에서 들어온 11개 샘플(서울 4 + 인천/부산/대전/대구/광주/경기/호텔)을 삭제하고,
-- 0021~0041에서 운영자가 직접 등록·검수한 다음 4개만 유지:
--   - POOL_SEOUL_0005 관악구민종합체육센터 (관악구)
--   - POOL_SEOUL_0006 사당문화회관       (동작구)
--   - POOL_SEOUL_0007 영등포제2스포츠센터 (영등포구)
--   - POOL_SEOUL_0008 KBS스포츠월드      (강서구)
--
-- ## 영향 범위
--
-- - public.schedules: pool_id FK = cascade delete → 자동 정리.
-- - public.user_schedules: pool_id FK = set null (0049 설계) → 일정은 살아남고 pool_name 캐시로 표시.
-- - public.schedule_submissions / pool_submissions: 별도 정리 불필요 (운영자 영역).
--
-- ## 재실행 안전성
--
-- DELETE ... WHERE pool_id IN (...) / id IN (...) 만 사용. 이미 삭제된 행은 no-op.

-- schedules는 FK cascade로 자동 정리되지만, 의도 명확화 위해 명시.
delete from public.schedules
where pool_id in (
  'POOL_SEOUL_0001',
  'POOL_SEOUL_0002',
  'POOL_SEOUL_0003',
  'POOL_SEOUL_0004',
  'POOL_INCHEON_0001',
  'POOL_BUSAN_0001',
  'POOL_DAEJEON_0001',
  'POOL_DAEGU_0001',
  'POOL_GWANGJU_0001',
  'POOL_GYEONGGI_0001',
  'POOL_SEOUL_HOTEL_0001'
);

delete from public.pools
where id in (
  'POOL_SEOUL_0001',        -- 잠실종합운동장 (샘플)
  'POOL_SEOUL_0002',        -- 올림픽수영장 (샘플)
  'POOL_SEOUL_0003',        -- 강남스포츠문화센터 (샘플)
  'POOL_SEOUL_0004',        -- 광진구민체육센터 (샘플)
  'POOL_INCHEON_0001',      -- 문학박태환 (샘플)
  'POOL_BUSAN_0001',        -- 사직실내 (샘플)
  'POOL_DAEJEON_0001',      -- 충무체육관 (샘플)
  'POOL_DAEGU_0001',        -- 두류 (샘플)
  'POOL_GWANGJU_0001',      -- 염주종합체육관 (샘플)
  'POOL_GYEONGGI_0001',     -- 수원종합운동장 (샘플)
  'POOL_SEOUL_HOTEL_0001'   -- 시그니엘 호텔풀 (샘플)
);
