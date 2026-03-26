create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  payload jsonb not null default '{}'::jsonb,
  last_error text null,
  scheduled_for timestamptz not null default now(),
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.automation_jobs
drop constraint if exists automation_jobs_status_check;

alter table public.automation_jobs
add constraint automation_jobs_status_check
check (
  status in (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )
);

alter table public.automation_jobs
drop constraint if exists automation_jobs_job_type_check;

alter table public.automation_jobs
add constraint automation_jobs_job_type_check
check (
  job_type in (
    'score_job',
    'generate_assets',
    'schedule_followups',
    'generate_followup_assets'
  )
);

alter table public.automation_jobs
drop constraint if exists automation_jobs_entity_type_check;

alter table public.automation_jobs
add constraint automation_jobs_entity_type_check
check (
  entity_type in (
    'job',
    'application'
  )
);

create index if not exists automation_jobs_status_scheduled_idx
  on public.automation_jobs (status, scheduled_for);

create index if not exists automation_jobs_entity_idx
  on public.automation_jobs (entity_type, entity_id);

create index if not exists automation_jobs_job_type_idx
  on public.automation_jobs (job_type);

create unique index if not exists automation_jobs_pending_unique_idx
  on public.automation_jobs (job_type, entity_type, entity_id)
  where status in ('pending', 'processing');

create or replace function public.set_automation_jobs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists automation_jobs_set_updated_at on public.automation_jobs;

create trigger automation_jobs_set_updated_at
before update on public.automation_jobs
for each row
execute function public.set_automation_jobs_updated_at();