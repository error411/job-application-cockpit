-- EXTENSIONS
create extension if not exists "pgcrypto";

-- =========================
-- jobs
-- =========================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  title text not null,
  description_raw text not null,
  description_clean text,
  location text,
  posted_at timestamptz,
  source text,
  status text not null default 'captured',
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- candidate_profile
-- =========================
create table public.candidate_profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  summary text,
  strengths text[] default '{}',
  experience_bullets text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- candidate_experience
-- =========================
create table public.candidate_experience (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid not null,
  company text not null,
  title text not null,
  bullets text[] default '{}',
  technologies text[] default '{}',
  summary text,
  location text,
  start_date date,
  end_date date,
  is_current boolean,
  sort_order int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- applications
-- =========================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  status text not null default 'ready',
  notes text,
  applied_at timestamptz,
  follow_up_1_due timestamptz,
  follow_up_2_due timestamptz,
  resume_markdown text,
  resume_text text,
  cover_letter_markdown text,
  cover_letter_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- application_assets
-- =========================
create table public.application_assets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid unique not null,
  resume_markdown text,
  cover_letter_markdown text,
  recruiter_note text,
  created_at timestamptz not null default now()
);

-- =========================
-- job_scores
-- =========================
create table public.job_scores (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  score int not null,
  matched_skills text[] default '{}',
  missing_skills text[] default '{}',
  reasons jsonb,
  created_at timestamptz not null default now()
);

-- =========================
-- FOREIGN KEYS
-- =========================
alter table public.applications
  add constraint applications_job_id_fkey
  foreign key (job_id) references public.jobs(id);

alter table public.application_assets
  add constraint application_assets_job_id_fkey
  foreign key (job_id) references public.jobs(id);

alter table public.job_scores
  add constraint job_scores_job_id_fkey
  foreign key (job_id) references public.jobs(id);