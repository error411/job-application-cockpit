'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function getFields(formData: FormData) {
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  }
}

export async function login(formData: FormData) {
  const { email, password } = getFields(formData)
  const supabase = await createClient()

  if (!email || !password) {
    redirect('/login?error=Email%20and%20password%20are%20required')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/today')
}

export async function signup(formData: FormData) {
  const { email, password } = getFields(formData)
  const supabase = await createClient()

  if (!email || !password) {
    redirect('/login?error=Email%20and%20password%20are%20required')
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Check%20your%20email%20to%20confirm%20your%20account')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login?message=Signed%20out')
}