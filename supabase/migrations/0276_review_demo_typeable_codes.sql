-- Pool's day — 데모 계정 친구코드를 "입력 가능한" 코드로 정정.
--
-- ## 배경 (버그)
-- 0274/0275에서 데모 계정 코드를 DEMO11~16으로 뒀는데, 친구코드 입력칸
-- (sanitizeCode, lib/friendCode CODE_ALPHABET='ABCDEFGHJKMNPQRSTUVWXYZ23456789')
-- 은 혼동문자 O·0·1·I·L 을 제외한다. 그래서 "DEMO11" 입력 시 O·1 이 걸러져
-- "DEM"만 남아 → 심사관(및 누구도) 코드로 데모 계정을 찾을 수 없었음.
-- (O·1 제외는 ID 생성의 표준 원칙 — 데모 코드가 그 규칙을 어긴 게 잘못.)
--
-- ## 정정
-- 유효 문자셋만 쓰는 코드로 변경. profiles.id(PK)를 UPDATE 하면 friendships /
-- friend_requests / user_schedules 의 FK가 ON UPDATE CASCADE(0048/0049)라 자동
-- 따라 갱신됨. mode='id'(닉네임 숨김)·자동수락 트리거는 그대로 유지.
--
-- 매핑: DEMO11→TESTAA, 12→TESTAB, 13→TESTAC, 14→TESTAD, 15→TESTAE, 16→TESTAF
-- (T·E·S·T·A·B… 모두 CODE_ALPHABET 에 포함 = 입력 가능)

update public.profiles set id = 'TESTAA' where id = 'DEMO11';
update public.profiles set id = 'TESTAB' where id = 'DEMO12';
update public.profiles set id = 'TESTAC' where id = 'DEMO13';
update public.profiles set id = 'TESTAD' where id = 'DEMO14';
update public.profiles set id = 'TESTAE' where id = 'DEMO15';
update public.profiles set id = 'TESTAF' where id = 'DEMO16';
