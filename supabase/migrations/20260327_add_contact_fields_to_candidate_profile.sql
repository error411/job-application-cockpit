alter table public.candidate_profile
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists location text;