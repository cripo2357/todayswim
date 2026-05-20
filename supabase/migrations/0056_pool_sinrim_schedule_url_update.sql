-- Pool's day — Phase 2: 신림체육센터(POOL_SEOUL_0010) schedule_source_url 교체.
--
-- 0054에서 등록한 https://www.gwanakgongdan.or.kr/www/1371?document_category_srl=3 →
-- 운영자가 더 안정적인 예약 페이지로 변경:
--   https://booking.gwanakgongdan.or.kr/booking/1544
--
-- 자동 검증 배치 첫 회에서 기존 URL이 fetch_error 났음 (transient로 보였으나
-- 운영자 판단으로 booking 도메인이 더 안정).

update public.pools
set schedule_source_url = 'https://booking.gwanakgongdan.or.kr/booking/1544'
where id = 'POOL_SEOUL_0010';
