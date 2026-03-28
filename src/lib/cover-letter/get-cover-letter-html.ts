import { buildCoverLetterHtmlDocument } from '@/lib/cover-letter/render-cover-letter-html'
import { createClient } from '@/lib/supabase/server'

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

type CandidateProfileForCoverLetter = {
  full_name: string | null
  location: string | null
  phone: string | null
  email: string | null
}

function normalizeProfile(
  profile: Record<string, unknown>
): CandidateProfileForCoverLetter {
  return {
    full_name: toNullableString(profile.full_name),
    location: toNullableString(profile.location),
    phone: toNullableString(profile.phone),
    email: toNullableString(profile.email),
  }
}

export async function getCoverLetterHtml(jobId: string): Promise<string> {
  const supabase = await createClient()

  const [
    { data: asset, error: assetError },
    { data: job, error: jobError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from('application_assets')
      .select('job_id, cover_letter_markdown')
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
    throw new Error(assetError.message)
  }

  if (jobError) {
    throw new Error(jobError.message)
  }

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!job) {
    throw new Error('Job not found.')
  }

  if (!asset?.cover_letter_markdown) {
    throw new Error('Cover letter markdown not found for this job.')
  }

  const normalizedProfile = profile
    ? normalizeProfile(profile as Record<string, unknown>)
    : null

  return buildCoverLetterHtmlDocument({
    markdown: asset.cover_letter_markdown,
    candidateName: normalizedProfile?.full_name ?? null,
    location: normalizedProfile?.location ?? null,
    phone: normalizedProfile?.phone ?? null,
    email: normalizedProfile?.email ?? null,
    targetCompany: job.company ?? null,
    targetRole: job.title ?? null,
  })
}