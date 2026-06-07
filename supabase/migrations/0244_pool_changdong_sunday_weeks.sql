-- Pool's day — 창동문화체육센터(POOL_0031) 일요일 주차 운영을 weeks 필드로 정식 전환.
-- 공식 최신표(yeyak.dobongsiseol.or.kr) 재검증 결과 기존 등록이 거의 일치했고, 일요일만
-- "2·4주" 제약이 day_note 텍스트로만 있어 등록시트에서 1·3주 일요일도 선택 가능했던 부정확성
-- → weeks:[2,4]로 구조화([[slot_weeks_operation]]). 시간/요금/시설은 기존과 일치해 by_day만 보정.
update public.schedules
set by_day = $${
    "월": [{"start":"13:00","end":"13:50","hours":0.83}],
    "화": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "수": [{"start":"13:00","end":"13:50","hours":0.83}],
    "목": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"19:00","end":"19:50","hours":0.83}],
    "금": [{"start":"13:00","end":"13:50","hours":0.83},{"start":"15:00","end":"15:50","hours":0.83},{"start":"16:00","end":"16:50","hours":0.83}],
    "토": [
      {"start":"06:00","end":"06:50","hours":0.83},
      {"start":"07:00","end":"07:50","hours":0.83},
      {"start":"08:00","end":"08:50","hours":0.83},
      {"start":"09:00","end":"09:50","hours":0.83},
      {"start":"10:00","end":"10:50","hours":0.83},
      {"start":"11:00","end":"11:50","hours":0.83},
      {"start":"12:00","end":"12:50","hours":0.83},
      {"start":"13:00","end":"13:50","hours":0.83},
      {"start":"14:00","end":"14:50","hours":0.83},
      {"start":"15:00","end":"15:50","hours":0.83},
      {"start":"16:00","end":"16:50","hours":0.83},
      {"start":"17:00","end":"17:50","hours":0.83}
    ],
    "일": [
      {"start":"09:00","end":"10:50","hours":1.83,"weeks":[2,4]},
      {"start":"12:00","end":"13:50","hours":1.83,"weeks":[2,4]},
      {"start":"15:00","end":"16:50","hours":1.83,"weeks":[2,4]}
    ]
  }$$::jsonb,
    day_notes = $${"일":"매월 둘째·넷째 주 일요일에만 운영합니다."}$$::jsonb
where pool_id = 'POOL_0031';
