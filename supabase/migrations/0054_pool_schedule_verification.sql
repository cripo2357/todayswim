-- Pool's day — Phase 2: 자동 시간표 검증 시스템 Phase 1 (스키마 선투자).
--
-- ## 목적
--
-- Phase 2 (풀 30개+ 시점)에 도입할 자동 시간표 검증 시스템(GitHub Actions cron
-- → schedule_source_url fetch → Claude API로 by_day 추출 → diff → 변경 시
-- GitHub Issue 자동 생성 → cripo2357@gmail.com 알림)을 위한 데이터 구조 선투자.
--
-- 지금 도입하는 이유: 풀 100개 시점에 마이그레이션하면 모든 풀 URL 재수집 부담.
-- 등록 시점에 URL 함께 잡아두는 게 가장 저렴.
--
-- ## 컬럼
--
-- - pools.schedule_source_url text  : 시간표 1차 출처 URL (공식 시설관리공단 등).
--                                      사진 출처 또는 미상이면 NULL → 자동 체크 스킵.
-- - schedules.last_verified_at      : 마지막 검증 시각. 자동 체크 후 변동 없으면 갱신,
--                                      변동 있으면 운영자 확인 후 by_day와 함께 갱신.
--
-- ## 정책 (Phase 2 도입 시)
--
-- - 자동 변경 X. LLM이 추출한 diff는 알림만, 적용은 운영자 컨펌 후 마이그레이션.
-- - URL 404/접속 실패 = "URL 변경 가능성" Issue로 별도 알림 → 운영자 새 URL 등록.
-- - NULL URL은 자동 체크 스킵 + 사진 출처는 별도 주기(반년?)로 운영자 수동 재검증.

alter table public.pools
  add column if not exists schedule_source_url text;

comment on column public.pools.schedule_source_url is
  '자유수영 시간표 1차 출처 URL (공식 시설관리공단 페이지 등). NULL = 사진 출처 또는 미상.';

alter table public.schedules
  add column if not exists last_verified_at timestamptz not null default now();

comment on column public.schedules.last_verified_at is
  '시간표 마지막 검증 시각. Phase 2 자동 체크가 변동 없을 때 이 시각만 갱신.';

-- 신규 3개 풀 URL 적재 (이번 세션에 등록한 풀들).
-- 조원초(0009)는 현장 사진 출처라 URL 없음(NULL 유지).
update public.pools
set schedule_source_url = 'https://www.gwanakgongdan.or.kr/www/1371?document_category_srl=3'
where id = 'POOL_SEOUL_0010';

update public.pools
set schedule_source_url = 'https://sports.idongjak.or.kr/home/105'
where id = 'POOL_SEOUL_0011';

-- 기존 풀(0005~0008) URL은 별도 마이그레이션에서 보강 (사용자 확인 후).
