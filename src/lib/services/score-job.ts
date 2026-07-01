import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/openai/client'
import { getCareerOsApplicationAssetContext } from '@/lib/careeros/application-assets-context'
import type {
  CandidateProfileRow,
  JobRow,
  JobScoreInsert,
} from '@/lib/supabase/model-types'

type ScorePayload = {
  score: number
  matched_skills: string[]
  missing_skills: string[]
  reasons: string[]
}

type JobForScore = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'description_raw' | 'user_id'
>

type CandidateProfileForScore = Pick<
  CandidateProfileRow,
  'id' | 'full_name' | 'title' | 'summary' | 'strengths' | 'experience_bullets'
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

type ScorePromptContext = {
  sourceLabel: string
  candidateProfileBlock: string
  strengthsBlock: string
  generalExperienceBlock: string
  structuredExperienceBlock: string
  projectsBlock: string
  accomplishmentsBlock: string
  starStoriesBlock: string
  hasStructuredExperience: boolean
}

type JobScoreRouteInsert = Omit<
  JobScoreInsert,
  'matched_skills' | 'missing_skills'
> & {
  matched_skills?: string[]
  missing_skills?: string[]
}

function toStringArray(value: unknown): string[] {
  // Supabase JSON/array columns arrive as unknown from generated types in a few
  // places, so this helper narrows them before they go into prompts.
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function normalizeStringArray(value: unknown): string[] | undefined {
  // Returning undefined keeps empty arrays out of insert payloads when the model
  // produced no useful values for an optional list.
  if (!Array.isArray(value)) return undefined

  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  return normalized.length > 0 ? normalized : undefined
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean | null
) {
  const start = startDate ? startDate.slice(0, 7) : 'Unknown start'
  const end = isCurrent ? 'Present' : endDate ? endDate.slice(0, 7) : 'Unknown end'
  return `${start} to ${end}`
}

async function getProfileExperienceBlock(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const { data: experienceData, error: experienceError } = await supabase
    .from('candidate_experience')
    .select(
      'company, title, location, start_date, end_date, is_current, summary, bullets, technologies, sort_order'
    )
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (experienceError) {
    throw new Error(experienceError.message)
  }

  const experienceRows = (experienceData ?? []) as CandidateExperienceRow[]

  const block = experienceRows
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

  return {
    block,
    hasExperience: experienceRows.length > 0,
  }
}

async function getLegacyScorePromptContext(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<ScorePromptContext> {
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profile')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'Candidate profile not found')
  }

  const typedProfile: CandidateProfileForScore = profile
  const strengths = toStringArray(typedProfile.strengths)
  const experienceBullets = toStringArray(typedProfile.experience_bullets)
  const profileExperience = await getProfileExperienceBlock(supabase, userId)

  return {
    sourceLabel: 'Legacy candidate_profile and candidate_experience',
    candidateProfileBlock: `
Name: ${typedProfile.full_name}
Title: ${typedProfile.title || ''}
Summary: ${typedProfile.summary || ''}
    `.trim(),
    strengthsBlock: strengths.length
      ? strengths.map((s) => `- ${s}`).join('\n')
      : '- None provided',
    generalExperienceBlock: experienceBullets.length
      ? experienceBullets.map((b) => `- ${b}`).join('\n')
      : '- None provided',
    structuredExperienceBlock:
      profileExperience.block || 'No structured past experience provided.',
    projectsBlock: '- None provided',
    accomplishmentsBlock: '- None provided',
    starStoriesBlock: '- None provided',
    hasStructuredExperience: profileExperience.hasExperience,
  }
}

async function getScorePromptContext(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<ScorePromptContext> {
  const careerOsContext = await getCareerOsApplicationAssetContext(
    supabase,
    userId
  )

  if (careerOsContext) {
    const profileExperience = await getProfileExperienceBlock(supabase, userId)
    const structuredExperienceBlocks = [
      careerOsContext.experienceBlock
        ? `CareerOS roles:\n${careerOsContext.experienceBlock}`
        : '',
      profileExperience.block
        ? `Profile job experience:\n${profileExperience.block}`
        : '',
    ].filter(Boolean)

    return {
      sourceLabel: profileExperience.hasExperience
        ? 'CareerOS structured profile and candidate_profile job experience'
        : 'CareerOS structured profile',
      candidateProfileBlock: careerOsContext.candidateBlock,
      strengthsBlock: careerOsContext.skillsBlock,
      generalExperienceBlock:
        '- CareerOS accomplishments, roles, projects, skills, technologies, and STAR stories are the primary source.',
      structuredExperienceBlock:
        structuredExperienceBlocks.join('\n\n') ||
        'No structured CareerOS roles provided.',
      projectsBlock: careerOsContext.projectsBlock || '- None provided',
      accomplishmentsBlock:
        careerOsContext.accomplishmentsBlock || '- None provided',
      starStoriesBlock: careerOsContext.starStoriesBlock || '- None provided',
      hasStructuredExperience:
        careerOsContext.hasStructuredExperience ||
        profileExperience.hasExperience,
    }
  }

  return getLegacyScorePromptContext(supabase, userId)
}

export async function scoreJobService(jobId: string) {
  // Scoring uses the admin client because it may run from server routes and must
  // read/write several tables as one trusted backend operation.
  const supabase = createAdminClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, company, title, location, description_raw, user_id')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    throw new Error(jobError?.message || 'Job not found')
  }

  if (!job.description_raw?.trim()) {
    throw new Error('Job description is required before scoring.')
  }

  if (!job.user_id) {
    throw new Error('Job user not found')
  }

  const userId = job.user_id
  const typedJob: JobForScore = job
  const promptContext = await getScorePromptContext(supabase, userId)

  // The model is asked for strict JSON so the app can parse and store a
  // predictable score payload instead of scraping free-form text.
  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: [
      {
        role: 'system',
        content: `
You score job fit for a candidate.

Rules:
- Be truthful
- Do not invent skills or experience
- Score from 0 to 100
- matched_skills should list concrete overlaps
- missing_skills should list important missing requirements
- reasons should be short bullet-style explanations
- Use both the profile summary and structured past experience
- If CareerOS data is provided, treat it as the primary source of truth
- Prefer CareerOS accomplishments, roles, projects, skills, technologies, and STAR stories over legacy profile bullets
- Give strong weight to directly relevant work history
- Output must follow the provided schema exactly
        `.trim(),
      },
      {
        role: 'user',
        content: `
Source system: ${promptContext.sourceLabel}

Candidate profile:
${promptContext.candidateProfileBlock}

Strengths:
${promptContext.strengthsBlock}

General experience bullets:
${promptContext.generalExperienceBlock}

Structured past experience:
${promptContext.structuredExperienceBlock}

Projects:
${promptContext.projectsBlock}

Reusable accomplishments:
${promptContext.accomplishmentsBlock}

STAR interview stories:
${promptContext.starStoriesBlock}

Structured experience present: ${promptContext.hasStructuredExperience ? 'yes' : 'no'}

Target job:
Company: ${typedJob.company}
Title: ${typedJob.title}
Location: ${typedJob.location || 'Not specified'}

Job description:
${typedJob.description_raw}
        `.trim(),
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'job_score',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
            },
            matched_skills: {
              type: 'array',
              items: { type: 'string' },
            },
            missing_skills: {
              type: 'array',
              items: { type: 'string' },
            },
            reasons: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['score', 'matched_skills', 'missing_skills', 'reasons'],
        },
      },
    },
  })

  const rawText = response.output_text?.trim()

  if (!rawText) {
    throw new Error('No score payload returned from model')
  }

  let parsed: ScorePayload

  try {
    parsed = JSON.parse(rawText) as ScorePayload
  } catch {
    throw new Error('Failed to parse score payload')
  }

  const insertPayload: JobScoreRouteInsert = {
    job_id: typedJob.id,
    user_id: typedJob.user_id,
    score: parsed.score,
    matched_skills: normalizeStringArray(parsed.matched_skills),
    missing_skills: normalizeStringArray(parsed.missing_skills),
    reasons: parsed.reasons,
  }

  // Store scores as their own rows so the app can retain scoring history, then
  // update the job's current status for quick filtering in the UI.
  const { data: savedScore, error: saveError } = await supabase
    .from('job_scores')
    .insert(insertPayload)
    .select()
    .single()

  if (saveError) {
    throw new Error(saveError.message)
  }

  const { error: jobStatusError } = await supabase
    .from('jobs')
    .update({ status: 'scored' })
    .eq('id', typedJob.id)

  if (jobStatusError) {
    throw new Error(jobStatusError.message)
  }

  return {
    score: savedScore,
  }
}
