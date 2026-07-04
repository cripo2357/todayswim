-- Pool's day — 월간 수영 결산(monthly_summary)을 서버 cron으로 이관 (2026-06-15).
--
-- 이전: 클라(maybeSendMonthlySummary)가 "앱 새 달 첫 열림" 시 즉시 발송 → 발송
--   시각이 앱 여는 시점(한밤중 등)에 좌우됨.
-- 변경: pg_cron이 매월 1일 KST 08:30에 전월 결산을 각 유저에게 발송(고정 시각).
--   클라 트리거는 다음 빌드에서 제거(중복 방지). 집계 로직 SQL로 이관.
--
-- ## 시각
--   cron = 매일 23:30 UTC 실행 → 함수 안에서 "지금 KST가 매월 1일"일 때만 진행.
--   23:30 UTC + 9h = 익일 08:30 KST. 그 KST 날짜가 1일이면 발송 → 매월 1일 08:30 KST.
--
-- ## 집계(frequency 변형, rules.ts monthly_summary와 동일 카피)
--   전월(KST) user_schedules → 유저별 방문 횟수 + 최다 방문 수영장.
--   지난달 0건이면 스킵(스팸 방지). related.periodYM 로 같은 달 재발송 dedup.
--   category='report' → notify_push_on_insert(0195) 가 notif_prefs['report']로 게이팅.

create or replace function public.send_monthly_summary()
returns bigint
language plpgsql
security definer
as $$
declare
  v_now_kst   timestamp := now() at time zone 'Asia/Seoul';
  v_this_first date;
  v_prev_first date;
  v_prev_first_txt text;
  v_this_first_txt text;
  v_month_txt text;   -- 전월(1~12), 앞자리 0 없음 — "6"
  v_ym text;          -- 전월 키 "YYYY-M" (dedup)
  v_inserted bigint := 0;
begin
  -- 매월 1일(KST)에만 발송. 그 외 날짜엔 무동작.
  if extract(day from v_now_kst)::int <> 1 then
    return 0;
  end if;

  v_this_first := date_trunc('month', v_now_kst)::date;
  v_prev_first := (v_this_first - interval '1 month')::date;
  v_prev_first_txt := to_char(v_prev_first, 'YYYY-MM-DD');
  v_this_first_txt := to_char(v_this_first, 'YYYY-MM-DD');
  v_month_txt := extract(month from v_prev_first)::int::text;
  v_ym := extract(year from v_prev_first)::int::text || '-' || v_month_txt;

  with agg as (
    select
      s.profile_id,
      count(*) as cnt,
      mode() within group (order by s.pool_name) as fav
    from public.user_schedules s
    where s.date >= v_prev_first_txt
      and s.date <  v_this_first_txt
    group by s.profile_id
  ),
  target as (
    select a.profile_id, a.cnt, a.fav
    from agg a
    where a.cnt > 0
      and not exists (
        select 1 from public.notifications n
         where n.user_code = a.profile_id
           and n.kind = 'monthly_summary'
           and n.related->>'periodYM' = v_ym
      )
  ),
  ins as (
    insert into public.notifications
      (user_code, kind, title, body, params, actions, related, category)
    select
      t.profile_id,
      'monthly_summary',
      v_month_txt || '월 Pool''s day 리포트',
      jsonb_build_array(
        v_month_txt || '월에 ' || t.cnt || '번 다녀왔어요.',
        '자주 간 수영장: ' || coalesce(nullif(btrim(t.fav), ''), '[수영장 정보 없음]')
      ),
      jsonb_build_object(
        'variant', 'frequency',
        'month', v_month_txt,
        'count2', t.cnt,
        'favoritePool', coalesce(t.fav, '')
      ),
      '[]'::jsonb,
      jsonb_build_object('periodYM', v_ym),
      'report'
    from target t
    returning 1
  )
  select count(*) into v_inserted from ins;
  return v_inserted;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- pg_cron 등록 — 0086 패턴(중복 방지 do block).
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;

do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'monthly_summary_daily_kst'
  ) then
    perform cron.schedule(
      'monthly_summary_daily_kst',
      '30 23 * * *',  -- 매일 23:30 UTC → 익일 08:30 KST. 함수가 1일에만 발송.
      $sql$select public.send_monthly_summary();$sql$
    );
  end if;
exception
  when undefined_table or undefined_function then
    raise notice 'pg_cron not available — schedule manually via Dashboard';
end $$;
