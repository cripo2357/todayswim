-- Pool's day — Phase 2: 동작삼일수영장(POOL_SEOUL_0011) day_notes 문구 정정.
--
-- "슬롯"은 개발 용어 → 사용자 노출 텍스트에 부적합. "시간대"로 변경.
-- by_day 변경 없음, day_notes wording만.

update public.schedules
set day_notes = $${
  "월": "오전 08:00 시간대는 여성전용입니다.",
  "수": "오전 08:00 시간대는 여성전용입니다.",
  "금": "오전 08:00 시간대는 여성전용입니다.",
  "일": "매월 셋째 주 일요일에만 운영합니다."
}$$::jsonb,
    last_verified_at = now()
where pool_id = 'POOL_SEOUL_0011';
