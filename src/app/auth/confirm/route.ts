import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const plan = searchParams.get('plan')

  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Missing confirmation token')}`
    )
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as 'signup' | 'recovery' | 'invite' | 'email' | 'email_change',
  })

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Could not confirm email')}`
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (plan === 'trial' || plan === 'month' || plan === 'year') {
    return NextResponse.redirect(`${origin}/dashboard?billing=${plan}`)
  }

  if (user) {
    const { count } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })

    if ((count ?? 0) === 0) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
