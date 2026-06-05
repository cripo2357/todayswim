-- Pool's day — 단일 기기 로그인 정책: profiles.active_device.
--
-- 정책: 한 계정은 한 기기에서만 로그인 유지. 새 기기에서 로그인하면 그 기기의
-- 고유 id가 active_device에 기록되고, 옛 기기는 (앱 실행/포그라운드/realtime)
-- 시점에 자신의 로컬 id와 server active_device 불일치를 감지해 자동 로그아웃.
--
-- active_device = 로그인 시 클라가 생성한 UUID(기기-로그인 세션 식별자). 본인만
-- update(0060 profiles_update_self: auth_uid = auth.uid()).

alter table public.profiles
  add column if not exists active_device text;

-- realtime — 옛 기기가 active_device 변경을 즉시 감지(앱 켜진 채로도 로그아웃)
-- 하도록 profiles를 supabase_realtime publication에 추가. 구독자는 본인 row만
-- 필터(id=eq.<self>)하며 RLS(select true)로 전달. 이미 추가됐으면 무시.
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
  when undefined_object then null; -- publication 없을 때(셀프호스트 등) 무시
end $$;
