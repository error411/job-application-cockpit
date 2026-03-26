import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enqueueAutomationJob } from '@/lib/automation/queue'
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/lib/supabase/types'
import {
  APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationStatus,
} from '@/lib/statuses'

type ApplicationRow = Tables<'applications'>
type ApplicationInsert = TablesInsert<'applications'>
type ApplicationUpdate = TablesUpdate<'applications'>

type RequestBody = {
  jobId?: string
  status?: string
  notes?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await req.json()) as RequestBody
    const { jobId, status: requestedStatus, notes } = body

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    let status: ApplicationStatus | undefined

    if (requestedStatus !== undefined) {
      if (
        typeof requestedStatus !== 'string' ||
        !isApplicationStatus(requestedStatus)
      ) {
        return NextResponse.json(
          {
            error: `Invalid application status. Allowed values: ${APPLICATION_STATUSES.join(', ')}`,
          },
          { status: 400 }
        )
      }

      status = requestedStatus
    }

    const { data: existing, error: existingError } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      )
    }

    const typedExisting: ApplicationRow | null = existing
    const now = new Date()

    const nextStatus =
      status ?? ((typedExisting?.status as ApplicationStatus | null) ?? 'ready')

    const appliedAt =
      nextStatus === 'applied' && !typedExisting?.applied_at
        ? now.toISOString()
        : typedExisting?.applied_at ?? null

    const followUp1 =
      nextStatus === 'applied'
        ? new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
        : typedExisting?.follow_up_1_due ?? null

    const followUp2 =
      nextStatus === 'applied'
        ? new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
        : typedExisting?.follow_up_2_due ?? null

    if (typedExisting) {
      const updatePayload: ApplicationUpdate = {
        status: nextStatus,
        notes: notes ?? typedExisting.notes,
        applied_at: appliedAt,
        follow_up_1_due: followUp1,
        follow_up_2_due: followUp2,
        updated_at: now.toISOString(),
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', typedExisting.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (nextStatus === 'applied') {
        await enqueueAutomationJob({
          jobType: 'schedule_followups',
          entityType: 'application',
          entityId: typedExisting.id,
        })
      }

      return NextResponse.json({ application: data })
    }

    const insertPayload: ApplicationInsert = {
      job_id: jobId,
      status: nextStatus,
      notes: notes || null,
      applied_at: appliedAt,
      follow_up_1_due: followUp1,
      follow_up_2_due: followUp2,
    }

    const { data, error } = await supabase
      .from('applications')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (nextStatus === 'applied') {
      await enqueueAutomationJob({
        jobType: 'schedule_followups',
        entityType: 'application',
        entityId: data.id,
      })
    }

    return NextResponse.json({ application: data })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to save application',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}