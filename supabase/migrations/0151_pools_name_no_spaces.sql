-- Pool's day — 수영장 이름 띄어쓰기 일괄 제거.
-- 운영자 정책(2026-06-04): 풀 이름은 공백 없이 붙여쓴다. (pool_name_no_spaces)
-- 예: "시립 수서청소년센터"→"시립수서청소년센터", "코오롱스포렉스 서초점"→"코오롱스포렉스서초점" 등.
-- 공백 포함 이름만 영향. 향후 신규 등록은 처음부터 붙여쓰기.

update public.pools
set name = replace(name, ' ', '')
where name like '% %';
