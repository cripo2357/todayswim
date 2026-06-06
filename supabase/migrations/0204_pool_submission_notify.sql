-- Pool's day — 풀 제보 승인/거절 시 제출자에게 알림 발송.
--
-- 배경: pool_submissions 에 제출자 식별자가 없어(submitter_contact 옵션뿐),
-- 운영자가 승인해도 누구에게 알릴지 알 수 없었다. submitter_code(profile.id)를
-- 추가하고, status 가 approved/rejected 로 바뀌면 그 사용자 알림함에 적재.
-- 적재는 서버(운영자 Studio UPDATE = auth.uid() null)라 notify_push_on_insert
-- 트리거가 push 까지 발송(받는 사람 submission 토글로 게이팅).
--
-- 카피는 rules.ts(pool_submission_approved/rejected)와 일치시켜 하드코딩
-- (서버 적재분은 SQL 에 copy 필요 — 0086 reminder 와 동일 패턴).
--
-- 주의: schedule_submissions 는 [timetable_view_only] 정책으로 사용자 제출
-- 경로가 없어(운영자 전용) 대상 아님. pool_submissions 만.

-- 1) 제출자 식별자(profile.id = 친구코드). 비로그인 제출이면 null → 알림 스킵.
alter table public.pool_submissions
  add column if not exists submitter_code text;

-- 2) 승인/거절 시 알림 적재 트리거 함수.
create or replace function public.notify_pool_submission_review()
returns trigger
language plpgsql
security definer
as $$
declare
  v_kind   text;
  v_title  text;
  v_body   text;
  v_acts   jsonb;
begin
  -- status 가 실제로 approved/rejected 로 바뀐 경우만.
  if new.status is not distinct from old.status then return new; end if;
  if new.status not in ('approved', 'rejected') then return new; end if;
  -- 제출자 식별 불가(비로그인/구 데이터) → 알림 불가.
  if new.submitter_code is null or new.submitter_code = '' then return new; end if;

  if new.status = 'approved' then
    v_kind  := 'pool_submission_approved';
    v_title := '수영장 추가 승인';
    v_body  := coalesce(new.pool_name, '') || '이 추가됐어요.';
    v_acts  := jsonb_build_array('보기');
  else
    v_kind  := 'pool_submission_rejected';
    v_title := '수영장 추가 거절';
    v_body  := coalesce(new.pool_name, '') || ' 제보가 반영되지 않았어요.';
    v_acts  := '[]'::jsonb;
  end if;

  insert into public.notifications
    (user_code, kind, title, body, params, actions, related, category)
  values (
    new.submitter_code,
    v_kind,
    v_title,
    jsonb_build_array(v_body),
    jsonb_build_object('pool', new.pool_name),
    v_acts,
    case when new.pool_id is not null
      then jsonb_build_object('poolId', new.pool_id)
      else '{}'::jsonb end,
    'submission'
  );

  return new;
exception
  when others then
    raise notice 'notify_pool_submission_review failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists trg_pool_submission_review on public.pool_submissions;
create trigger trg_pool_submission_review
  after update on public.pool_submissions
  for each row execute function public.notify_pool_submission_review();
