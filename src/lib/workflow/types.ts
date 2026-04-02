import type { ApplicationDisposition } from '@/lib/statuses'

export type WorkflowDecision =
  | 'needs_tailoring'
  | 'waiting_on_referral'
  | 'waiting_on_response'
  | 'not_now'

export type WorkflowMeta = {
  decision: WorkflowDecision | null
  snoozedUntil: string | null
  lastReviewedAt: string | null
}

export type WorkflowApplicationJob = {
  company: string | null
  title: string | null
  location: string | null
  archivedAt?: string | null
}

export type WorkflowApplication = {
  id: string
  jobId: string
  status: string | null
  disposition: ApplicationDisposition | null
  dispositionAt: string | null
  appliedAt: string | null
  score: number | null
  followUpDate: string | null
  followUpCompletedAt: string | null
  interviewDate: string | null
  job: WorkflowApplicationJob | null
  workflowMeta: WorkflowMeta | null
}

export type WorkflowActionKind =
  | 'follow_up'
  | 'apply'
  | 'stale_ready'
  | 'needs_tailoring'
  | 'waiting'
  | 'interview'

export type WorkflowActionBucket =
  | 'overdue'
  | 'today'
  | 'upcoming'
  | 'apply_now'
  | 'needs_attention'
  | 'waiting'
  | 'snoozed'

export type ActionQueueItem = {
  id: string
  applicationId: string
  jobId: string
  kind: WorkflowActionKind
  bucket: WorkflowActionBucket
  company: string
  title: string
  location: string
  status: string | null
  disposition: ApplicationDisposition | null
  score: number | null
  reason: string
  priorityScore: number
  href: string
  dueDate: string | null
  overdueDays: number | null
  decision: WorkflowDecision | null
  snoozedUntil: string | null
  lastReviewedAt: string | null
}