import { NextRequest, NextResponse } from 'next/server'
import { normalizeLinkedInUrl } from '@/lib/validation/linkedin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const {
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

    if (!full_name?.trim()) {
      return NextResponse.json(
        { error: 'full_name is required' },
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

    const payload = {
      user_id: user.id,
      full_name: full_name.trim(),
      email: typeof email === 'string' && email.trim() ? email.trim() : null,
      phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      location:
        typeof location === 'string' && location.trim() ? location.trim() : null,
      linkedin_url: normalizedLinkedInUrl,
      title: typeof title === 'string' && title.trim() ? title.trim() : null,
      summary:
        typeof summary === 'string' && summary.trim() ? summary.trim() : null,
      strengths: Array.isArray(strengths)
        ? strengths.map((item) => String(item).trim()).filter(Boolean)
        : [],
      experience_bullets: Array.isArray(experience_bullets)
        ? experience_bullets.map((item) => String(item).trim()).filter(Boolean)
        : [],
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('candidate_profile')
      .upsert(payload, {
        onConflict: 'user_id',
      })
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