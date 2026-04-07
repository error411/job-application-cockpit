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

    try {
      await generateAssetsForJob(jobId, user.id)
    } catch (error) {
      console.error('generateAssetsForJob failed:', error)

      return NextResponse.json(
        {
          error: 'Failed to generate assets',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/generate-assets-form error:', error)

    return NextResponse.json(
      {
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}