-- Pool's day — 대구 올림픽기념국민생활관 중복 제거 (POOL_0609 삭제).
--
-- ## 배경
-- 동시 세션이 POOL_0609 '대구올림픽기념국민생활관'을, 이 세션이 POOL_0530
-- '올림픽기념국민생활관수영장'을 각각 등록 → 동일 시설(달서구 학산로 130, 동일 좌표) 중복.
-- 0530 유지(이름 정합·요금 3,500 공식 6월공지 출처), 0609 삭제.
-- 0609는 자기 schedules 1건 외 사용자 참조(favorites/user_schedules/invites) 없음 — 안전 삭제.
--
-- ## prod 적용: scripts/apply-sql-prod.mjs (멱등). db push 금지.

delete from public.schedules where pool_id = 'POOL_0609';
delete from public.pools where id = 'POOL_0609';
