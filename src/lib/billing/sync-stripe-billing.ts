import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/lib/supabase/schema'
import type {
  BillingCustomerInsert,
  BillingSubscriptionInsert,
  BillingSubscriptionUpdate,
} from '@/lib/supabase/model-types'

type StripeSubscriptionStatus = BillingSubscriptionInsert['status']
type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number | null
  current_period_end?: number | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getMetadataString(
  metadata: Stripe.Metadata | null | undefined,
  key: string
) {
  const value = metadata?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function toIsoString(timestamp?: number | null) {
  if (!timestamp) return null
  return new Date(timestamp * 1000).toISOString()
}

function toPlanKey(subscription: Stripe.Subscription) {
  const metadataPlan = getMetadataString(subscription.metadata, 'plan_key')
  return metadataPlan ?? 'pro'
}

function toBillingInterval(
  subscription: Stripe.Subscription
): 'month' | 'year' | null {
  const interval = subscription.items.data[0]?.price.recurring?.interval
  return interval === 'month' || interval === 'year' ? interval : null
}

function toAmountCents(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.unit_amount ?? null
}

function toCurrency(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.currency ?? null
}

function buildSubscriptionPayload(args: {
  userId: string
  billingCustomerId: string | null
  stripeCustomerId: string
  subscription: Stripe.Subscription
}): BillingSubscriptionInsert {
  const { userId, billingCustomerId, stripeCustomerId, subscription } = args

  return {
    user_id: userId,
    billing_customer_id: billingCustomerId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: stripeCustomerId,
    stripe_price_id: subscription.items.data[0]?.price.id ?? null,
    stripe_product_id:
      typeof subscription.items.data[0]?.price.product === 'string'
        ? subscription.items.data[0]?.price.product
        : subscription.items.data[0]?.price.product?.id ?? null,
    plan_key: toPlanKey(subscription),
    billing_interval: toBillingInterval(subscription),
    status: subscription.status as StripeSubscriptionStatus,
    currency: toCurrency(subscription),
    amount_cents: toAmountCents(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: toIsoString(
      (subscription as StripeSubscriptionWithPeriods).current_period_start
    ),
    current_period_end: toIsoString(
      (subscription as StripeSubscriptionWithPeriods).current_period_end
    ),
    trial_start: toIsoString(subscription.trial_start),
    trial_end: toIsoString(subscription.trial_end),
    canceled_at: toIsoString(subscription.canceled_at),
    ended_at: toIsoString(subscription.ended_at),
    metadata: subscription.metadata ?? {},
    raw_stripe_json: subscription as unknown as Json,
  }
}

async function findBillingCustomerByStripeCustomerId(stripeCustomerId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('billing_customers')
    .select('id, user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function recordStripeEventReceived(event: Stripe.Event) {
  const supabase = createAdminClient()

  const { data: existing, error: existingError } = await supabase
    .from('billing_events')
    .select('id, processed_at')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing) {
    return {
      alreadyProcessed: Boolean(existing.processed_at),
    }
  }

  const { error: insertError } = await supabase.from('billing_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    livemode: event.livemode,
    api_version: event.api_version ?? null,
    payload: event as unknown as Json,
  })

  if (insertError) {
    throw new Error(insertError.message)
  }

  return { alreadyProcessed: false }
}

export async function markStripeEventProcessed(
  eventId: string,
  processingError?: string | null
) {
  const supabase = createAdminClient()

  const payload = processingError
    ? {
        processed_at: null,
        processing_error: processingError,
      }
    : {
        processed_at: new Date().toISOString(),
        processing_error: null,
      }

  const { error } = await supabase
    .from('billing_events')
    .update(payload)
    .eq('stripe_event_id', eventId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function syncStripeCheckoutSession(
  session: Stripe.Checkout.Session
) {
  const userId =
    session.client_reference_id ??
    getMetadataString(session.metadata, 'app_user_id')

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id

  if (!userId || !stripeCustomerId) {
    return { skipped: true, reason: 'Missing app user or Stripe customer id.' }
  }

  const supabase = createAdminClient()

  const customerPayload: BillingCustomerInsert = {
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    email:
      session.customer_details?.email ??
      getMetadataString(session.metadata, 'customer_email'),
  }

  const { error } = await supabase
    .from('billing_customers')
    .upsert(customerPayload, { onConflict: 'user_id' })

  if (error) {
    throw new Error(error.message)
  }

  return {
    skipped: false,
    userId,
    stripeCustomerId,
  }
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription
) {
  const stripeCustomerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const metadataUserId = getMetadataString(subscription.metadata, 'app_user_id')
  const mappedCustomer = await findBillingCustomerByStripeCustomerId(stripeCustomerId)
  const userId = metadataUserId ?? mappedCustomer?.user_id ?? null

  if (!userId) {
    return {
      skipped: true,
      reason: 'No user mapping found for Stripe subscription.',
    }
  }

  const supabase = createAdminClient()

  let billingCustomerId = mappedCustomer?.id ?? null

  if (!billingCustomerId) {
    const customerPayload: BillingCustomerInsert = {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      email: null,
    }

    const { data: upsertedCustomer, error: customerError } = await supabase
      .from('billing_customers')
      .upsert(customerPayload, { onConflict: 'user_id' })
      .select('id')
      .single()

    if (customerError) {
      throw new Error(customerError.message)
    }

    billingCustomerId = upsertedCustomer.id
  }

  const payload = buildSubscriptionPayload({
    userId,
    billingCustomerId,
    stripeCustomerId,
    subscription,
  })

  const { data: existingSubscription, error: existingError } = await supabase
    .from('billing_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existingSubscription) {
    const updatePayload: BillingSubscriptionUpdate = payload

    const { error: updateError } = await supabase
      .from('billing_subscriptions')
      .update(updatePayload)
      .eq('stripe_subscription_id', subscription.id)

    if (updateError) {
      throw new Error(updateError.message)
    }
  } else {
    const { error: insertError } = await supabase
      .from('billing_subscriptions')
      .insert(payload)

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  return {
    skipped: false,
    userId,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
  }
}

export async function handleStripeBillingEvent(event: Stripe.Event) {
  const object = event.data.object

  if (!isObject(object)) {
    return { handled: false, reason: 'Event object was not usable.' }
  }

  switch (event.type) {
    case 'checkout.session.completed':
      return {
        handled: true,
        result: await syncStripeCheckoutSession(
          object as Stripe.Checkout.Session
        ),
      }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return {
        handled: true,
        result: await syncStripeSubscription(object as Stripe.Subscription),
      }
    default:
      return {
        handled: false,
        reason: `Ignored Stripe event type: ${event.type}`,
      }
  }
}
