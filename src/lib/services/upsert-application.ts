import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/schema'
import {
  isApplicationDisposition,
  isApplicationStatus,
  type ApplicationDisposition,
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
  disposition: string | null
  disposition_at: string | null
  disposition_notes: string | null
}

type UpsertApplicationInput = {
  jobId: string
  status?: string
  notes?: string | null
  disposition?: string | null
  dispositionNotes?: string | null
}

function buildDefaultFollowUpSchedule(now: Date) {
  return {
    followUp1: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    followUp2: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

function getStatusFromDisposition(
  disposition: ApplicationDisposition
): ApplicationStatus {
  switch (disposition) {
    case 'landed_interview':
      return 'interviewing'
    case 'rejected':
    case 'offer':
    case 'withdrawn':
    case 'ghosted':
    case 'accepted':
      return 'closed'
  }
}

function isTerminalDisposition(disposition: ApplicationDisposition) {
  return disposition !== 'landed_interview'
}

function isActiveStatus(status: ApplicationStatus) {
  return status !== 'closed'
}

export async function upsertApplicationForJob({
  jobId,
  status,
  notes,
  disposition,
  dispositionNotes,
}: UpsertApplicationInput) {
  const supabase = createAdminClient()

  const normalizedDisposition: ApplicationDisposition | null =
    typeof disposition === 'string' && isApplicationDisposition(disposition)
      ? disposition
      : null

  const normalizedStatus: ApplicationStatus = normalizedDisposition
    ? getStatusFromDisposition(normalizedDisposition)
    : typeof status === 'string' && isApplicationStatus(status)
      ? status
      : 'ready'

  const now = new Date()
  const nowIso = now.toISOString()

  const { data: existing, error: existingError } = await supabase
    .from('applications')
    .select(
      'id, status, applied_at, follow_up_1_due, follow_up_2_due, disposition, disposition_at, disposition_notes'
    )
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

    const isTransitioningToInterviewing =
      normalizedStatus === 'interviewing' && existing.status !== 'interviewing'

    if (isTransitioningToApplied) {
      const schedule = buildDefaultFollowUpSchedule(now)

      updatePayload.applied_at = existing.applied_at ?? nowIso
      updatePayload.follow_up_1_due =
        existing.follow_up_1_due ?? schedule.followUp1
      updatePayload.follow_up_2_due =
        existing.follow_up_2_due ?? schedule.followUp2
    }

    if (normalizedDisposition) {
      updatePayload.disposition = normalizedDisposition
      updatePayload.disposition_at = nowIso
      updatePayload.disposition_notes = dispositionNotes ?? null

      if (normalizedDisposition === 'landed_interview') {
        updatePayload.applied_at = existing.applied_at ?? nowIso
      }

      if (isTerminalDisposition(normalizedDisposition)) {
        updatePayload.follow_up_1_due = null
        updatePayload.follow_up_2_due = null
      }
    } else if (isActiveStatus(normalizedStatus)) {
      updatePayload.disposition = null
      updatePayload.disposition_at = null
      updatePayload.disposition_notes = null
    } else {
      updatePayload.follow_up_1_due = null
      updatePayload.follow_up_2_due = null
    }

    if (!normalizedDisposition && isTransitioningToInterviewing) {
      updatePayload.applied_at = existing.applied_at ?? nowIso
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

  if (normalizedStatus === 'interviewing') {
    insertPayload.applied_at = nowIso
  }

  if (normalizedDisposition) {
    insertPayload.disposition = normalizedDisposition
    insertPayload.disposition_at = nowIso
    insertPayload.disposition_notes = dispositionNotes ?? null

    if (normalizedDisposition === 'landed_interview') {
      insertPayload.applied_at = nowIso
    }

    if (isTerminalDisposition(normalizedDisposition)) {
      insertPayload.follow_up_1_due = null
      insertPayload.follow_up_2_due = null
    }
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
