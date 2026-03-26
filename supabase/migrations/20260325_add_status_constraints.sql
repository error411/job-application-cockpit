update public.jobs
set status = 'captured'
where status = 'discovered';

alter table public.jobs
alter column status set default 'captured';

alter table public.jobs
drop constraint if exists jobs_status_check;

alter table public.jobs
add constraint jobs_status_check
check (
  status in (
    'captured',
    'scored',
    'assets_generated',
    'ready_to_apply',
    'archived'
  )
);

alter table public.applications
alter column status set default 'ready';

alter table public.applications
drop constraint if exists applications_status_check;

alter table public.applications
add constraint applications_status_check
check (
  status in (
    'ready',
    'applied',
    'follow_up_due',
    'interviewing',
    'rejected',
    'closed'
  )
);