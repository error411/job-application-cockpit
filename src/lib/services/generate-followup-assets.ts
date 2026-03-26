import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type CandidateProfileRow = {
  full_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  summary: string | null
}

type CandidateExperienceRow = {
  company: string | null
  title: string | null
  start_date: string | null
  end_date: string | null
}

type JobRow = {
  id: string
  company: string | null
  title: string | null
  location: string | null
}

type ApplicationRow = {
  id: string
  job_id: string
  status: string | null
  applied_at: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  follow_up_1_sent_at: string | null
  follow_up_2_sent_at: string | null
  notes: string | null
}

type ApplicationAssetRow = {
  id: string
  job_id: string
  resume_markdown: string | null
  cover_letter_markdown: string | null
  follow_up_1_email_markdown: string | null
  follow_up_2_email_markdown: string | null
  created_at: string
}

function summarizeExperience(rows: CandidateExperienceRow[]) {
  return rows.slice(0, 6).map((row) => ({
    company: row.company,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
  }))
}

function getFollowupStage(application: ApplicationRow) {
  const now = new Date()

  const followUp1Due =
    application.follow_up_1_due &&
    new Date(application.follow_up_1_due) <= now &&
    !application.follow_up_1_sent_at

  const followUp2Due =
    application.follow_up_2_due &&
    new Date(application.follow_up_2_due) <= now &&
    !application.follow_up_2_sent_at

  if (followUp2Due) return 2
  if (followUp1Due) return 1
  return null
}

export async function generateFollowupAssetsForJob(jobId: string) {
  const supabase = await createClient()

  const [
    { data: applicationData, error: applicationError },
    { data: jobData, error: jobError },
    { data: profileData, error: profileError },
    { data: experienceData, error: experienceError },
    { data: assetData, error: assetError },
  ] = await Promise.all([
    supabase
      .from('applications')
      .select(`
        id,
        job_id,
        status,
        applied_at,
        follow_up_1_due,
        follow_up_2_due,
        follow_up_1_sent_at,
        follow_up_2_sent_at,
        notes
      `)
      .eq('job_id', jobId)
      .maybeSingle(),

    supabase
      .from('jobs')
      .select('id, company, title, location')
      .eq('id', jobId)
      .single(),

    supabase
      .from('candidate_profile')
      .select('full_name, email, phone, city, state, summary')
      .limit(1)
      .maybeSingle(),

    supabase
      .from('candidate_experience')
      .select('company, title, start_date, end_date')
      .order('start_date', { ascending: false }),

    supabase
      .from('application_assets')
      .select(`
        id,
        job_id,
        resume_markdown,
        cover_letter_markdown,
        follow_up_1_email_markdown,
        follow_up_2_email_markdown,
        created_at
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (applicationError) throw new Error(applicationError.message)
  if (jobError) throw new Error(jobError.message)
  if (profileError) throw new Error(profileError.message)
  if (experienceError) throw new Error(experienceError.message)
  if (assetError) throw new Error(assetError.message)

  const application = applicationData as ApplicationRow | null
  const job = jobData as JobRow | null
  const profile = profileData as CandidateProfileRow | null
  const experience = (experienceData ?? []) as CandidateExperienceRow[]
  const latestAsset = assetData as ApplicationAssetRow | null

  if (!application) {
    throw new Error(`No application found for job ${jobId}`)
  }

  if (!job) {
    throw new Error(`No job found for job ${jobId}`)
  }

  const stage = getFollowupStage(application)

  if (!stage) {
    return {
      generated: false,
      reason: 'No follow-up is currently due.',
    }
  }

  const existingContent =
    stage === 1
      ? latestAsset?.follow_up_1_email_markdown
      : latestAsset?.follow_up_2_email_markdown

  if (existingContent?.trim()) {
    return {
      generated: false,
      reason: `Follow-up ${stage} content already exists.`,
      stage,
    }
  }

  const systemPrompt = [
    'You write concise, professional, human job application follow-up emails.',
    'Keep the tone warm, confident, brief, and natural.',
    'Do not sound desperate, robotic, or generic.',
    'Return valid JSON only.',
  ].join(' ')

  const userPrompt = JSON.stringify(
    {
      stage,
      candidate: {
        fullName: profile?.full_name ?? '',
        email: profile?.email ?? '',
        phone: profile?.phone ?? '',
        location: [profile?.city, profile?.state].filter(Boolean).join(', '),
        summary: profile?.summary ?? '',
      },
      job: {
        company: job.company ?? '',
        title: job.title ?? '',
        location: job.location ?? '',
      },
      application: {
        appliedAt: application.applied_at,
        notes: application.notes,
      },
      existingAssets: {
        resumeMarkdown: latestAsset?.resume_markdown ?? '',
        coverLetterMarkdown: latestAsset?.cover_letter_markdown ?? '',
      },
      experience: summarizeExperience(experience),
      requirements: {
        targetLength: '90-150 words',
        includeSubject: true,
        markdownBody: true,
      },
    },
    null,
    2,
  )

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: systemPrompt }],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: userPrompt }],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'followup_email',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            subject: { type: 'string' },
            body_markdown: { type: 'string' },
          },
          required: ['subject', 'body_markdown'],
        },
      },
    },
  })

  const outputText = response.output_text
  if (!outputText) {
    throw new Error('Model returned no follow-up content.')
  }

  const parsed = JSON.parse(outputText) as {
    subject: string
    body_markdown: string
  }

  const composedMarkdown = `Subject: ${parsed.subject}\n\n${parsed.body_markdown}`

    if (latestAsset) {
    const updatePayload =
      stage === 1
        ? ({
            follow_up_1_email_markdown: composedMarkdown,
          } as unknown as {
            follow_up_1_email_markdown?: string | null
            follow_up_2_email_markdown?: string | null
          })
        : ({
            follow_up_2_email_markdown: composedMarkdown,
          } as unknown as {
            follow_up_1_email_markdown?: string | null
            follow_up_2_email_markdown?: string | null
          })

    const { error: updateError } = await supabase
      .from('application_assets')
      .update(updatePayload as never)
      .eq('id', latestAsset.id)

    if (updateError) {
      throw new Error(updateError.message)
    }
    } else {
    const insertPayload =
      stage === 1
        ? ({
            job_id: jobId,
            follow_up_1_email_markdown: composedMarkdown,
          } as unknown as {
            job_id: string
            follow_up_1_email_markdown?: string | null
            follow_up_2_email_markdown?: string | null
          })
        : ({
            job_id: jobId,
            follow_up_2_email_markdown: composedMarkdown,
          } as unknown as {
            job_id: string
            follow_up_1_email_markdown?: string | null
            follow_up_2_email_markdown?: string | null
          })

    const { error: insertError } = await supabase
      .from('application_assets')
      .insert(insertPayload as never)

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  return {
    generated: true,
    stage,
    subject: parsed.subject,
  }
}