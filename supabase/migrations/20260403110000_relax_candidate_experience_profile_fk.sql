begin;

alter table public.candidate_experience
  alter column candidate_profile_id drop not null;

commit;