import { createAdminClient } from '@/lib/supabase/admin'
import type { WorkflowApplication, WorkflowDecision } from './types'

type RawWorkflowMeta =
  | {
      decision: WorkflowDecision | null
      snoozed_until: string | null
      last_reviewed_at: string | null
    }
  | {
      decision: WorkflowDecision | null
      snoozed_until: string | null
      last_reviewed_at: string | null
    }[]
  | null

type RawWorkflowRow = {
  id: string
  job_id: string
  status: string | null
  applied_at: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  follow_up_1_sent_at: string | null
  follow_up_2_sent_at: string | null
  job: {
    company: string | null
    title: string | null
    location: string | null
    archived_at: string | null
  } | null
  application_workflow_meta: RawWorkflowMeta
}

function normalizeWorkflowMeta(value: RawWorkflowMeta) {
  if (!value) return null

  const meta = Array.isArray(value) ? value[0] : value
  if (!meta) return null

  return {
    decision: meta.decision,
    snoozedUntil: meta.snoozed_until,
    lastReviewedAt: meta.last_reviewed_at,
  }
}

function getDerivedFollowUp(row: RawWorkflowRow) {
  if (row.follow_up_1_due && !row.follow_up_1_sent_at) {
    return {
      followUpDate: row.follow_up_1_due,
      followUpCompletedAt: null,
    }
  }

  if (row.follow_up_2_due && !row.follow_up_2_sent_at) {
    return {
      followUpDate: row.follow_up_2_due,
      followUpCompletedAt: null,
    }
  }

  if (row.follow_up_2_sent_at) {
    return {
      followUpDate: row.follow_up_2_due,
      followUpCompletedAt: row.follow_up_2_sent_at,
    }
  }

  if (row.follow_up_1_sent_at) {
    return {
      followUpDate: row.follow_up_1_due,
      followUpCompletedAt: row.follow_up_1_sent_at,
    }
  }

  return {
    followUpDate: null,
    followUpCompletedAt: null,
  }
}

function mapRow(row: RawWorkflowRow): WorkflowApplication {
  const followUp = getDerivedFollowUp(row)

  return {
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    appliedAt: row.applied_at,
    score: null,
    followUpDate: followUp.followUpDate,
    followUpCompletedAt: followUp.followUpCompletedAt,
    interviewDate: null,
    job: row.job
      ? {
          company: row.job.company,
          title: row.job.title,
          location: row.job.location,
          archivedAt: row.job.archived_at,
        }
      : null,
    workflowMeta: normalizeWorkflowMeta(row.application_workflow_meta),
  }
}

export async function getActiveWorkflowApplications(): Promise<WorkflowApplication[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      job_id,
      status,
      applied_at,
      follow_up_1_due,
      follow_up_2_due,
      follow_up_1_sent_at,
      follow_up_2_sent_at,
      job:jobs (
        company,
        title,
        location,
        archived_at
      ),
      application_workflow_meta (
        decision,
        snoozed_until,
        last_reviewed_at
      )
    `
    )

  if (error) {
    throw new Error(`Failed to load workflow applications: ${error.message}`)
  }

  return ((data ?? []) as RawWorkflowRow[])
    .filter((row) => !row.job?.archived_at)
    .map(mapRow)
}