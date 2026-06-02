-- Pool's day — 정식 출시 준비: 공지사항 더미 시드 제거.
--
-- 0004_announcements.sql(샘플 4건) + 0006_announcements_seed_test.sql(더미 10건)이
-- 넣어둔 운영 전 시드(example.com URL, 'CRIPO 굿즈 이벤트' 등)를 일괄 삭제한다.
-- 신규 사용자가 공지사항 탭에서 가짜 공지를 보던 문제(2026-06-03) 정리.
--
-- 출시 후 실 공지는 운영자가 Supabase Studio에서 직접 INSERT(announcements 테이블).
-- AnnouncementsScreen은 0건일 때 "등록된 공지사항이 없습니다" 빈 상태를 정상 표시.
--
-- 재실행 안전: DELETE 만 사용(이미 빈 테이블이면 no-op). 이 마이그레이션 이후
-- Studio로 추가한 실 공지는 영향 없음(마이그레이션은 1회만 실행).

delete from public.announcements;
