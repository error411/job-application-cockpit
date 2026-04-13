import { NextRequest, NextResponse } from 'next/server'
import { normalizeLinkedInUrl } from '@/lib/validation/linkedin'
import { createClient } from '@/lib/supabase/server'
import { parseResumePdf, parseResumeText } from '@/lib/profile/parse-resume'

function toNullableString(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

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

    const body = (await req.json()) as {
      resumeText?: string
      resumePdfData?: string
      resumeFilename?: string
    }
    const resumeText = body.resumeText?.trim()
    const resumePdfData = body.resumePdfData?.trim()

    if (!resumePdfData && (!resumeText || resumeText.length < 80)) {
      return NextResponse.json(
        { error: 'Please provide resume text or upload a PDF to import.' },
        { status: 400 }
      )
    }

    const { data: currentProfile, error: profileFetchError } = await supabase
      .from('candidate_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileFetchError) {
      return NextResponse.json(
        { error: profileFetchError.message },
        { status: 500 }
      )
    }

    const parsed = resumePdfData
      ? await parseResumePdf(resumePdfData, body.resumeFilename)
      : await parseResumeText(resumeText!)

    const normalizedLinkedInUrl =
      parsed.linkedin_url && parsed.linkedin_url.length > 0
        ? normalizeLinkedInUrl(parsed.linkedin_url)
        : null

    const profilePayload = {
      user_id: user.id,
      full_name:
        parsed.full_name ??
        currentProfile?.full_name ??
        toNullableString(user.user_metadata?.full_name) ??
        '',
      email:
        parsed.email ??
        currentProfile?.email ??
        user.email ??
        null,
      phone: parsed.phone ?? currentProfile?.phone ?? null,
      location: parsed.location ?? currentProfile?.location ?? null,
      linkedin_url:
        normalizedLinkedInUrl ?? currentProfile?.linkedin_url ?? null,
      title: parsed.title ?? currentProfile?.title ?? null,
      summary: parsed.summary ?? currentProfile?.summary ?? null,
      strengths:
        parsed.strengths.length > 0
          ? parsed.strengths
          : currentProfile?.strengths ?? [],
      experience_bullets:
        parsed.experience_bullets.length > 0
          ? parsed.experience_bullets
          : currentProfile?.experience_bullets ?? [],
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error: profileSaveError } = await supabase
      .from('candidate_profile')
      .upsert(profilePayload, { onConflict: 'user_id' })
      .select()
      .single()

    if (profileSaveError) {
      return NextResponse.json(
        { error: profileSaveError.message },
        { status: 500 }
      )
    }

    const { error: deleteExperienceError } = await supabase
      .from('candidate_experience')
      .delete()
      .eq('user_id', user.id)

    if (deleteExperienceError) {
      return NextResponse.json(
        { error: deleteExperienceError.message },
        { status: 500 }
      )
    }

    let experience: Array<Record<string, unknown>> = []

    if (parsed.experience.length > 0) {
      const experiencePayload = parsed.experience.map((item) => ({
        user_id: user.id,
        candidate_profile_id: profile.id,
        company: item.company,
        title: item.title,
        location: item.location,
        start_date: item.start_date,
        end_date: item.end_date,
        is_current: item.is_current,
        summary: item.summary,
        bullets: item.bullets,
        technologies: item.technologies,
        sort_order: item.sort_order,
      }))

      const { data: savedExperience, error: experienceSaveError } = await supabase
        .from('candidate_experience')
        .insert(experiencePayload)
        .select('*')
        .order('sort_order', { ascending: true })

      if (experienceSaveError) {
        return NextResponse.json(
          { error: experienceSaveError.message },
          { status: 500 }
        )
      }

      experience = savedExperience ?? []
    }

    return NextResponse.json({
      profile: {
        ...profile,
        email: toNullableString(profile.email),
        phone: toNullableString(profile.phone),
        location: toNullableString(profile.location),
      },
      experience,
      imported: {
        experienceCount: experience.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to import resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
