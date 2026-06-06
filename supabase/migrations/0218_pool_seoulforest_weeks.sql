-- Pool's day — 서울숲복합문화체육센터(POOL_0099) 일요일 주차 운영을 weeks 필드로 정식 전환.
-- 기존: 일요일 슬롯이 매주로 보이고 "매월 2·4주" 제약은 day_note 텍스트로만 → 등록시트서 1·3·5주 일요일도
--   선택 가능했던 부정확성. weeks:[2,4]로 구조화 → 등록시트는 2·4주 일요일만 슬롯 노출, 시간표는 "2·4주" 뱃지.
-- by_day 변경이라 마이그레이션. INSERT는 ON CONFLICT DO NOTHING이므로 UPDATE로 보정.
update public.schedules
set by_day = $${
    "월": [{"start":"12:10","end":"13:00","hours":0.83}],
    "화": [{"start":"12:10","end":"13:00","hours":0.83},{"start":"13:10","end":"14:00","hours":0.83}],
    "수": [{"start":"12:10","end":"13:00","hours":0.83}],
    "목": [{"start":"12:10","end":"13:00","hours":0.83},{"start":"13:10","end":"14:00","hours":0.83}],
    "금": [{"start":"12:10","end":"13:00","hours":0.83}],
    "토": [{"start":"16:10","end":"17:00","hours":0.83},{"start":"17:10","end":"18:00","hours":0.83},{"start":"18:10","end":"19:00","hours":0.83}],
    "일": [{"start":"09:30","end":"10:50","hours":1.33,"weeks":[2,4]},{"start":"11:30","end":"12:50","hours":1.33,"weeks":[2,4]},{"start":"13:30","end":"14:50","hours":1.33,"weeks":[2,4]}]
  }$$::jsonb,
    day_notes = $${
    "일": "일요일 일일입장 성인 7,000원(평일·토 4,000원)."
  }$$::jsonb
where pool_id = 'POOL_0099';
