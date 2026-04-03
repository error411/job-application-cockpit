import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('candidate_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json({ profile: existing })
    }

    const { data: created, error: insertError } = await supabase
      .from('candidate_profile')
      .insert({
        user_id: user.id,
        full_name: '',
        email: user.email ?? null,
        phone: null,
        location: null,
        linkedin_url: null,
        title: null,
        summary: null,
        strengths: [],
        experience_bullets: [],
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: created })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}