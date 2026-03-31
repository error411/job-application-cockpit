alter table public.jobs
  add column if not exists archived_at timestamptz,
  add column if not exists archived_reason text;