import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAssetsForJob } from '@/lib/services/generate-assets'

type RequestBody = {
  jobId?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as RequestBody
    const { jobId } = body

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    const result = await generateAssetsForJob(jobId, user.id)

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