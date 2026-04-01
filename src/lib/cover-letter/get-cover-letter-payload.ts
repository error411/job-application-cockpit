import { createAdminClient } from '@/lib/supabase/admin'

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
  linkedin_url: string | null
}

function normalizeProfile(
  profile: Record<string, unknown>
) {
  return {
    full_name: toNullableString(profile.full_name),
    location: toNullableString(profile.location),
    phone: toNullableString(profile.phone),
    email: toNullableString(profile.email),
    linkedin_url: toNullableString(profile.linkedin_url),
  }
}

export type CoverLetterPayload = {
  markdown: string
  candidateName: string | null
  location: string | null
  phone: string | null
  email: string | null
  linkedinUrl: string | null
  targetCompany: string | null
  targetRole: string | null
}

export async function getCoverLetterPayload(
  jobId: string
): Promise<CoverLetterPayload> {
  const supabase = createAdminClient()

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

  return {
    markdown: asset.cover_letter_markdown,
    candidateName: normalizedProfile?.full_name ?? null,
    location: normalizedProfile?.location ?? null,
    phone: normalizedProfile?.phone ?? null,
    email: normalizedProfile?.email ?? null,
    linkedinUrl: normalizedProfile?.linkedin_url ?? null,
    targetCompany: job.company ?? null,
    targetRole: job.title ?? null,
  }
}