-- 사당문화회관(POOL_0002) 일요일 자유수영 = '매월 1주차 일요일'만 운영.
-- day_note 텍스트("매월 1주차 일요일에만 운영합니다.")엔 있었으나 슬롯 weeks 필드가
-- 비어 있어 앱(slotRunsOnDate)이 주차 필터를 못 함 → 비-1주차 일요일(예: 2026-06-14,
-- 2주차)에도 등록 시트에 슬롯이 노출되던 버그. 일요일 슬롯 4개에 weeks:[1] 백필.
-- slot_weeks_operation 백필 항목 중 '사당' 해소. 멱등(고정 배열 set).
update public.schedules
set by_day = jsonb_set(
  by_day,
  '{일}',
  '[
    {"start":"09:00","end":"10:50","hours":1.83,"weeks":[1]},
    {"start":"11:00","end":"12:50","hours":1.83,"weeks":[1]},
    {"start":"13:00","end":"14:50","hours":1.83,"weeks":[1]},
    {"start":"15:00","end":"16:50","hours":1.83,"weeks":[1]}
  ]'::jsonb
)
where pool_id = 'POOL_0002';