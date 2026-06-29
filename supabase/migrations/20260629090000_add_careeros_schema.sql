begin;

create extension if not exists pgcrypto;

create table if not exists public.career_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  location text,
  headline text,
  summary text,
  linkedin_url text,
  github_url text,
  website_url text,
  portfolio_url text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index if not exists career_profiles_one_default_per_user
  on public.career_profiles(user_id)
  where is_default;

create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  name text not null,
  normalized_name text,
  website_url text,
  industry text,
  location text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  employer_id uuid,
  title text not null,
  employment_type text,
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  summary text,
  responsibilities text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade,
  foreign key (employer_id, user_id)
    references public.employers(id, user_id)
    on delete set null (employer_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  employer_id uuid,
  role_id uuid,
  name text not null,
  summary text,
  description text,
  project_url text,
  repository_url text,
  start_date date,
  end_date date,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade,
  foreign key (employer_id, user_id)
    references public.employers(id, user_id)
    on delete set null (employer_id),
  foreign key (role_id, user_id)
    references public.roles(id, user_id)
    on delete set null (role_id)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  name text not null,
  category text,
  proficiency text,
  years_experience numeric(4,1),
  summary text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade
);

create unique index if not exists skills_user_name_key
  on public.skills(user_id, lower(name));

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index if not exists technologies_user_name_key
  on public.technologies(user_id, lower(name));

create table if not exists public.accomplishments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  title text,
  statement text not null,
  impact_summary text,
  metric_value text,
  metric_unit text,
  scope text,
  evidence_url text,
  source_note text,
  confidence_score integer,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade,
  constraint accomplishments_confidence_score_check
    check (confidence_score is null or confidence_score between 0 and 100)
);

create table if not exists public.accomplishment_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index if not exists accomplishment_tags_user_name_key
  on public.accomplishment_tags(user_id, lower(name));

create table if not exists public.accomplishment_tag_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  accomplishment_id uuid not null,
  tag_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (accomplishment_id, tag_id),
  foreign key (accomplishment_id, user_id)
    references public.accomplishments(id, user_id)
    on delete cascade,
  foreign key (tag_id, user_id)
    references public.accomplishment_tags(id, user_id)
    on delete cascade
);

create table if not exists public.role_accomplishments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null,
  accomplishment_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role_id, accomplishment_id),
  foreign key (role_id, user_id)
    references public.roles(id, user_id)
    on delete cascade,
  foreign key (accomplishment_id, user_id)
    references public.accomplishments(id, user_id)
    on delete cascade
);

create table if not exists public.project_accomplishments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  accomplishment_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, accomplishment_id),
  foreign key (project_id, user_id)
    references public.projects(id, user_id)
    on delete cascade,
  foreign key (accomplishment_id, user_id)
    references public.accomplishments(id, user_id)
    on delete cascade
);

create table if not exists public.role_technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null,
  technology_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role_id, technology_id),
  foreign key (role_id, user_id)
    references public.roles(id, user_id)
    on delete cascade,
  foreign key (technology_id, user_id)
    references public.technologies(id, user_id)
    on delete cascade
);

create table if not exists public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  technology_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, technology_id),
  foreign key (project_id, user_id)
    references public.projects(id, user_id)
    on delete cascade,
  foreign key (technology_id, user_id)
    references public.technologies(id, user_id)
    on delete cascade
);

create table if not exists public.accomplishment_technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  accomplishment_id uuid not null,
  technology_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (accomplishment_id, technology_id),
  foreign key (accomplishment_id, user_id)
    references public.accomplishments(id, user_id)
    on delete cascade,
  foreign key (technology_id, user_id)
    references public.technologies(id, user_id)
    on delete cascade
);

create table if not exists public.star_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  accomplishment_id uuid,
  role_id uuid,
  project_id uuid,
  title text not null,
  situation text not null,
  task text not null,
  action text not null,
  result text not null,
  lesson_learned text,
  interview_question_targets text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade,
  foreign key (accomplishment_id, user_id)
    references public.accomplishments(id, user_id)
    on delete set null (accomplishment_id),
  foreign key (role_id, user_id)
    references public.roles(id, user_id)
    on delete set null (role_id),
  foreign key (project_id, user_id)
    references public.projects(id, user_id)
    on delete set null (project_id)
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  institution text not null,
  degree text,
  field_of_study text,
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  honors text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  name text not null,
  issuer text,
  credential_id text,
  credential_url text,
  issued_at date,
  expires_at date,
  does_not_expire boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete cascade
);

create table if not exists public.resume_variants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_profile_id uuid,
  job_id uuid references public.jobs(id) on delete set null,
  name text not null,
  target_company text,
  target_title text,
  target_description text,
  variant_type text not null default 'targeted_resume',
  composition jsonb not null default '{}'::jsonb,
  generated_markdown text,
  generated_text text,
  generated_html text,
  generation_prompt jsonb,
  generation_model text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (career_profile_id, user_id)
    references public.career_profiles(id, user_id)
    on delete set null (career_profile_id)
);

create index if not exists career_profiles_user_id_idx on public.career_profiles(user_id);
create index if not exists employers_user_id_idx on public.employers(user_id);
create index if not exists employers_profile_idx on public.employers(career_profile_id);
create index if not exists roles_user_id_idx on public.roles(user_id);
create index if not exists roles_employer_idx on public.roles(employer_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_role_idx on public.projects(role_id);
create index if not exists skills_user_id_idx on public.skills(user_id);
create index if not exists technologies_user_id_idx on public.technologies(user_id);
create index if not exists accomplishments_user_id_idx on public.accomplishments(user_id);
create index if not exists accomplishment_tags_user_id_idx on public.accomplishment_tags(user_id);
create index if not exists accomplishment_tag_links_user_id_idx on public.accomplishment_tag_links(user_id);
create index if not exists role_accomplishments_user_id_idx on public.role_accomplishments(user_id);
create index if not exists project_accomplishments_user_id_idx on public.project_accomplishments(user_id);
create index if not exists role_technologies_user_id_idx on public.role_technologies(user_id);
create index if not exists project_technologies_user_id_idx on public.project_technologies(user_id);
create index if not exists accomplishment_technologies_user_id_idx on public.accomplishment_technologies(user_id);
create index if not exists star_stories_user_id_idx on public.star_stories(user_id);
create index if not exists education_user_id_idx on public.education(user_id);
create index if not exists certifications_user_id_idx on public.certifications(user_id);
create index if not exists resume_variants_user_id_idx on public.resume_variants(user_id);
create index if not exists resume_variants_job_id_idx on public.resume_variants(job_id);

create index if not exists accomplishments_statement_search_idx
  on public.accomplishments
  using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(statement, '') || ' ' || coalesce(impact_summary, '')
    )
  );

do $$
declare
  table_name text;
  trigger_name text;
begin
  foreach table_name in array array[
    'career_profiles',
    'employers',
    'roles',
    'projects',
    'skills',
    'technologies',
    'accomplishments',
    'accomplishment_tags',
    'accomplishment_tag_links',
    'role_accomplishments',
    'project_accomplishments',
    'role_technologies',
    'project_technologies',
    'accomplishment_technologies',
    'star_stories',
    'education',
    'certifications',
    'resume_variants'
  ]
  loop
    trigger_name := 'set_' || table_name || '_updated_at';

    execute format('drop trigger if exists %I on public.%I', trigger_name, table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      trigger_name,
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'career_profiles',
    'employers',
    'roles',
    'projects',
    'skills',
    'technologies',
    'accomplishments',
    'accomplishment_tags',
    'accomplishment_tag_links',
    'role_accomplishments',
    'project_accomplishments',
    'role_technologies',
    'project_technologies',
    'accomplishment_technologies',
    'star_stories',
    'education',
    'certifications',
    'resume_variants'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_select_own', table_name);
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      table_name || '_select_own',
      table_name
    );

    execute format('drop policy if exists %I on public.%I', table_name || '_insert_own', table_name);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      table_name || '_insert_own',
      table_name
    );

    execute format('drop policy if exists %I on public.%I', table_name || '_update_own', table_name);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      table_name || '_update_own',
      table_name
    );

    execute format('drop policy if exists %I on public.%I', table_name || '_delete_own', table_name);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      table_name || '_delete_own',
      table_name
    );
  end loop;
end $$;

commit;
