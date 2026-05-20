-- Pool's day v1 — KBS스포츠월드(POOL_SEOUL_0008) slot_groups에 months 추가.
-- 시간표 타임 더블탭 → 일정 등록 플로우가 "그 날짜가 몇 월이냐"로 시즌 그룹을
-- 골라 타임표를 보여주려면, 각 그룹이 어느 달에 적용되는지 구조적 데이터 필요.
--   · 기본 운영   → 1~5, 10~12월 (비하절기)
--   · 6~9월 운영  → 6, 7, 8, 9월 (하절기)
-- 라벨·시각·by_day·day_notes는 0037 그대로, 그룹에 "months" 키만 추가. 멱등 UPDATE.

update public.schedules
set slot_groups = $${
  "토": [
    {"label":"기본 운영", "months":[1,2,3,4,5,10,11,12], "slots":[
      {"start":"09:00","end":"12:30","hours":3.5},
      {"start":"13:30","end":"17:00","hours":3.5}
    ]},
    {"label":"6~9월 운영", "months":[6,7,8,9], "slots":[
      {"start":"09:00","end":"11:30","hours":2.5},
      {"start":"12:30","end":"15:00","hours":2.5},
      {"start":"16:00","end":"18:30","hours":2.5}
    ]}
  ],
  "일": [
    {"label":"기본 운영 (매월 2, 4주차 일요일은 쉽니다.)", "months":[1,2,3,4,5,10,11,12], "slots":[
      {"start":"09:00","end":"12:30","hours":3.5},
      {"start":"13:30","end":"17:00","hours":3.5}
    ]},
    {"label":"6~9월 운영 (하절기는 매주 일요일 운영합니다.)", "months":[6,7,8,9], "slots":[
      {"start":"09:00","end":"11:30","hours":2.5},
      {"start":"12:30","end":"15:00","hours":2.5},
      {"start":"16:00","end":"18:30","hours":2.5}
    ]}
  ]
}$$::jsonb
where pool_id = 'POOL_SEOUL_0008';
