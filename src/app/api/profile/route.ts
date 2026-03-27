import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      id,
      full_name,
      email,
      phone,
      location,
      title,
      summary,
      strengths,
      experience_bullets,
    } = body

    if (!id || !full_name) {
      return NextResponse.json(
        { error: 'id and full_name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('candidate_profile')
      .update({
        full_name,
        email: email || null,
        phone: phone || null,
        location: location || null,
        title: title || null,
        summary: summary || null,
        strengths: Array.isArray(strengths) ? strengths : [],
        experience_bullets: Array.isArray(experience_bullets)
          ? experience_bullets
          : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}