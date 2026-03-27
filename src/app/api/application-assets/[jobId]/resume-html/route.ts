import { NextResponse } from 'next/server'
import { buildResumeHtmlDocument } from '@/lib/resume/render-resume-html'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ jobId: string }>
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

type CandidateProfileForResume = {
  full_name: string | null
  location: string | null
  phone: string | null
  email: string | null
}

function normalizeProfile(
  profile: Record<string, unknown>
): CandidateProfileForResume {
  return {
    full_name: toNullableString(profile.full_name),
    location: toNullableString(profile.location),
    phone: toNullableString(profile.phone),
    email: toNullableString(profile.email),
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params
  const supabase = await createClient()

  const [
    { data: asset, error: assetError },
    { data: job, error: jobError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from('application_assets')
      .select('job_id, resume_markdown')
      .eq('job_id', jobId)
      .maybeSingle(),
    supabase
      .from('jobs')
      .select('id, company, title')
      .eq('id', jobId)
      .maybeSingle(),
    supabase
      .from('candidate_profile')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  if (assetError) {
    return NextResponse.json({ error: assetError.message }, { status: 500 })
  }

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
  }

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!asset?.resume_markdown) {
    return NextResponse.json(
      { error: 'Resume markdown not found for this job.' },
      { status: 404 }
    )
  }

  const normalizedProfile = profile
    ? normalizeProfile(profile as Record<string, unknown>)
    : null

  const html = buildResumeHtmlDocument({
    markdown: asset.resume_markdown,
    candidateName: normalizedProfile?.full_name ?? null,
    location: normalizedProfile?.location ?? null,
    phone: normalizedProfile?.phone ?? null,
    email: normalizedProfile?.email ?? null,
    targetCompany: job?.company ?? null,
    targetRole: job?.title ?? null,
  })

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}