import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Tables, TablesUpdate } from '@/lib/supabase/types'
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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await req.json()) as RequestBody
    const jobId = body.jobId

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid jobId' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Failed to mark follow-up as sent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      application: updatedApplication,
      completedStage: stage,
    })
  } catch (error) {
    console.error('POST /api/applications/follow-up failed', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}