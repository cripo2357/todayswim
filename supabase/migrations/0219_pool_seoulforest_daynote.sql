-- Pool's day — 서울숲(POOL_0099) 일요일 day_note에 주차 안내 복원.
-- 0218에서 weeks:[2,4] 구조화하며 day_note의 "2·4주"를 뺐으나, 시간표 보기는 day_note로 주차를 안내하므로
--   (뱃지 도입 철회, 크리스 결정 2026-06-06) 표준 톤으로 복원 + 일요일 요금 병기. weeks:[2,4]는 등록시트 숨김용으로 유지.
update public.schedules
set day_notes = $${
    "일": "매월 2, 4주차 일요일에만 운영합니다. 일일입장 성인 7,000원(평일·토 4,000원)."
  }$$::jsonb
where pool_id = 'POOL_0099';
