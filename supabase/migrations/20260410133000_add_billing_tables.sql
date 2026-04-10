begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint billing_customers_stripe_customer_id_not_blank
    check (length(btrim(stripe_customer_id)) > 0)
);

create index if not exists billing_customers_user_id_idx
  on public.billing_customers(user_id);

create unique index if not exists billing_customers_stripe_customer_id_idx
  on public.billing_customers(stripe_customer_id);

drop trigger if exists set_billing_customers_updated_at on public.billing_customers;
create trigger set_billing_customers_updated_at
before update on public.billing_customers
for each row
execute function public.set_updated_at();

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_customer_id uuid references public.billing_customers(id) on delete set null,

  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  stripe_price_id text,
  stripe_product_id text,

  plan_key text not null default 'pro',
  billing_interval text,
  status text not null,
  currency text,
  amount_cents integer,

  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,
  raw_stripe_json jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint billing_subscriptions_plan_key_check
    check (plan_key in ('pro')),

  constraint billing_subscriptions_billing_interval_check
    check (
      billing_interval is null
      or billing_interval in ('month', 'year')
    ),

  constraint billing_subscriptions_status_check
    check (
      status in (
        'incomplete',
        'incomplete_expired',
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'paused'
      )
    )
);

create index if not exists billing_subscriptions_user_id_idx
  on public.billing_subscriptions(user_id);

create index if not exists billing_subscriptions_customer_id_idx
  on public.billing_subscriptions(stripe_customer_id);

create index if not exists billing_subscriptions_status_idx
  on public.billing_subscriptions(status);

create index if not exists billing_subscriptions_current_period_end_idx
  on public.billing_subscriptions(current_period_end);

create unique index if not exists billing_subscriptions_active_per_user_idx
  on public.billing_subscriptions(user_id)
  where status in ('trialing', 'active', 'past_due', 'paused', 'incomplete');

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row
execute function public.set_updated_at();

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  api_version text,
  processed_at timestamptz,
  processing_error text,
  payload jsonb not null,
  created_at timestamptz not null default now(),

  constraint billing_events_stripe_event_id_not_blank
    check (length(btrim(stripe_event_id)) > 0)
);

create index if not exists billing_events_event_type_idx
  on public.billing_events(event_type);

create index if not exists billing_events_processed_at_idx
  on public.billing_events(processed_at);

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_events enable row level security;

drop policy if exists "billing_customers_select_own" on public.billing_customers;
create policy "billing_customers_select_own"
on public.billing_customers
for select
using (auth.uid() = user_id);

drop policy if exists "billing_subscriptions_select_own" on public.billing_subscriptions;
create policy "billing_subscriptions_select_own"
on public.billing_subscriptions
for select
using (auth.uid() = user_id);

drop policy if exists "billing_events_no_user_access" on public.billing_events;
create policy "billing_events_no_user_access"
on public.billing_events
for select
using (false);

commit;
