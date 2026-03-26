import { NextRequest, NextResponse } from 'next/server'
import { scoreJobService } from '@/lib/services/score-job'

type RequestBody = {
  jobId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody
    const { jobId } = body ?? {}

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    const result = await scoreJobService(jobId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/score error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to score job.'

    const status =
      message === 'Job not found' || message === 'Candidate profile not found'
        ? 404
        : message === 'Job description is required before scoring.'
        ? 400
        : 500

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    )
  }
}