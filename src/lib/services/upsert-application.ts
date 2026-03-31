import { createClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types'
import {
  isApplicationStatus,
  type ApplicationStatus,
} from '@/lib/statuses'
import { enqueueAutomationJob } from '@/lib/automation/queue'

type ApplicationInsert = TablesInsert<'applications'>
type ApplicationUpdate = TablesUpdate<'applications'>

type ExistingApplicationRow = {
  id: string
  status: string | null
  applied_at: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
}

type UpsertApplicationInput = {
  jobId: string
  status?: string
  notes?: string | null
}

function buildDefaultFollowUpSchedule(now: Date) {
  return {
    followUp1: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    followUp2: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function upsertApplicationForJob({
  jobId,
  status,
  notes,
}: UpsertApplicationInput) {
  const supabase = await createClient()

  const normalizedStatus: ApplicationStatus =
    typeof status === 'string' && isApplicationStatus(status)
      ? status
      : 'ready'

  const now = new Date()
  const nowIso = now.toISOString()

  const { data: existing, error: existingError } = await supabase
    .from('applications')
    .select('id, status, applied_at, follow_up_1_due, follow_up_2_due')
    .eq('job_id', jobId)
    .maybeSingle<ExistingApplicationRow>()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing?.id) {
    const updatePayload: ApplicationUpdate = {
      status: normalizedStatus,
      notes: notes ?? null,
      updated_at: nowIso,
    }

    const isTransitioningToApplied =
      normalizedStatus === 'applied' && existing.status !== 'applied'

    if (isTransitioningToApplied) {
      const schedule = buildDefaultFollowUpSchedule(now)

      updatePayload.applied_at = existing.applied_at ?? nowIso
      updatePayload.follow_up_1_due = existing.follow_up_1_due ?? schedule.followUp1
      updatePayload.follow_up_2_due = existing.follow_up_2_due ?? schedule.followUp2
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    if (isTransitioningToApplied) {
      await enqueueAutomationJob({
        jobType: 'schedule_followups',
        entityType: 'job',
        entityId: jobId,
      })
    }

    return data
  }

  const insertPayload: ApplicationInsert = {
    job_id: jobId,
    status: normalizedStatus,
    notes: notes ?? null,
  }

  if (normalizedStatus === 'applied') {
    const schedule = buildDefaultFollowUpSchedule(now)

    insertPayload.applied_at = nowIso
    insertPayload.follow_up_1_due = schedule.followUp1
    insertPayload.follow_up_2_due = schedule.followUp2
  }

  const { data, error } = await supabase
    .from('applications')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (normalizedStatus === 'applied') {
    await enqueueAutomationJob({
      jobType: 'schedule_followups',
      entityType: 'job',
      entityId: jobId,
    })
  }

  return data
}