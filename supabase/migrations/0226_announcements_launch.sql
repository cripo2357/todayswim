-- Pool's day — 운영 시작: 첫 실 공지(출시 안내) 1건.
--
-- 0006 의 테스트 더미 공지(가짜 10건)를 전부 삭제하고, 실 출시 공지로 교체.
-- (0006 주석: "본 운영 시작 시 삭제하거나 실 데이터로 교체.")
-- 앞으로 공지는 Supabase Studio 에서 한 행씩 직접 추가([[db_modification_policy]]
-- — content 는 Studio 직접 OK). 이번 1건 + 더미정리만 마이그레이션.

delete from public.announcements;

insert into public.announcements (type, title, body, bullets, button_label, button_url, published_at)
values (
  'info_update',
  '풀스데이 서비스 오픈🏊',
  E'풀스데이 서비스가 시작됐어요. 아직 부족하지만 잘 부탁드려요!\n수영장 정보 제공 및 서비스에 대한 아이디어는 로그인 후 설정에서 가능합니다.',
  null,
  null, null,
  now()
);
