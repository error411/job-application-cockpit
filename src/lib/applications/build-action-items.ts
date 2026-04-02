import type {
  WorkflowApplication,
  ActionQueueItem,
  WorkflowActionBucket,
} from '@/lib/workflow/types'
import { getFollowUpState } from '@/lib/applications/get-follow-up-state'

export type ActionQueueGroup = {
  key: WorkflowActionBucket
  label: string
  items: ActionQueueItem[]
}

function startOfTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function differenceInDays(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const fromStart = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  ).getTime()
  const toStart = new Date(
    to.getFullYear(),
    to.getMonth(),
    to.getDate()
  ).getTime()

  return Math.floor((toStart - fromStart) / msPerDay)
}

function isSnoozed(application: WorkflowApplication): boolean {
  const snoozedUntil = parseDate(application.workflowMeta?.snoozedUntil)
  if (!snoozedUntil) return false

  return snoozedUntil > new Date()
}

function getCompany(application: WorkflowApplication) {
  return application.job?.company ?? 'Unknown company'
}

function getTitle(application: WorkflowApplication) {
  return application.job?.title ?? 'Untitled role'
}

function getLocation(application: WorkflowApplication) {
  return application.job?.location ?? '—'
}

function getJobHref(application: WorkflowApplication) {
  return `/jobs/${application.jobId}`
}

function getFollowUpHref(application: WorkflowApplication) {
  return `/follow-ups#job-${application.jobId}`
}

function buildFollowUpAction(application: WorkflowApplication): ActionQueueItem | null {
  if (application.status !== 'applied') return null
  if (application.followUpCompletedAt) return null

  const dueDate = parseDate(application.followUpDate)
  if (!dueDate) return null

  const followUpState = getFollowUpState({
    follow_up_1_due: application.followUpDate,
    follow_up_2_due: null,
    follow_up_1_sent_at: application.followUpCompletedAt,
    follow_up_2_sent_at: null,
  })

  if (!followUpState.hasDueNow) {
    return null
  }

  const now = new Date()
  const isOverdue = dueDate.getTime() < now.getTime()
  const overdueDays = Math.max(1, differenceInDays(dueDate, startOfTodayLocal()))
  const scoreBoost = application.score ?? 0
  const snoozedUntil = application.workflowMeta?.snoozedUntil ?? null
  const snoozed = isSnoozed(application)

  return {
    id: `${application.id}-follow-up`,
    applicationId: application.id,
    jobId: application.jobId,
    kind: 'follow_up',
    bucket: snoozed ? 'snoozed' : isOverdue ? 'overdue' : 'today',
    company: getCompany(application),
    title: getTitle(application),
    location: getLocation(application),
    status: application.status,
    score: application.score,
    reason: isOverdue ? 'Follow-up overdue' : 'Follow-up due now',
    priorityScore: snoozed
      ? 5 + scoreBoost
      : isOverdue
        ? 100 + scoreBoost
        : 85 + scoreBoost,
    href: getFollowUpHref(application),
    dueDate: application.followUpDate,
    overdueDays: isOverdue ? overdueDays : null,
    decision: application.workflowMeta?.decision ?? null,
    snoozedUntil,
    lastReviewedAt: application.workflowMeta?.lastReviewedAt ?? null,
    disposition: application.disposition,
  }
}

function buildReadyAction(application: WorkflowApplication): ActionQueueItem | null {
  if (application.status !== 'ready') return null

  const decision = application.workflowMeta?.decision ?? null
  const snoozed = isSnoozed(application)
  const snoozedUntil = application.workflowMeta?.snoozedUntil ?? null
  const scoreBoost = application.score ?? 0

  if (decision === 'not_now') {
    return {
      id: `${application.id}-not-now`,
      applicationId: application.id,
      jobId: application.jobId,
      kind: 'waiting',
      bucket: 'snoozed',
      company: getCompany(application),
      title: getTitle(application),
      location: getLocation(application),
      status: application.status,
      score: application.score,
      reason: 'Deferred for later review',
      priorityScore: 1 + scoreBoost,
      href: getJobHref(application),
      dueDate: null,
      overdueDays: null,
      decision,
      snoozedUntil,
      lastReviewedAt: application.workflowMeta?.lastReviewedAt ?? null,
      disposition: application.disposition,
    }
  }

  if (decision === 'needs_tailoring') {
    return {
      id: `${application.id}-needs-tailoring`,
      applicationId: application.id,
      jobId: application.jobId,
      kind: 'needs_tailoring',
      bucket: snoozed ? 'snoozed' : 'needs_attention',
      company: getCompany(application),
      title: getTitle(application),
      location: getLocation(application),
      status: application.status,
      score: application.score,
      reason:
        application.score !== null
          ? `Needs tailoring before applying (${application.score}/100)`
          : 'Needs tailoring before applying',
      priorityScore: snoozed ? 10 + scoreBoost : 70 + scoreBoost,
      href: getJobHref(application),
      dueDate: null,
      overdueDays: null,
      decision,
      snoozedUntil,
      lastReviewedAt: application.workflowMeta?.lastReviewedAt ?? null,
      disposition: application.disposition,
    }
  }

  if (
    decision === 'waiting_on_referral' ||
    decision === 'waiting_on_response'
  ) {
    return {
      id: `${application.id}-waiting`,
      applicationId: application.id,
      jobId: application.jobId,
      kind: 'waiting',
      bucket: snoozed ? 'snoozed' : 'waiting',
      company: getCompany(application),
      title: getTitle(application),
      location: getLocation(application),
      status: application.status,
      score: application.score,
      reason:
        decision === 'waiting_on_referral'
          ? 'Waiting on referral before applying'
          : 'Waiting on response before next step',
      priorityScore: snoozed ? 8 + scoreBoost : 35 + scoreBoost,
      href: getJobHref(application),
      dueDate: null,
      overdueDays: null,
      decision,
      snoozedUntil,
      lastReviewedAt: application.workflowMeta?.lastReviewedAt ?? null,
      disposition: application.disposition,
    }
  }

  return {
    id: application.id,
    applicationId: application.id,
    jobId: application.jobId,
    kind: 'apply',
    bucket: snoozed ? 'snoozed' : 'apply_now',
    company: getCompany(application),
    title: getTitle(application),
    location: getLocation(application),
    status: application.status,
    score: application.score,
    reason:
      application.score !== null
        ? `Ready to apply (${application.score}/100)`
        : 'Ready to apply',
    priorityScore: snoozed ? 12 + scoreBoost : 60 + scoreBoost,
    href: getJobHref(application),
    dueDate: null,
    overdueDays: null,
    decision,
    snoozedUntil,
    lastReviewedAt: application.workflowMeta?.lastReviewedAt ?? null,
    disposition: application.disposition,
  }
}

function buildInterviewAction(application: WorkflowApplication): ActionQueueItem | null {
  if (application.status !== 'interviewing') return null

  const snoozed = isSnoozed(application)
  const scoreBoost = application.score ?? 0

  return {
    id: `${application.id}-interview`,
    applicationId: application.id,
    jobId: application.jobId,
    kind: 'interview',
    bucket: snoozed ? 'snoozed' : 'needs_attention',
    company: getCompany(application),
    title: getTitle(application),
    location: getLocation(application),
    status: application.status,
    score: application.score,
    reason: application.interviewDate
      ? 'Interview process active'
      : 'Interviewing status active',
    priorityScore: snoozed ? 15 + scoreBoost : 50 + scoreBoost,
    href: getJobHref(application),
    dueDate: application.interviewDate,
    overdueDays: null,
    decision: application.workflowMeta?.decision ?? null,
    snoozedUntil: application.workflowMeta?.snoozedUntil ?? null,
    lastReviewedAt: application.workflowMeta?.lastReviewedAt ?? null,
    disposition: application.disposition,
  }
}

export function buildActionItems(
  applications: WorkflowApplication[]
): ActionQueueItem[] {
  const items: ActionQueueItem[] = []

  for (const application of applications) {
    const followUpItem = buildFollowUpAction(application)
    if (followUpItem) items.push(followUpItem)

    const readyItem = buildReadyAction(application)
    if (readyItem) items.push(readyItem)

    const interviewItem = buildInterviewAction(application)
    if (interviewItem) items.push(interviewItem)
  }

  return items.sort((a, b) => b.priorityScore - a.priorityScore)
}

export function rankActionItems(items: ActionQueueItem[]): ActionQueueItem[] {
  return [...items].sort((a, b) => b.priorityScore - a.priorityScore)
}

export function groupTodayActionItems(items: ActionQueueItem[]): ActionQueueGroup[] {
  const groups: ActionQueueGroup[] = []

  const overdue = items.filter((item) => item.bucket === 'overdue')
  const today = items.filter((item) => item.bucket === 'today')
  const applyNow = items.filter((item) => item.bucket === 'apply_now')
  const needsAttention = items.filter((item) => item.bucket === 'needs_attention')
  const waiting = items.filter((item) => item.bucket === 'waiting')
  const snoozed = items.filter((item) => item.bucket === 'snoozed')

  if (overdue.length) {
    groups.push({ key: 'overdue', label: 'Overdue', items: overdue })
  }

  if (today.length) {
    groups.push({ key: 'today', label: 'Due Today', items: today })
  }

  if (applyNow.length) {
    groups.push({ key: 'apply_now', label: 'Ready to Apply', items: applyNow })
  }

  if (needsAttention.length) {
    groups.push({
      key: 'needs_attention',
      label: 'Needs Attention',
      items: needsAttention,
    })
  }

  if (waiting.length) {
    groups.push({ key: 'waiting', label: 'Waiting', items: waiting })
  }

  if (snoozed.length) {
    groups.push({ key: 'snoozed', label: 'Snoozed', items: snoozed })
  }

  return groups
}