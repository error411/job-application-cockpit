'use server'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function normalizePlan(value: FormDataEntryValue | null) {
  return value === 'trial' || value === 'month' || value === 'year'
    ? value
    : null
}

type SignupReservation = {
  status?: 'existing_email' | 'invalid' | 'ip_limit' | 'pending' | 'reserved'
  reservation_token?: string
}

function getSignupAccountLimit() {
  const configuredLimit = Number.parseInt(
    process.env.SIGNUP_MAX_ACCOUNTS_PER_IP ?? '',
    10
  )

  return Number.isInteger(configuredLimit) && configuredLimit > 0
    ? Math.min(configuredLimit, 100)
    : 3
}

async function getClientIpHash() {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get('x-forwarded-for')
  const clientIp =
    requestHeaders.get('cf-connecting-ip')?.trim() ||
    requestHeaders.get('x-real-ip')?.trim() ||
    forwardedFor?.split(',')[0]?.trim() ||
    'local-development'
  const hashSecret =
    process.env.SIGNUP_IP_HASH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!hashSecret) {
    throw new Error(
      'Missing SIGNUP_IP_HASH_SECRET or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createHmac('sha256', hashSecret)
    .update(clientIp.toLowerCase())
    .digest('hex')
}

function signupError(message: string, plan: string | null) {
  const params = new URLSearchParams({ error: message })
  if (plan) params.set('plan', plan)
  return `/login?${params.toString()}`
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const plan = normalizePlan(formData.get('plan'))

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect(plan ? `/dashboard?billing=${plan}` : '/dashboard')
}

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const plan = normalizePlan(formData.get('plan'))
  const admin = createAdminClient()
  const ipHash = await getClientIpHash()

  const { data: reservationData, error: reservationError } = await admin.rpc(
    'reserve_signup_slot',
    {
      p_email: email,
      p_ip_hash: ipHash,
      p_max_accounts: getSignupAccountLimit(),
    }
  )
  const reservation = reservationData as SignupReservation | null

  if (reservationError || !reservation) {
    console.error('Could not reserve signup slot', reservationError)
    redirect(
      signupError('Could not create your account. Please try again.', plan)
    )
  }

  if (reservation.status === 'existing_email') {
    redirect(
      signupError(
        'An account with this email already exists. Log in instead.',
        plan
      )
    )
  }

  if (reservation.status === 'ip_limit') {
    redirect(
      signupError(
        'This network has reached the account creation limit.',
        plan
      )
    )
  }

  if (reservation.status !== 'reserved' || !reservation.reservation_token) {
    redirect(
      signupError(
        'An account creation request for this email is already in progress.',
        plan
      )
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: plan
        ? `${getSiteUrl()}/auth/confirm?plan=${plan}`
        : `${getSiteUrl()}/auth/confirm`,
    },
  })

  if (error || !data.user?.identities?.length) {
    const { error: releaseError } = await admin.rpc('release_signup_slot', {
      p_email: email,
      p_ip_hash: ipHash,
      p_reservation_token: reservation.reservation_token,
    })

    if (releaseError) {
      console.error('Could not release signup slot', releaseError)
    }

    const message = error
      ? error.message
      : 'An account with this email already exists. Log in instead.'
    redirect(signupError(message, plan))
  }

  redirect(
    `/login?message=${encodeURIComponent(
      'Check your email to confirm your account.'
    )}`
  )
}

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect('/login')
}
