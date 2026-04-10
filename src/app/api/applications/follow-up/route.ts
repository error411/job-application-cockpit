import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Tables, TablesUpdate } from '@/lib/supabase/schema'
import { getActiveFollowUpStage } from '@/lib/applications/get-active-follow-up-stage'

type ApplicationRow = Tables<'applications'>
type ApplicationUpdate = TablesUpdate<'applications'>

type RequestBody = {
  jobId?: string
}

type FollowUpApplicationRow = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'notes'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
>

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('POST /api/applications/follow-up auth failed', {
        authError: authError?.message,
      })

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: RequestBody

    try {
      body = (await req.json()) as RequestBody
    } catch (error) {
      console.error('POST /api/applications/follow-up invalid json', {
        error: getErrorMessage(error),
      })

      return NextResponse.json(
        { error: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }

    const jobId = body.jobId

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid jobId' },
        { status: 400 }
      )
    }

    // First verify the job belongs to the current user.
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      console.error('POST /api/applications/follow-up job lookup failed', {
        jobId,
        userId: user.id,
        jobError: jobError?.message,
      })

      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select(
        `
          id,
          job_id,
          status,
          notes,
          follow_up_1_due,
          follow_up_2_due,
          follow_up_1_sent_at,
          follow_up_2_sent_at
        `
      )
      .eq('job_id', jobId)
      .single<FollowUpApplicationRow>()

    if (applicationError || !application) {
      console.error('POST /api/applications/follow-up application lookup failed', {
        jobId,
        userId: user.id,
        applicationError: applicationError?.message,
      })

      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const stage = getActiveFollowUpStage(application)

    if (stage === null) {
      return NextResponse.json(
        { error: 'No follow-up is currently due' },
        { status: 409 }
      )
    }

    const nowIso = new Date().toISOString()

    const update: ApplicationUpdate =
      stage === 1
        ? { follow_up_1_sent_at: nowIso }
        : { follow_up_2_sent_at: nowIso }

    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update(update)
      .eq('id', application.id)
      .select(
        `
          id,
          job_id,
          status,
          notes,
          follow_up_1_due,
          follow_up_2_due,
          follow_up_1_sent_at,
          follow_up_2_sent_at
        `
      )
      .single<FollowUpApplicationRow>()

    if (updateError || !updatedApplication) {
      console.error('POST /api/applications/follow-up update failed', {
        applicationId: application.id,
        jobId,
        userId: user.id,
        updateError: updateError?.message,
        attemptedStage: stage,
      })

      return NextResponse.json(
        {
          error: 'Failed to mark follow-up as sent',
          details: updateError?.message ?? 'Unknown update failure',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      application: updatedApplication,
      completedStage: stage,
    })
  } catch (error) {
    const message = getErrorMessage(error)

    console.error('POST /api/applications/follow-up failed', {
      error: message,
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV !== 'production' ? message : undefined,
      },
      { status: 500 }
    )
  }
}
