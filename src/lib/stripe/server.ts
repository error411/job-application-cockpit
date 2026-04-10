import 'server-only'
import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeServerClient() {
  if (stripeClient) return stripeClient

  const apiKey = process.env.STRIPE_SECRET_KEY

  if (!apiKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  stripeClient = new Stripe(apiKey)

  return stripeClient
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET')
  }

  return secret
}
