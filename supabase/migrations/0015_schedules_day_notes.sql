-- Pool's day v1 — schedules.day_notes 컬럼 추가.
-- 요일별 예외 안내 문구 (격주 운영, 매월 N주차만 등) JSONB.
-- 구조 예: { "토": "매월 첫째 주에만 운영합니다.", "월": "격주 운영" }
-- TS Schedule.dayNotes와 1:1 매칭. 키는 DayOfWeek('월'~'일'), 값은 자유 텍스트.
-- ScheduleViewScreen에서 선택된 요일의 note만 chip card 아래에 노출.

alter table public.schedules
  add column if not exists day_notes jsonb default '{}'::jsonb;

-- 샘플 데이터 — 0014에 INSERT된 풀들에 예외 케이스 변주 추가.
update public.schedules set day_notes = $${
  "토": "매월 첫째 주에만 운영합니다.",
  "일": "매월 첫째·셋째 주만 운영합니다."
}$$::jsonb where pool_id = 'POOL_SEOUL_0001';

update public.schedules set day_notes = $${
  "월": "격주 운영 — 둘째·넷째 주에 휴장합니다."
}$$::jsonb where pool_id = 'POOL_SEOUL_0002';

update public.schedules set day_notes = $${
  "수": "매월 셋째 주 수요일은 소독으로 휴장합니다."
}$$::jsonb where pool_id = 'POOL_INCHEON_0001';

update public.schedules set day_notes = $${
  "토": "토요일 오후 슬롯은 매월 둘째·넷째 주만 운영합니다."
}$$::jsonb where pool_id = 'POOL_GYEONGGI_0001';
