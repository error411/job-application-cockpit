import { NextRequest, NextResponse } from 'next/server'
import { generateFollowupAssetsForJob } from '@/lib/services/generate-followup-assets'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { jobId?: string }
    const jobId = body.jobId

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing jobId' }, { status: 400 })
    }

    const result = await generateFollowupAssetsForJob(jobId)

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'

    console.error('debug generate follow-up failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}