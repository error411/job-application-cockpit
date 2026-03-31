import { getFollowUpState, type FollowUpTimingFields } from './get-follow-up-state'

type ActionQueueJob = {
  company: string | null
  title: string | null
  location: string | null
}

export type ActionQueueApplication = FollowUpTimingFields & {
  id: string
  job_id: string
  status: string | null
  applied_at: string | null
  job: ActionQueueJob | null
}

export type ActionQueueItem = {
  kind: 'follow_up' | 'application'
  id: string
  jobId: string
  company: string
  title: string
  location: string
  status: string | null
  score: number | null
  reason: string
  priorityScore: number
  href: string
  dueDate?: string | null
}

function daysSince(dateString: string | null | undefined): number | null {
  if (!dateString) return null

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function buildActionItems(
  applications: ActionQueueApplication[],
  latestScoresByJobId: Map<string, number | null>
): ActionQueueItem[] {
  const items: ActionQueueItem[] = []

  for (const app of applications) {
    const job = app.job
    const company = job?.company ?? 'Unknown company'
    const title = job?.title ?? 'Untitled role'
    const location = job?.location ?? '—'
    const score = latestScoresByJobId.get(app.job_id) ?? null
    const scoreBoost = score ?? 0
    const age = daysSince(app.applied_at)

    const followUpState = getFollowUpState({
      follow_up_1_due: app.follow_up_1_due,
      follow_up_2_due: app.follow_up_2_due,
      follow_up_1_sent_at: app.follow_up_1_sent_at,
      follow_up_2_sent_at: app.follow_up_2_sent_at,
    })

    if (followUpState.stage1?.isDueNow) {
      items.push({
        kind: 'follow_up',
        id: `${app.id}-fu1`,
        jobId: app.job_id,
        company,
        title,
        location,
        status: app.status,
        score,
        reason: followUpState.stage1.isOverdue
          ? 'Follow-up 1 overdue'
          : 'Follow-up 1 due today',
        priorityScore: followUpState.stage1.isOverdue
          ? 100 + scoreBoost
          : 85 + scoreBoost,
        href: '/follow-ups',
        dueDate: app.follow_up_1_due,
      })
    }

    if (followUpState.stage2?.isDueNow) {
      items.push({
        kind: 'follow_up',
        id: `${app.id}-fu2`,
        jobId: app.job_id,
        company,
        title,
        location,
        status: app.status,
        score,
        reason: followUpState.stage2.isOverdue
          ? 'Follow-up 2 overdue'
          : 'Follow-up 2 due today',
        priorityScore: followUpState.stage2.isOverdue
          ? 95 + scoreBoost
          : 80 + scoreBoost,
        href: '/follow-ups',
        dueDate: app.follow_up_2_due,
      })
    }

    if (app.status === 'ready') {
      items.push({
        kind: 'application',
        id: app.id,
        jobId: app.job_id,
        company,
        title,
        location,
        status: app.status,
        score,
        reason: 'Ready to apply',
        priorityScore: 60 + scoreBoost,
        href: '/applications',
      })
    }

    if (
      app.status === 'applied' &&
      age !== null &&
      age >= 5 &&
      age <= 10 &&
      !followUpState.hasDueNow
    ) {
      items.push({
        kind: 'application',
        id: `${app.id}-applied-window`,
        jobId: app.job_id,
        company,
        title,
        location,
        status: app.status,
        score,
        reason: `Applied ${age} days ago — follow-up window active`,
        priorityScore: 50 + scoreBoost,
        href: '/follow-ups',
      })
    }
  }

  return items.sort((a, b) => b.priorityScore - a.priorityScore)
}