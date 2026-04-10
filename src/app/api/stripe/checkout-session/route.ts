import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeServerClient } from '@/lib/stripe/server'

type CheckoutSessionRequest = {
  priceId?: string
  billingInterval?: 'month' | 'year'
  successPath?: string
  cancelPath?: string
}

function getSiteUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
}

function normalizePath(path: string | undefined, fallback: string) {
  if (!path) return fallback
  return path.startsWith('/') ? path : `/${path}`
}

function getConfiguredPriceId(interval?: 'month' | 'year') {
  if (interval === 'year') {
    return process.env.STRIPE_PRICE_PRO_YEARLY_ID ?? null
  }

  if (interval === 'month') {
    return process.env.STRIPE_PRICE_PRO_MONTHLY_ID ?? null
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CheckoutSessionRequest
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const priceId =
      (typeof body.priceId === 'string' && body.priceId) ||
      getConfiguredPriceId(body.billingInterval)

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            'Missing Stripe price id. Provide priceId in the request body or configure STRIPE_PRICE_PRO_MONTHLY_ID / STRIPE_PRICE_PRO_YEARLY_ID.',
        },
        { status: 400 }
      )
    }

    const stripe = getStripeServerClient()
    const siteUrl = getSiteUrl(req)
    const successPath = normalizePath(body.successPath, '/dashboard?billing=success')
    const cancelPath = normalizePath(body.cancelPath, '/dashboard?billing=cancelled')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}${successPath}`,
      cancel_url: `${siteUrl}${cancelPath}`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      metadata: {
        app_user_id: user.id,
        plan_key: 'pro',
      },
      subscription_data: {
        metadata: {
          app_user_id: user.id,
          plan_key: 'pro',
        },
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkoutSessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create checkout session.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
