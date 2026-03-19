import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { openai } from '../../../lib/openai/client'
import type {
  CandidateProfileRow,
  JobRow,
  JobScoreInsert,
} from '../../../lib/supabase/types'

type RequestBody = {
  jobId?: string
}

type ScorePayload = {
  score: number
  matched_skills: string[]
  missing_skills: string[]
  reasons: string[]
}

type JobForScore = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'description_raw'
>

type CandidateProfileForScore = Pick<
  CandidateProfileRow,
  'id' | 'full_name' | 'title' | 'summary' | 'strengths' | 'experience_bullets'
>

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await req.json()) as RequestBody
    const { jobId } = body

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, company, title, location, description_raw')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: jobError?.message || 'Job not found' },
        { status: 404 }
      )
    }

    if (!job.description_raw?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required before scoring.' },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('candidate_profile')
      .select('id, full_name, title, summary, strengths, experience_bullets')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError?.message || 'Candidate profile not found' },
        { status: 404 }
      )
    }

    const typedJob: JobForScore = job
    const typedProfile: CandidateProfileForScore = profile

    const strengths = toStringArray(typedProfile.strengths)
    const experienceBullets = toStringArray(typedProfile.experience_bullets)

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
- Output must follow the provided schema exactly
          `.trim(),
        },
        {
          role: 'user',
          content: `
Candidate profile:
Name: ${typedProfile.full_name}
Title: ${typedProfile.title || ''}
Summary: ${typedProfile.summary || ''}

Strengths:
${strengths.map((s) => `- ${s}`).join('\n')}

Experience bullets:
${experienceBullets.map((b) => `- ${b}`).join('\n')}

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

    const parsed = JSON.parse(response.output_text) as ScorePayload

    const insertPayload: JobScoreInsert = {
      job_id: typedJob.id,
      score: parsed.score,
      matched_skills: parsed.matched_skills,
      missing_skills: parsed.missing_skills,
      reasons: parsed.reasons,
    }

    const { data: savedScore, error: saveError } = await supabase
      .from('job_scores')
      .insert(insertPayload)
      .select()
      .single()

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    return NextResponse.json({ score: savedScore })
  } catch (error) {
    console.error('POST /api/score error:', error)

    return NextResponse.json(
      {
        error: 'Failed to score job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}