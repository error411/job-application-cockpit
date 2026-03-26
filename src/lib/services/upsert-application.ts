import { createClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types'
import {
  isApplicationStatus,
  type ApplicationStatus,
} from '@/lib/statuses'

type ApplicationInsert = TablesInsert<'applications'>
type ApplicationUpdate = TablesUpdate<'applications'>

type UpsertApplicationInput = {
  jobId: string
  status?: string
  notes?: string | null
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

  const nowIso = new Date().toISOString()

  const followUp1 =
    normalizedStatus === 'applied'
      ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      : null

  const followUp2 =
    normalizedStatus === 'applied'
      ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      : null

  const { data: existing, error: existingError } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing?.id) {
    const updatePayload: ApplicationUpdate = {
      status: normalizedStatus,
      notes: notes ?? null,
      updated_at: nowIso,
    }

    if (normalizedStatus === 'applied') {
      updatePayload.applied_at = nowIso
      updatePayload.follow_up_1_due = followUp1
      updatePayload.follow_up_2_due = followUp2
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

    return data
  }

  const insertPayload: ApplicationInsert = {
    job_id: jobId,
    status: normalizedStatus,
    notes: notes ?? null,
    ...(normalizedStatus === 'applied'
      ? {
          applied_at: nowIso,
          follow_up_1_due: followUp1,
          follow_up_2_due: followUp2,
        }
      : {}),
  }

  const { data, error } = await supabase
    .from('applications')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}