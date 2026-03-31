alter table public.applications
  drop constraint if exists applications_job_id_fkey;

alter table public.applications
  add constraint applications_job_id_fkey
  foreign key (job_id)
  references public.jobs(id)
  on delete cascade;

alter table public.application_assets
  drop constraint if exists application_assets_job_id_fkey;

alter table public.application_assets
  add constraint application_assets_job_id_fkey
  foreign key (job_id)
  references public.jobs(id)
  on delete cascade;

alter table public.job_scores
  drop constraint if exists job_scores_job_id_fkey;

alter table public.job_scores
  add constraint job_scores_job_id_fkey
  foreign key (job_id)
  references public.jobs(id)
  on delete cascade;