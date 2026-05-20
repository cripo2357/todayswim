-- Pool's day v1 — pool_submissions에 상세 필드 추가 (Figma 90:7386 재기획).
-- 사용자가 추가 요청 시 보낼 수 있는 정보:
--   - lane_count: 레인 개수 (옵션)
--   - pool_length: 25 / 50 (필수, 라디오)
--   - depth_min / depth_max: 최저/최대 수심 m (옵션)
--   - has_kids_pool / has_diving_pool / is_hotel_pool: 옵션 분류 (boolean)
-- 좌표는 운영자 검수 단계에서 처리 (사용자 부담 X 원칙 유지).

alter table public.pool_submissions
  add column if not exists lane_count integer,
  add column if not exists pool_length integer
    check (pool_length is null or pool_length in (25, 50)),
  add column if not exists depth_min numeric(3, 1),
  add column if not exists depth_max numeric(3, 1),
  add column if not exists has_kids_pool boolean default false,
  add column if not exists has_diving_pool boolean default false,
  add column if not exists is_hotel_pool boolean default false;
