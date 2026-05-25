-- Pool's day — Phase 2: 풀 ID 명명 규칙 opaque sequence로 전환.
--
-- 기존 `POOL_<REGION>[_HOTEL]_NNNN` 패턴은 region/type 메타데이터를 ID에
-- 박아 단일 출처 원칙 위배(region/is_hotel_pool 컬럼이 SoT). 신규 풀부터는
-- region-agnostic opaque sequence `POOL_NNNN` 사용 + 기존 15개도 일괄 리네임.
--
-- ## 매핑 (15개)
--
--   POOL_SEOUL_0005       → POOL_0001  (관악구민종합체육센터)
--   POOL_SEOUL_0006       → POOL_0002  (사당문화회관)
--   POOL_SEOUL_0007       → POOL_0003  (영등포제2스포츠센터)
--   POOL_SEOUL_0008       → POOL_0004  (KBS스포츠월드)
--   POOL_SEOUL_0009       → POOL_0005  (조원초등학교 수영장)
--   POOL_SEOUL_0010       → POOL_0006  (신림체육센터)
--   POOL_SEOUL_0011       → POOL_0007  (동작삼일수영장)
--   POOL_SEOUL_0012       → POOL_0008  (흑석체육센터)
--   POOL_SEOUL_0013       → POOL_0009  (동작구민체육센터)
--   POOL_SEOUL_0014       → POOL_0010  (서울여성플라자 스포츠센터)
--   POOL_SEOUL_0015       → POOL_0011  (영등포제1스포츠센터)
--   POOL_SEOUL_0016       → POOL_0012  (영등포제3스포츠센터)
--   POOL_SEOUL_0017       → POOL_0013  (신길책마루문화센터)
--   POOL_SEOUL_0018       → POOL_0014  (동대문구민체육센터)
--   POOL_BUSAN_HOTEL_0001 → POOL_0015  (르컬렉티브 해운대 패러그라프)
--
-- ## 영향 범위 (FK 5종)
--
--   - schedules.pool_id           (PK, on delete cascade)
--   - schedule_submissions.pool_id (on delete cascade)
--   - pool_submissions.pool_id    (nullable, no action)
--   - profiles.lesson_pool_id     (on delete set null)
--   - user_schedules.pool_id      (on delete set null)
--
-- pool_name / lesson_pool_name 캐시(스냅샷)는 변경 없음 — 이름은 그대로.
-- photo_url도 옛 ID가 포함되어 있어 같은 매핑으로 갱신.
--
-- ## 실행 전략
--
-- FK가 ON UPDATE CASCADE가 아니라 PK 업데이트 자동 전파 불가 →
-- (1) FK constraint drop → (2) pools + FK 컬럼 일괄 UPDATE → (3) FK 재생성.
-- 단일 트랜잭션으로 실행해 중간 정합 깨짐 방지.

begin;

-- 1) FK constraint drop (이름은 PG 기본: <table>_<col>_fkey)
alter table public.schedules            drop constraint if exists schedules_pool_id_fkey;
alter table public.schedule_submissions drop constraint if exists schedule_submissions_pool_id_fkey;
alter table public.pool_submissions     drop constraint if exists pool_submissions_pool_id_fkey;
alter table public.profiles             drop constraint if exists profiles_lesson_pool_id_fkey;
alter table public.user_schedules       drop constraint if exists user_schedules_pool_id_fkey;

-- 2) pools.id + photo_url 일괄 UPDATE
update public.pools p
set id = m.new_id,
    photo_url = replace(p.photo_url, m.old_id, m.new_id)
from (values
  ('POOL_SEOUL_0005',       'POOL_0001'),
  ('POOL_SEOUL_0006',       'POOL_0002'),
  ('POOL_SEOUL_0007',       'POOL_0003'),
  ('POOL_SEOUL_0008',       'POOL_0004'),
  ('POOL_SEOUL_0009',       'POOL_0005'),
  ('POOL_SEOUL_0010',       'POOL_0006'),
  ('POOL_SEOUL_0011',       'POOL_0007'),
  ('POOL_SEOUL_0012',       'POOL_0008'),
  ('POOL_SEOUL_0013',       'POOL_0009'),
  ('POOL_SEOUL_0014',       'POOL_0010'),
  ('POOL_SEOUL_0015',       'POOL_0011'),
  ('POOL_SEOUL_0016',       'POOL_0012'),
  ('POOL_SEOUL_0017',       'POOL_0013'),
  ('POOL_SEOUL_0018',       'POOL_0014'),
  ('POOL_BUSAN_HOTEL_0001', 'POOL_0015')
) as m(old_id, new_id)
where p.id = m.old_id;

-- 3) FK 컬럼 UPDATE — 각 테이블 동일 매핑 적용
update public.schedules s
set pool_id = m.new_id
from (values
  ('POOL_SEOUL_0005',       'POOL_0001'),
  ('POOL_SEOUL_0006',       'POOL_0002'),
  ('POOL_SEOUL_0007',       'POOL_0003'),
  ('POOL_SEOUL_0008',       'POOL_0004'),
  ('POOL_SEOUL_0009',       'POOL_0005'),
  ('POOL_SEOUL_0010',       'POOL_0006'),
  ('POOL_SEOUL_0011',       'POOL_0007'),
  ('POOL_SEOUL_0012',       'POOL_0008'),
  ('POOL_SEOUL_0013',       'POOL_0009'),
  ('POOL_SEOUL_0014',       'POOL_0010'),
  ('POOL_SEOUL_0015',       'POOL_0011'),
  ('POOL_SEOUL_0016',       'POOL_0012'),
  ('POOL_SEOUL_0017',       'POOL_0013'),
  ('POOL_SEOUL_0018',       'POOL_0014'),
  ('POOL_BUSAN_HOTEL_0001', 'POOL_0015')
) as m(old_id, new_id)
where s.pool_id = m.old_id;

update public.schedule_submissions ss
set pool_id = m.new_id
from (values
  ('POOL_SEOUL_0005',       'POOL_0001'),
  ('POOL_SEOUL_0006',       'POOL_0002'),
  ('POOL_SEOUL_0007',       'POOL_0003'),
  ('POOL_SEOUL_0008',       'POOL_0004'),
  ('POOL_SEOUL_0009',       'POOL_0005'),
  ('POOL_SEOUL_0010',       'POOL_0006'),
  ('POOL_SEOUL_0011',       'POOL_0007'),
  ('POOL_SEOUL_0012',       'POOL_0008'),
  ('POOL_SEOUL_0013',       'POOL_0009'),
  ('POOL_SEOUL_0014',       'POOL_0010'),
  ('POOL_SEOUL_0015',       'POOL_0011'),
  ('POOL_SEOUL_0016',       'POOL_0012'),
  ('POOL_SEOUL_0017',       'POOL_0013'),
  ('POOL_SEOUL_0018',       'POOL_0014'),
  ('POOL_BUSAN_HOTEL_0001', 'POOL_0015')
) as m(old_id, new_id)
where ss.pool_id = m.old_id;

update public.pool_submissions ps
set pool_id = m.new_id
from (values
  ('POOL_SEOUL_0005',       'POOL_0001'),
  ('POOL_SEOUL_0006',       'POOL_0002'),
  ('POOL_SEOUL_0007',       'POOL_0003'),
  ('POOL_SEOUL_0008',       'POOL_0004'),
  ('POOL_SEOUL_0009',       'POOL_0005'),
  ('POOL_SEOUL_0010',       'POOL_0006'),
  ('POOL_SEOUL_0011',       'POOL_0007'),
  ('POOL_SEOUL_0012',       'POOL_0008'),
  ('POOL_SEOUL_0013',       'POOL_0009'),
  ('POOL_SEOUL_0014',       'POOL_0010'),
  ('POOL_SEOUL_0015',       'POOL_0011'),
  ('POOL_SEOUL_0016',       'POOL_0012'),
  ('POOL_SEOUL_0017',       'POOL_0013'),
  ('POOL_SEOUL_0018',       'POOL_0014'),
  ('POOL_BUSAN_HOTEL_0001', 'POOL_0015')
) as m(old_id, new_id)
where ps.pool_id = m.old_id;

update public.profiles pr
set lesson_pool_id = m.new_id
from (values
  ('POOL_SEOUL_0005',       'POOL_0001'),
  ('POOL_SEOUL_0006',       'POOL_0002'),
  ('POOL_SEOUL_0007',       'POOL_0003'),
  ('POOL_SEOUL_0008',       'POOL_0004'),
  ('POOL_SEOUL_0009',       'POOL_0005'),
  ('POOL_SEOUL_0010',       'POOL_0006'),
  ('POOL_SEOUL_0011',       'POOL_0007'),
  ('POOL_SEOUL_0012',       'POOL_0008'),
  ('POOL_SEOUL_0013',       'POOL_0009'),
  ('POOL_SEOUL_0014',       'POOL_0010'),
  ('POOL_SEOUL_0015',       'POOL_0011'),
  ('POOL_SEOUL_0016',       'POOL_0012'),
  ('POOL_SEOUL_0017',       'POOL_0013'),
  ('POOL_SEOUL_0018',       'POOL_0014'),
  ('POOL_BUSAN_HOTEL_0001', 'POOL_0015')
) as m(old_id, new_id)
where pr.lesson_pool_id = m.old_id;

update public.user_schedules us
set pool_id = m.new_id
from (values
  ('POOL_SEOUL_0005',       'POOL_0001'),
  ('POOL_SEOUL_0006',       'POOL_0002'),
  ('POOL_SEOUL_0007',       'POOL_0003'),
  ('POOL_SEOUL_0008',       'POOL_0004'),
  ('POOL_SEOUL_0009',       'POOL_0005'),
  ('POOL_SEOUL_0010',       'POOL_0006'),
  ('POOL_SEOUL_0011',       'POOL_0007'),
  ('POOL_SEOUL_0012',       'POOL_0008'),
  ('POOL_SEOUL_0013',       'POOL_0009'),
  ('POOL_SEOUL_0014',       'POOL_0010'),
  ('POOL_SEOUL_0015',       'POOL_0011'),
  ('POOL_SEOUL_0016',       'POOL_0012'),
  ('POOL_SEOUL_0017',       'POOL_0013'),
  ('POOL_SEOUL_0018',       'POOL_0014'),
  ('POOL_BUSAN_HOTEL_0001', 'POOL_0015')
) as m(old_id, new_id)
where us.pool_id = m.old_id;

-- 4) FK constraint 재생성 — 원래 옵션 그대로
alter table public.schedules
  add constraint schedules_pool_id_fkey
  foreign key (pool_id) references public.pools(id) on delete cascade;

alter table public.schedule_submissions
  add constraint schedule_submissions_pool_id_fkey
  foreign key (pool_id) references public.pools(id) on delete cascade;

alter table public.pool_submissions
  add constraint pool_submissions_pool_id_fkey
  foreign key (pool_id) references public.pools(id);

alter table public.profiles
  add constraint profiles_lesson_pool_id_fkey
  foreign key (lesson_pool_id) references public.pools(id) on delete set null;

alter table public.user_schedules
  add constraint user_schedules_pool_id_fkey
  foreign key (pool_id) references public.pools(id) on delete set null;

commit;
