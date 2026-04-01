import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/openai/client'
import type {
  ApplicationAssetInsert,
  CandidateProfileRow,
  JobRow,
} from '@/lib/supabase/model-types'

type AssetPayload = {
  resume_markdown: string
  cover_letter_markdown: string
  recruiter_note: string
}

type JobForAssets = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'description_raw'
>

type CandidateProfileForAssets = Pick<
  CandidateProfileRow,
  | 'id'
  | 'full_name'
  | 'title'
  | 'summary'
  | 'strengths'
  | 'experience_bullets'
  | 'linkedin_url'
> & {
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
}

type CandidateProfileBase = Pick<
  CandidateProfileRow,
  | 'id'
  | 'full_name'
  | 'title'
  | 'summary'
  | 'strengths'
  | 'experience_bullets'
  | 'linkedin_url'
>

type CandidateExperienceRow = {
  company: string
  title: string
  location: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean | null
  summary: string | null
  bullets: string[] | null
  technologies: string[] | null
  sort_order: number | null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function formatMonthYear(date: string | null): string | null {
  if (!date) return null

  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return null

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean | null
) {
  const start = formatMonthYear(startDate) ?? 'Unknown start'
  const end = isCurrent ? 'Present' : formatMonthYear(endDate) ?? 'Unknown end'

  return `${start} – ${end}`
}

function formatLocationLine(city: string | null, state: string | null) {
  const parts = [city, state].filter(Boolean)
  return parts.length ? parts.join(', ') : ''
}

function normalizeCandidateProfile(
  profile: CandidateProfileBase & Record<string, unknown>
): CandidateProfileForAssets {
  return {
    id: profile.id,
    full_name: profile.full_name,
    title: profile.title,
    summary: profile.summary,
    strengths: toStringArray(profile.strengths),
    experience_bullets: toStringArray(profile.experience_bullets),
    linkedin_url: toNullableString(profile.linkedin_url),
    email: toNullableString(profile.email),
    phone: toNullableString(profile.phone),
    city: toNullableString(profile.city),
    state: toNullableString(profile.state),
  }
}

export async function generateAssetsForJob(jobId: string) {
  const supabase = createAdminClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, company, title, location, description_raw')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    throw new Error(jobError?.message || 'Job not found')
  }

  const { data: profile, error: profileError } = await supabase
    .from('candidate_profile')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'Candidate profile not found')
  }

  const typedJob: JobForAssets = job
  const typedProfile = normalizeCandidateProfile(
    profile as CandidateProfileBase & Record<string, unknown>
  )

  const strengths = toStringArray(typedProfile.strengths)
  const experienceBullets = toStringArray(typedProfile.experience_bullets)
  const candidateLocation = formatLocationLine(typedProfile.city, typedProfile.state)

  const { data: experienceData, error: experienceError } = await supabase
    .from('candidate_experience')
    .select(
      'company, title, location, start_date, end_date, is_current, summary, bullets, technologies, sort_order'
    )
    .eq('candidate_profile_id', typedProfile.id)
    .order('sort_order', { ascending: true })

  if (experienceError) {
    throw new Error(experienceError.message)
  }

  const experienceRows = (experienceData ?? []) as CandidateExperienceRow[]

  const formattedExperience = experienceRows
    .map((exp) => {
      const bullets = toStringArray(exp.bullets)
      const technologies = toStringArray(exp.technologies)

      return `
${exp.title} @ ${exp.company}
Location: ${exp.location || 'Not specified'}
Dates: ${formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
${exp.summary ? `Summary: ${exp.summary}` : ''}
${bullets.length ? `Bullets:\n${bullets.map((b) => `- ${b}`).join('\n')}` : ''}
${technologies.length ? `Technologies: ${technologies.join(', ')}` : ''}
      `.trim()
    })
    .join('\n\n')

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: [
      {
        role: 'system',
        content: `
You tailor job application materials.

Rules:
- Be truthful
- Do not invent employers, dates, certifications, metrics, contact info, links, or locations
- Tailor tightly to the job description
- Use the candidate profile and structured past experience
- Prefer concrete, relevant experience over generic language
- Keep resume markdown concise, targeted, professional, and ATS-friendly
- Resume markdown should be formatted for real-world submission
- Cover letter must be 3 short paragraphs
- Recruiter note must be 2-4 sentences
- Output must follow the provided schema exactly

Resume formatting requirements:
- The first line must be the candidate full name as a markdown H1
- The second line must be a single plain text line with available contact details separated by " • "
- The contact line should include only fields that are actually provided
- Preferred order for the contact line: city/state, email, phone, LinkedIn- Then use clear sections such as Summary, Skills, Experience, and Education only when supported by the provided data
- Do not include placeholders like "Not specified" in the final resume
- Keep bullets tight and outcome-focused
        `.trim(),
      },
      {
        role: 'user',
        content: `
Candidate profile:
Name: ${typedProfile.full_name}
Title: ${typedProfile.title || ''}
Summary: ${typedProfile.summary || ''}
City: ${typedProfile.city || ''}
State: ${typedProfile.state || ''}
Location line: ${candidateLocation}
Email: ${typedProfile.email || ''}
Phone: ${typedProfile.phone || ''}
LinkedIn: ${typedProfile.linkedin_url || ''}

Strengths:
${strengths.length ? strengths.map((s) => `- ${s}`).join('\n') : '- None provided'}

General experience bullets:
${
  experienceBullets.length
    ? experienceBullets.map((b) => `- ${b}`).join('\n')
    : '- None provided'
}

Structured past experience:
${formattedExperience || 'No structured past experience provided.'}

Target job:
Company: ${typedJob.company}
Title: ${typedJob.title}
Location: ${typedJob.location || 'Not specified'}

Job description:
${typedJob.description_raw || ''}

Deliver:
- resume_markdown
- cover_letter_markdown
- recruiter_note
        `.trim(),
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'application_assets',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            resume_markdown: { type: 'string' },
            cover_letter_markdown: { type: 'string' },
            recruiter_note: { type: 'string' },
          },
          required: [
            'resume_markdown',
            'cover_letter_markdown',
            'recruiter_note',
          ],
        },
      },
    },
  })

  const rawText = response.output_text?.trim()

  if (!rawText) {
    throw new Error('No asset payload returned from model')
  }

  let parsed: AssetPayload

  try {
    parsed = JSON.parse(rawText) as AssetPayload
  } catch {
    throw new Error('Failed to parse asset payload')
  }

  const assetPayload: ApplicationAssetInsert = {
    job_id: typedJob.id,
    resume_markdown: parsed.resume_markdown,
    cover_letter_markdown: parsed.cover_letter_markdown,
    recruiter_note: parsed.recruiter_note,
  }

  const { data: savedAsset, error: saveError } = await supabase
    .from('application_assets')
    .upsert(assetPayload, { onConflict: 'job_id' })
    .select()
    .single()

  if (saveError) {
    throw new Error(saveError.message)
  }

  const { error: jobStatusError } = await supabase
    .from('jobs')
    .update({ status: 'ready_to_apply' })
    .eq('id', typedJob.id)

  if (jobStatusError) {
    throw new Error(jobStatusError.message)
  }

  return { asset: savedAsset }
}