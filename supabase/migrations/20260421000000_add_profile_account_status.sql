alter table public.profiles
add column if not exists account_status text not null default 'active',
add column if not exists suspended_at timestamptz;

alter table public.profiles
drop constraint if exists profiles_account_status_check;

alter table public.profiles
add constraint profiles_account_status_check
check (account_status in ('active', 'suspended'));

create index if not exists profiles_account_status_idx
on public.profiles(account_status);
