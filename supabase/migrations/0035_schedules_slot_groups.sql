-- Pool's day v1 — 자유수영 시간표에 계절/변형 운영(슬롯 그룹) 지원.
-- 일부 풀(예: KBS스포츠월드)은 하절기(6~9월) 등 시즌별로 운영시간이 다름.
-- Figma 144:3716 — 요일 슬롯을 라벨 붙은 그룹으로 분할 표시
--   (예: "기본 운영 (매월 2,4주차 일요일은 쉽니다.)" / "6~9월 운영 (하절기는 휴장일이 없습니다.)").
--
-- 모델(하위호환·추가형): 기존 by_day(flat)는 그대로 두고 slot_groups(옵션) 추가.
--   구조: { "<요일>": [ { "label": "<그룹 캡션>", "slots": [ {start,end,hours}, ... ] }, ... ] }
--   slot_groups[요일] 있으면 ScheduleView가 그룹 렌더, 없으면 by_day flat 그대로.
--   by_day는 여전히 "해당 요일 운영 여부"(요일칩 활성)·dayNote 게이팅의 기준 →
--   그룹 풀도 by_day[요일]에 대표(기본) 슬롯을 채워둔다.
-- 기존 30+ 풀 영향 없음(slot_groups NULL/{} → flat 동작 유지).

alter table public.schedules
  add column if not exists slot_groups jsonb default '{}'::jsonb;
