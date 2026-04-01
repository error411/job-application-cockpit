import type { Tables } from '@/lib/supabase/types'
import {
  ACTIVE_APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationStatus,
} from '@/lib/statuses'

type JobRow = Tables<'jobs'>
type ApplicationRow = Tables<'applications'>

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
> & {
  jobs: WorkflowJob | WorkflowJob[] | null
}

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
> & {
  status: ApplicationStatus
  job: WorkflowJob | null
}

type WorkflowApplicationsQuery = {
  select: (query: string) => {
    in: (
      column: string,
      values: readonly string[]
    ) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => Promise<{
        data: RawWorkflowApplicationRow[] | null
        error: { message: string } | null
      }>
    }
  }
}

type WorkflowApplicationsSupabase = {
  from: (table: 'applications') => unknown
}

function normalizeJob(
  value: WorkflowJob | WorkflowJob[] | null
): WorkflowJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normalizeApplicationStatus(value: string | null): ApplicationStatus {
  if (value && isApplicationStatus(value)) {
    return value
  }

  return 'ready'
}

function toActiveWorkflowApplicationRow(
  row: RawWorkflowApplicationRow
): ActiveWorkflowApplicationRow {
  return {
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
    job: normalizeJob(row.jobs),
  }
}

export async function getActiveWorkflowApplications(
  supabase: WorkflowApplicationsSupabase
): Promise<ActiveWorkflowApplicationRow[]> {
  const query = supabase.from('applications') as WorkflowApplicationsQuery

  const { data, error } = await query
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

  const rows = (data ?? []) as RawWorkflowApplicationRow[]

  return rows
    .map(toActiveWorkflowApplicationRow)
    .filter((app) => app.job !== null && app.job.archived_at == null)
}