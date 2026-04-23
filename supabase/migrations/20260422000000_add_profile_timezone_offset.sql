alter table public.profiles
add column if not exists timezone_offset_minutes integer;

alter table public.profiles
drop constraint if exists profiles_timezone_offset_minutes_check;

alter table public.profiles
add constraint profiles_timezone_offset_minutes_check
check (
  timezone_offset_minutes is null
  or timezone_offset_minutes between -840 and 840
);
