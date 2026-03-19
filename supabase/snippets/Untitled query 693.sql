alter table public.application_assets
  add constraint application_assets_job_id_key unique (job_id);