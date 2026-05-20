-- Pool's day v1 — KBS스포츠월드(POOL_SEOUL_0008) slot_groups 라벨 문구 정정.
-- 사용자 제공 화면(렌더 이미지) 기준 문구 통일:
--   · 일: "기본 운영 (매월 2, 4주차 일요일은 쉽니다.)"
--         "6~9월 운영 (하절기는 매주 일요일 운영합니다.)"  ← 0036의 "휴장일이 없습니다" 정정
--   · 토: "기본 운영" / "6~9월 운영" (토요일은 휴무 규칙 없음 → 부가설명 없이 간결)
-- 시각(slots)·by_day·day_notes는 0036 그대로, 라벨 텍스트만 변경.
-- 0036 이미 적용됐을 수 있어 UPDATE로 멱등 정정.

update public.schedules
set slot_groups = $${
  "토": [
    {"label":"기본 운영", "slots":[
      {"start":"09:00","end":"12:30","hours":3.5},
      {"start":"13:30","end":"17:00","hours":3.5}
    ]},
    {"label":"6~9월 운영", "slots":[
      {"start":"09:00","end":"11:30","hours":2.5},
      {"start":"12:30","end":"15:00","hours":2.5},
      {"start":"16:00","end":"18:30","hours":2.5}
    ]}
  ],
  "일": [
    {"label":"기본 운영 (매월 2, 4주차 일요일은 쉽니다.)", "slots":[
      {"start":"09:00","end":"12:30","hours":3.5},
      {"start":"13:30","end":"17:00","hours":3.5}
    ]},
    {"label":"6~9월 운영 (하절기는 매주 일요일 운영합니다.)", "slots":[
      {"start":"09:00","end":"11:30","hours":2.5},
      {"start":"12:30","end":"15:00","hours":2.5},
      {"start":"16:00","end":"18:30","hours":2.5}
    ]}
  ]
}$$::jsonb
where pool_id = 'POOL_SEOUL_0008';
