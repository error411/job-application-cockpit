import { NextRequest, NextResponse } from 'next/server'
import { generateAssetsForJob } from '@/lib/services/generate-assets'

type RequestBody = {
  jobId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody
    const { jobId } = body

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    const result = await generateAssetsForJob(jobId)

    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/generate-assets error:', err)

    return NextResponse.json(
      {
        error: 'Failed to generate assets',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}