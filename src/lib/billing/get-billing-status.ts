import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/schema'
import type { BillingSubscriptionRow } from '@/lib/supabase/model-types'

const PRO_ACCESS_STATUSES = ['trialing', 'active', 'past_due'] as const

export type BillingAccessStatus = (typeof PRO_ACCESS_STATUSES)[number]
export type BillingInterval = 'month' | 'year'
export type BillingPlanKey = 'pro'

export type BillingEntitlement = 'free' | 'pro'

export type BillingStatus = {
  entitlement: BillingEntitlement
  isPro: boolean
  subscription: BillingSubscriptionSummary | null
}

export type BillingSubscriptionSummary = {
  id: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: string
  planKey: string
  billingInterval: BillingInterval | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  trialEnd: string | null
}

function isBillingInterval(value: string | null): value is BillingInterval {
  return value === 'month' || value === 'year'
}

function isProAccessStatus(value: string): value is BillingAccessStatus {
  return PRO_ACCESS_STATUSES.includes(value as BillingAccessStatus)
}

function toSubscriptionSummary(
  row: BillingSubscriptionRow
): BillingSubscriptionSummary {
  return {
    id: row.id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeCustomerId: row.stripe_customer_id,
    status: row.status,
    planKey: row.plan_key,
    billingInterval: isBillingInterval(row.billing_interval)
      ? row.billing_interval
      : null,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    currentPeriodEnd: row.current_period_end,
    trialEnd: row.trial_end,
  }
}

function compareNullableDatesDesc(a: string | null, b: string | null) {
  const aTime = a ? new Date(a).getTime() : 0
  const bTime = b ? new Date(b).getTime() : 0
  return bTime - aTime
}

function sortSubscriptions(a: BillingSubscriptionRow, b: BillingSubscriptionRow) {
  return (
    compareNullableDatesDesc(a.current_period_end, b.current_period_end) ||
    compareNullableDatesDesc(a.trial_end, b.trial_end) ||
    compareNullableDatesDesc(a.updated_at, b.updated_at) ||
    compareNullableDatesDesc(a.created_at, b.created_at)
  )
}

export async function getBillingStatusForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BillingStatus> {
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select(
      `
      id,
      stripe_subscription_id,
      stripe_customer_id,
      status,
      plan_key,
      billing_interval,
      cancel_at_period_end,
      current_period_end,
      trial_end,
      created_at,
      updated_at
    `
    )
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  const rows = ((data ?? []) as BillingSubscriptionRow[]).sort(sortSubscriptions)

  const activeSubscription =
    rows.find(
      (row) => row.plan_key === 'pro' && isProAccessStatus(row.status)
    ) ?? null

  if (!activeSubscription) {
    return {
      entitlement: 'free',
      isPro: false,
      subscription: null,
    }
  }

  return {
    entitlement: 'pro',
    isPro: true,
    subscription: toSubscriptionSummary(activeSubscription),
  }
}
