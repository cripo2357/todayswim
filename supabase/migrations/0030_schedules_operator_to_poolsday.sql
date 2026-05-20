-- Pool's day v1 — 운영자 시드 시간표의 작성자 표기를 '운영자' → '풀스데이'.
-- 시간표 마지막 등록자가 운영자(서비스가 공식 등록)인 경우, 사용자 화면엔
--   '운영자님'이 아니라 '풀스데이님'으로 노출되게.
-- 대상: 운영자 시드(0021 관악, 0024/0029 사당) — author_nickname='운영자'.
--   (0014 샘플 시드는 '잠실회원' 등 다른 닉이라 영향 없음.)
-- 코드에 '운영자' 센티넬 의존 없음 — 저장값만 교체하면 ScheduleView가 그대로 표시.
-- 앞으로 운영자가 시드하는 schedules는 처음부터 author_nickname='풀스데이' 사용.

update public.schedules
set author_nickname = '풀스데이'
where author_nickname = '운영자';
