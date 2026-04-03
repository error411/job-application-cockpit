begin;

-- extensions
create extension if not exists pgcrypto;

-- helper trigger for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- candidate profile
create table if not exists public.candidate_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  title text,
  summary text,
  location text,
  phone text,
  website_url text,
  linkedin_url text,
  github_url text,
  strengths text[] not null default '{}',
  experience_bullets text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_profile
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists title text,
  add column if not exists summary text,
  add column if not exists location text,
  add column if not exists phone text,
  add column if not exists website_url text,
  add column if not exists linkedin_url text,
  add column if not exists github_url text,
  add column if not exists strengths text[] not null default '{}',
  add column if not exists experience_bullets text[] not null default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists candidate_profile_user_id_key
  on public.candidate_profile(user_id);

create index if not exists candidate_profile_user_id_idx
  on public.candidate_profile(user_id);

drop trigger if exists set_candidate_profile_updated_at on public.candidate_profile;
create trigger set_candidate_profile_updated_at
before update on public.candidate_profile
for each row
execute function public.set_updated_at();

-- candidate experience
create table if not exists public.candidate_experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  summary text,
  bullets text[] not null default '{}',
  technologies text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_experience
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists location text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists is_current boolean not null default false,
  add column if not exists summary text,
  add column if not exists bullets text[] not null default '{}',
  add column if not exists technologies text[] not null default '{}',
  add column if not exists sort_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists candidate_experience_user_id_idx
  on public.candidate_experience(user_id);

drop trigger if exists set_candidate_experience_updated_at on public.candidate_experience;
create trigger set_candidate_experience_updated_at
before update on public.candidate_experience
for each row
execute function public.set_updated_at();

-- add user_id to existing tables
alter table public.jobs
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.applications
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.job_scores
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists jobs_user_id_idx on public.jobs(user_id);
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists job_scores_user_id_idx on public.job_scores(user_id);

-- If you have other generated asset tables, repeat the same pattern here.

-- RLS
alter table public.profiles enable row level security;
alter table public.candidate_profile enable row level security;
alter table public.candidate_experience enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.job_scores enable row level security;

-- profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- generic own-row policies
drop policy if exists "candidate_profile_select_own" on public.candidate_profile;
create policy "candidate_profile_select_own"
on public.candidate_profile
for select
using (auth.uid() = user_id);

drop policy if exists "candidate_profile_insert_own" on public.candidate_profile;
create policy "candidate_profile_insert_own"
on public.candidate_profile
for insert
with check (auth.uid() = user_id);

drop policy if exists "candidate_profile_update_own" on public.candidate_profile;
create policy "candidate_profile_update_own"
on public.candidate_profile
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "candidate_profile_delete_own" on public.candidate_profile;
create policy "candidate_profile_delete_own"
on public.candidate_profile
for delete
using (auth.uid() = user_id);

drop policy if exists "candidate_experience_select_own" on public.candidate_experience;
create policy "candidate_experience_select_own"
on public.candidate_experience
for select
using (auth.uid() = user_id);

drop policy if exists "candidate_experience_insert_own" on public.candidate_experience;
create policy "candidate_experience_insert_own"
on public.candidate_experience
for insert
with check (auth.uid() = user_id);

drop policy if exists "candidate_experience_update_own" on public.candidate_experience;
create policy "candidate_experience_update_own"
on public.candidate_experience
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "candidate_experience_delete_own" on public.candidate_experience;
create policy "candidate_experience_delete_own"
on public.candidate_experience
for delete
using (auth.uid() = user_id);

drop policy if exists "jobs_select_own" on public.jobs;
create policy "jobs_select_own"
on public.jobs
for select
using (auth.uid() = user_id);

drop policy if exists "jobs_insert_own" on public.jobs;
create policy "jobs_insert_own"
on public.jobs
for insert
with check (auth.uid() = user_id);

drop policy if exists "jobs_update_own" on public.jobs;
create policy "jobs_update_own"
on public.jobs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "jobs_delete_own" on public.jobs;
create policy "jobs_delete_own"
on public.jobs
for delete
using (auth.uid() = user_id);

drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own"
on public.applications
for select
using (auth.uid() = user_id);

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
on public.applications
for insert
with check (auth.uid() = user_id);

drop policy if exists "applications_update_own" on public.applications;
create policy "applications_update_own"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "applications_delete_own" on public.applications;
create policy "applications_delete_own"
on public.applications
for delete
using (auth.uid() = user_id);

drop policy if exists "job_scores_select_own" on public.job_scores;
create policy "job_scores_select_own"
on public.job_scores
for select
using (auth.uid() = user_id);

drop policy if exists "job_scores_insert_own" on public.job_scores;
create policy "job_scores_insert_own"
on public.job_scores
for insert
with check (auth.uid() = user_id);

drop policy if exists "job_scores_update_own" on public.job_scores;
create policy "job_scores_update_own"
on public.job_scores
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "job_scores_delete_own" on public.job_scores;
create policy "job_scores_delete_own"
on public.job_scores
for delete
using (auth.uid() = user_id);

commit;