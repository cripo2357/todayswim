-- Pool's day — 서울숲(POOL_0099) day_note에서 요금 문구 제거. day_note는 운영 예외(주차·격주)만, 요금은 price 컬럼 담당.
-- 0206 등록 때부터 day_note에 "일일입장 성인 7,000원" 등 요금이 섞여 있던 것 정리(크리스 지적 2026-06-06).
update public.schedules
set day_notes = $${
    "일": "매월 2, 4주차 일요일에만 운영합니다."
  }$$::jsonb
where pool_id = 'POOL_0099';
