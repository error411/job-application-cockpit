import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: profile, error: profileError } = await supabase
      .from('candidate_profile')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError?.message || 'Candidate profile not found.' },
        { status: 404 }
      )
    }

    const { data: experience, error: experienceError } = await supabase
      .from('candidate_experience')
      .select('*')
      .eq('candidate_profile_id', profile.id)
      .order('sort_order', { ascending: true })

    if (experienceError) {
      return NextResponse.json(
        { error: experienceError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ experience: experience ?? [] })
  } catch (error) {
    console.error('GET /api/profile/experience/current error:', error)
    return NextResponse.json(
      { error: 'Failed to load experience.' },
      { status: 500 }
    )
  }
}