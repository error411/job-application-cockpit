-- Add status column
alter table public.application_assets
add column if not exists status text default 'idle';

-- Backfill based on ACTUAL columns
update public.application_assets
set status = 'generated'
where (
  resume_markdown is not null
  or cover_letter_markdown is not null
)
and status is null;

-- Ensure no nulls remain
update public.application_assets
set status = 'idle'
where status is null;