-- Pool's day v1 — schedule_submissions.day_notes 컬럼 추가.
-- 사용자 시간표 등록 요청 시 요일별 안내 문구도 같이 받음.
-- 0015에서 schedules에 day_notes 추가했고, 검수 시 submissions → schedules로 그대로 이관.
-- 구조 예: { "토": "매월 첫째 주에만 운영합니다." }

alter table public.schedule_submissions
  add column if not exists day_notes jsonb default '{}'::jsonb;
