-- Pool's day — 풀 "서비스 노출 on/off" 플래그.
-- is_active = false 면 클라이언트(usePools)에서 제외 → 앱 지도/목록에 표시 안 됨.
--   데이터는 삭제하지 않고 보존 → 정책 바뀌면 Studio에서 다시 true 로 토글하면 즉시 복귀.
-- 운영 관리: 별도 관리 UI 없이 Supabase Studio 테이블 에디터에서 is_active 컬럼 토글.
--   (스키마 추가만 마이그레이션, 개별 풀 on/off 는 Studio UPDATE — db_modification_policy)
--
-- 1차 적용: 호텔 부속 수영장(is_hotel_pool)은 당분간 서비스에 활용하지 않으므로 전부 off.

alter table public.pools
  add column if not exists is_active boolean not null default true;

comment on column public.pools.is_active is
  '서비스 노출 여부. false면 앱(usePools)에서 숨김. 데이터는 보존. 운영자 Studio 토글로 관리.';

-- 호텔 풀은 당분간 서비스 미노출 (멱등 — 호텔 풀이 없으면 0행 영향)
update public.pools
  set is_active = false
  where is_hotel_pool;
