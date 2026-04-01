create table if not exists public.application_workflow_meta (
  application_id uuid primary key
    references public.applications(id) on delete cascade,
  decision text null,
  snoozed_until timestamptz null,
  last_reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_workflow_meta_decision_check
    check (
      decision is null
      or decision in (
        'needs_tailoring',
        'waiting_on_referral',
        'waiting_on_response',
        'not_now'
      )
    )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_application_workflow_meta_updated_at
on public.application_workflow_meta;

create trigger set_application_workflow_meta_updated_at
before update on public.application_workflow_meta
for each row
execute function public.set_updated_at();