-- Pool's Day v1 — pools 전체 비우기.
-- 컨셉 변경: bulk import 폐기, 운영자가 대형 수영장만 수동 등록.
-- schedules / schedule_submissions는 FK cascade로 자동 삭제.
-- pool_submissions(edit mode)는 RESTRICT라 CASCADE 필수.

truncate table public.pools restart identity cascade;
