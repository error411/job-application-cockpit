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

    const { data: experience, error } = await supabase
      .from('candidate_experience')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
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