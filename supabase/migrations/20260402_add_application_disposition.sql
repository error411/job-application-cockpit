alter table public.applications
  add column if not exists disposition text null,
  add column if not exists disposition_at timestamptz null,
  add column if not exists disposition_notes text null;

alter table public.applications
  drop constraint if exists applications_disposition_check;

alter table public.applications
  add constraint applications_disposition_check
  check (
    disposition is null
    or disposition = any (
      array[
        'landed_interview',
        'rejected',
        'offer',
        'withdrawn',
        'ghosted',
        'accepted'
      ]
    )
  );

alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check
  check (
    status = any (
      array[
        'ready',
        'applied',
        'interviewing',
        'closed'
      ]
    )
  );