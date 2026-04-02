import { NextRequest, NextResponse } from 'next/server'
import { createJobWithApplication } from '@/lib/services/create-job'
import { scoreJobService } from '@/lib/services/score-job'

type CreateJobResponse = {
  job: {
    id: string
    company: string | null
    title: string | null
    status: string | null
  }
  application: {
    id: string
    job_id: string
    status: string | null
  }
  score?: {
    id?: string
    score?: number | null
  } | null
  scoringApplied: boolean
  scoringError?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      company,
      title,
      location,
      url,
      description,
      description_raw,
    } = body ?? {}

    if (!company || !title) {
      return NextResponse.json(
        { error: 'Company and title are required.' },
        { status: 400 }
      )
    }

    const descriptionValue =
      typeof description === 'string'
        ? description
        : typeof description_raw === 'string'
          ? description_raw
          : ''

    const descriptionText = descriptionValue.trim()

    const { job, application } = await createJobWithApplication({
      company: String(company),
      title: String(title),
      location: location ? String(location) : null,
      url: url ? String(url) : null,
      description: descriptionText,
    })

    let score: CreateJobResponse['score'] = null
    let scoringApplied = false
    let scoringError: string | null = null

    try {
      const scoringResult = await scoreJobService(job.id)

      score = {
        id:
          scoringResult.score &&
          typeof scoringResult.score === 'object' &&
          'id' in scoringResult.score
            ? String(scoringResult.score.id)
            : undefined,
        score:
          scoringResult.score &&
          typeof scoringResult.score === 'object' &&
          'score' in scoringResult.score &&
          typeof scoringResult.score.score === 'number'
            ? scoringResult.score.score
            : null,
      }

      scoringApplied = true
    } catch (error) {
      console.error('Immediate scoring failed after job create:', error)
      scoringError =
        error instanceof Error ? error.message : 'Failed to score job.'
    }

    return NextResponse.json(
      {
        job,
        application,
        score,
        scoringApplied,
        scoringError,
      } satisfies CreateJobResponse,
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/jobs error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create job.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}