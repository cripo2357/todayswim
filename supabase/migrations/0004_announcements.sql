-- Pool's day v1 — announcements 테이블.
-- 공지사항 4종(신기능/기능 업데이트/정보 업데이트/이벤트). 사용자는 read-only.
-- bullets는 본문 다음 줄의 글머리 항목 (선택). button_label/url은 이벤트 CTA용 (선택).

create table if not exists public.announcements (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('new_feature', 'feature_update', 'info_update', 'event')),
  title         text not null,
  body          text not null,
  bullets       text[],                                 -- ['개선기능1', '개선기능2'] 형태. NULL이면 미표시
  button_label  text,                                   -- 이벤트 CTA 텍스트. ex) '이벤트로 이동'
  button_url    text,                                   -- CTA 링크 (https://...)
  published_at  timestamptz not null default now(),
  created_at    timestamptz default now()
);

create index if not exists announcements_published_at_idx
  on public.announcements (published_at desc);

alter table public.announcements enable row level security;

drop policy if exists announcements_read_all on public.announcements;
create policy announcements_read_all on public.announcements
  for select using (true);

-- 시드 데이터 — Figma 75:1536 미리보기와 동일.
-- 운영자는 Supabase Dashboard에서 직접 INSERT/UPDATE/DELETE.
insert into public.announcements (type, title, body, bullets, button_label, button_url, published_at) values
  ('new_feature',    '신기능 출시',         '수영 기록 기능이 새로 추가되었습니다.', null,                                              null,           null,                            now() - interval '1 day'),
  ('feature_update', 'v1.2 업데이트',       '즐겨찾기 기능이 개선되었습니다.',       array['개선기능1', '개선기능2'],                   null,           null,                            now() - interval '2 day'),
  ('info_update',    '수영장 정보 업데이트', '수영장 추가 및 정보 수정',              array['A수영장 외 3곳', 'A수영장 외 19곳'],         null,           null,                            now() - interval '3 day'),
  ('event',          '브랜드 X 이벤트',     '브랜드X와 함께하는 이벤트가 추가되었습니다.', null,                                          '이벤트로 이동', 'https://example.com/event',     now() - interval '4 day');
