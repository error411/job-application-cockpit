'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function normalizePlan(value: FormDataEntryValue | null) {
  return value === 'trial' || value === 'month' || value === 'year'
    ? value
    : null
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
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const plan = normalizePlan(formData.get('plan'))

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: plan
        ? `${getSiteUrl()}/auth/confirm?plan=${plan}`
        : `${getSiteUrl()}/auth/confirm`,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
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
