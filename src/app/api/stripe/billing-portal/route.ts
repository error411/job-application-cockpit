import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeServerClient } from '@/lib/stripe/server'

type BillingPortalRequest = {
  returnPath?: string
}

function getSiteUrl(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
}

function normalizePath(path: string | undefined, fallback: string) {
  if (!path) return fallback
  return path.startsWith('/') ? path : `/${path}`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as BillingPortalRequest
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer, error: customerError } = await supabase
      .from('billing_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    if (!customer?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer is linked to this account yet.' },
        { status: 400 }
      )
    }

    const stripe = getStripeServerClient()
    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${getSiteUrl(req)}${normalizePath(
        body.returnPath,
        '/dashboard?billing=portal'
      )}`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to open billing portal.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
