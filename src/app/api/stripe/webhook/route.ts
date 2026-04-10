import { NextResponse } from 'next/server'
import {
  getStripeServerClient,
  getStripeWebhookSecret,
} from '@/lib/stripe/server'
import {
  handleStripeBillingEvent,
  markStripeEventProcessed,
  recordStripeEventReceived,
} from '@/lib/billing/sync-stripe-billing'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { ok: false, error: 'Missing Stripe signature.' },
      { status: 400 }
    )
  }

  const body = await req.text()

  try {
    const stripe = getStripeServerClient()
    const webhookSecret = getStripeWebhookSecret()

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

    const { alreadyProcessed } = await recordStripeEventReceived(event)

    if (alreadyProcessed) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    try {
      const result = await handleStripeBillingEvent(event)
      await markStripeEventProcessed(event.id)

      return NextResponse.json({ ok: true, ...result })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Stripe event processing failed.'

      await markStripeEventProcessed(event.id, message)

      return NextResponse.json(
        { ok: false, error: message },
        { status: 500 }
      )
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid Stripe webhook event.'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 }
    )
  }
}
