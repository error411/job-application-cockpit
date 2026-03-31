import { NextRequest, NextResponse } from 'next/server'
import { normalizeLinkedInUrl } from '@/lib/validation/linkedin'
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
      linkedin_url,
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

    const normalizedLinkedInUrl =
      typeof linkedin_url === 'string' && linkedin_url.trim().length > 0
        ? normalizeLinkedInUrl(linkedin_url)
        : null

    if (
      typeof linkedin_url === 'string' &&
      linkedin_url.trim().length > 0 &&
      !normalizedLinkedInUrl
    ) {
      return NextResponse.json(
        { error: 'Please enter a valid LinkedIn profile URL.' },
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
        linkedin_url: normalizedLinkedInUrl,
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