import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'
import type {
  AutomationEntityType,
  AutomationJobStatus,
  AutomationJobType,
} from './types'
import type {
  AutomationJobInsert,
  AutomationJobRow,
  AutomationJobUpdate,
} from '@/lib/supabase/model-types'

type JsonObject = Record<string, Json | undefined>

export type QueuedAutomationJob = AutomationJobRow

export async function enqueueAutomationJob(input: {
  jobType: AutomationJobType
  entityType: AutomationEntityType
  entityId: string
  payload?: JsonObject
  scheduledFor?: string
}) {
  const supabase = await createClient()

  const { data: existing, error: existingError } = await supabase
    .from('automation_jobs')
    .select('*')
    .eq('job_type', input.jobType)
    .eq('entity_type', input.entityType)
    .eq('entity_id', input.entityId)
    .in('status', ['pending', 'processing'])
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing) {
    return existing as QueuedAutomationJob
  }

  const insertPayload: AutomationJobInsert = {
    job_type: input.jobType,
    entity_type: input.entityType,
    entity_id: input.entityId,
    status: 'pending',
    payload: input.payload ?? {},
    scheduled_for: input.scheduledFor ?? new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('automation_jobs')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as QueuedAutomationJob
}

export async function getDueAutomationJobs(limit = 10) {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('automation_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as QueuedAutomationJob[]
}

export async function markAutomationJobProcessing(jobId: string) {
  const supabase = await createClient()

  const updatePayload: AutomationJobUpdate = {
    status: 'processing',
    started_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('automation_jobs')
    .update(updatePayload)
    .eq('id', jobId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as QueuedAutomationJob
}

export async function markAutomationJobCompleted(jobId: string) {
  const supabase = await createClient()

  const updatePayload: AutomationJobUpdate = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    last_error: null,
  }

  const { data, error } = await supabase
    .from('automation_jobs')
    .update(updatePayload)
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as QueuedAutomationJob
}

export async function markAutomationJobFailed(job: QueuedAutomationJob, errorMessage: string) {
  const supabase = await createClient()

  const nextAttempts = job.attempts + 1
  const hitMaxAttempts = nextAttempts >= job.max_attempts

  const retryDelayMinutes = Math.min(nextAttempts * 5, 30)
  const nextScheduledFor = new Date(Date.now() + retryDelayMinutes * 60 * 1000).toISOString()

  const updatePayload: AutomationJobUpdate = {
    status: hitMaxAttempts ? 'failed' : 'pending',
    attempts: nextAttempts,
    last_error: errorMessage,
    scheduled_for: hitMaxAttempts ? job.scheduled_for : nextScheduledFor,
  }

  const { data, error } = await supabase
    .from('automation_jobs')
    .update(updatePayload)
    .eq('id', job.id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as QueuedAutomationJob
}