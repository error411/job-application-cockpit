begin;

create table if not exists public.signup_ip_emails (
  ip_hash text not null,
  email_normalized text not null,
  reservation_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  primary key (ip_hash, email_normalized),
  constraint signup_ip_emails_ip_hash_not_blank
    check (length(btrim(ip_hash)) > 0),
  constraint signup_ip_emails_email_not_blank
    check (length(btrim(email_normalized)) > 0)
);

alter table public.signup_ip_emails enable row level security;

revoke all on table public.signup_ip_emails from anon, authenticated;
grant select, insert, delete on table public.signup_ip_emails to service_role;

create or replace function public.reserve_signup_slot(
  p_ip_hash text,
  p_email text,
  p_max_accounts integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(btrim(p_email));
  new_token uuid := gen_random_uuid();
  account_count integer;
begin
  if length(btrim(p_ip_hash)) = 0
    or length(normalized_email) = 0
    or p_max_accounts < 1 then
    return jsonb_build_object('status', 'invalid');
  end if;

  -- Serialize reservations for one IP so concurrent requests cannot exceed
  -- the configured distinct-email limit.
  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  if exists (
    select 1
    from auth.users
    where lower(email) = normalized_email
  ) then
    return jsonb_build_object('status', 'existing_email');
  end if;

  if exists (
    select 1
    from public.signup_ip_emails
    where ip_hash = p_ip_hash
      and email_normalized = normalized_email
  ) then
    return jsonb_build_object('status', 'pending');
  end if;

  select count(*)
  into account_count
  from public.signup_ip_emails
  where ip_hash = p_ip_hash;

  if account_count >= p_max_accounts then
    return jsonb_build_object('status', 'ip_limit');
  end if;

  insert into public.signup_ip_emails (
    ip_hash,
    email_normalized,
    reservation_token
  )
  values (
    p_ip_hash,
    normalized_email,
    new_token
  );

  return jsonb_build_object(
    'status', 'reserved',
    'reservation_token', new_token
  );
end;
$$;

create or replace function public.release_signup_slot(
  p_ip_hash text,
  p_email text,
  p_reservation_token uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.signup_ip_emails
  where ip_hash = p_ip_hash
    and email_normalized = lower(btrim(p_email))
    and reservation_token = p_reservation_token;
$$;

revoke all on function public.reserve_signup_slot(text, text, integer)
  from public, anon, authenticated;
revoke all on function public.release_signup_slot(text, text, uuid)
  from public, anon, authenticated;

grant execute on function public.reserve_signup_slot(text, text, integer)
  to service_role;
grant execute on function public.release_signup_slot(text, text, uuid)
  to service_role;

commit;
