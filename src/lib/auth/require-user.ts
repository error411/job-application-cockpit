import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireUser() {
  // Use this in protected Server Components and services that should only run
  // for signed-in users. redirect() stops rendering and sends the browser away.
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Authentication answers "who are you"; this profile check handles the app's
  // account-level access state.
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.account_status === 'suspended') {
    await supabase.auth.signOut()
    redirect('/login?error=Your account is suspended. Contact support for help.')
  }

  return { supabase, user }
}
