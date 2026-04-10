import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/lib/supabase/schema'
import {
  ACTIVE_APPLICATION_STATUSES,
  isApplicationDisposition,
  isApplicationStatus,
  type ApplicationDisposition,
  type ApplicationStatus,
} from '@/lib/statuses'

type JobRow = Tables<'jobs'>
type ApplicationRow = Tables<'applications'>
type JobScoreRow = Tables<'job_scores'>

type WorkflowJob = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'archived_at'
>

type RawWorkflowApplicationRow = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
  | 'notes'
  | 'updated_at'
  | 'disposition'
  | 'disposition_at'
> & {
  jobs: WorkflowJob | WorkflowJob[] | null
}

type JobScoreLookupRow = Pick<JobScoreRow, 'job_id' | 'score' | 'created_at'>

export type ActiveWorkflowApplicationRow = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
  | 'notes'
  | 'updated_at'
  | 'disposition_at'
> & {
  status: ApplicationStatus
  disposition: ApplicationDisposition | null
  job: WorkflowJob | null
  score: number | null
}

function normalizeJob(
  value: WorkflowJob | WorkflowJob[] | null
): WorkflowJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normalizeApplicationStatus(value: string | null): ApplicationStatus {
  if (value && isApplicationStatus(value)) return value
  return 'ready'
}

function normalizeApplicationDisposition(
  value: string | null
): ApplicationDisposition | null {
  if (value && isApplicationDisposition(value)) return value
  return null
}

export async function getActiveWorkflowApplications(
  supabase: SupabaseClient<Database>
): Promise<ActiveWorkflowApplicationRow[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      job_id,
      status,
      applied_at,
      follow_up_1_due,
      follow_up_2_due,
      follow_up_1_sent_at,
      follow_up_2_sent_at,
      notes,
      updated_at,
      disposition,
      disposition_at,
      jobs:jobs!applications_job_id_fkey (
        id,
        company,
        title,
        location,
        archived_at
      )
    `)
    .in('status', ACTIVE_APPLICATION_STATUSES)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const baseRows = ((data ?? []) as RawWorkflowApplicationRow[])
    .map((row) => ({
      ...row,
      job: normalizeJob(row.jobs),
    }))
    .filter(
      (row): row is RawWorkflowApplicationRow & { job: WorkflowJob } =>
        row.job != null && row.job.archived_at == null
    )

  const jobIds = [...new Set(baseRows.map((row) => row.job_id))]

  const latestScoresByJobId = new Map<string, number>()

  if (jobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      throw new Error(scoresError.message)
    }

    for (const scoreRow of (scores ?? []) as JobScoreLookupRow[]) {
      if (!latestScoresByJobId.has(scoreRow.job_id)) {
        latestScoresByJobId.set(scoreRow.job_id, scoreRow.score)
      }
    }
  }

  return baseRows.map((row) => ({
    id: row.id,
    job_id: row.job_id,
    status: normalizeApplicationStatus(row.status),
    applied_at: row.applied_at,
    follow_up_1_due: row.follow_up_1_due,
    follow_up_2_due: row.follow_up_2_due,
    follow_up_1_sent_at: row.follow_up_1_sent_at,
    follow_up_2_sent_at: row.follow_up_2_sent_at,
    notes: row.notes,
    updated_at: row.updated_at,
    disposition: normalizeApplicationDisposition(row.disposition),
    disposition_at: row.disposition_at,
    job: row.job,
    score: latestScoresByJobId.get(row.job_id) ?? null,
  }))
}
