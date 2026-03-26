import { NextRequest, NextResponse } from 'next/server'
import { runAutomationWorker } from '@/lib/automation/worker'

type RequestBody = {
  limit?: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody

    const limit =
      typeof body.limit === 'number' && body.limit > 0
        ? Math.min(body.limit, 50)
        : 10

    const result = await runAutomationWorker(limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/automation/run error:', error)

    return NextResponse.json(
      {
        error: 'Failed to run automation worker.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}