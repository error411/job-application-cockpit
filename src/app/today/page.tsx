import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveWorkflowApplications } from '@/lib/applications/get-active-workflow-applications'
import {
  buildActionItems,
  groupTodayActionItems,
} from '@/lib/applications/build-action-items'
import type { WorkflowDecision } from '@/lib/workflow/types'

type SectionCardProps = {
  title: string
  eyebrow?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

type NormalizedTodayApplication = Parameters<typeof buildActionItems>[0][number]

function toWorkflowDecision(value: unknown): WorkflowDecision | null {
  if (typeof value !== 'string' || value.length === 0) return null
  return value as WorkflowDecision
}

  // const allowed = new Set<WorkflowDecision>([
  //   'apply_now',
  //   'needs_tailoring',
  //   'waiting_on_referral',
  //   'waiting_on_response',
  //   'not_now',
  // ])

  // return allowed.has(value as WorkflowDecision)
  //   ? (value as WorkflowDecision)
  //   : null
// }

function SectionCard({ title, eyebrow, children, actions }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint: string
  tone?: 'default' | 'priority' | 'warning'
}) {
  const toneClass =
    tone === 'priority'
      ? 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100'
      : tone === 'warning'
        ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'
        : 'border-zinc-200 bg-white'

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function getBucketTone(bucket: string) {
  switch (bucket) {
    case 'overdue':
      return {
        card: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white',
        badge: 'bg-rose-100 text-rose-700',
      }
    case 'today':
      return {
        card: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
        badge: 'bg-amber-100 text-amber-700',
      }
    case 'apply_now':
      return {
        card: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
        badge: 'bg-emerald-100 text-emerald-700',
      }
    case 'needs_attention':
      return {
        card: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
        badge: 'bg-blue-100 text-blue-700',
      }
    case 'waiting':
      return {
        card: 'border-zinc-200 bg-gradient-to-br from-zinc-50 to-white',
        badge: 'bg-zinc-100 text-zinc-700',
      }
    case 'snoozed':
      return {
        card: 'border-violet-200 bg-gradient-to-br from-violet-50 to-white',
        badge: 'bg-violet-100 text-violet-700',
      }
    default:
      return {
        card: 'border-zinc-200 bg-white',
        badge: 'bg-zinc-100 text-zinc-700',
      }
  }
}

function getKindLabel(kind: string) {
  switch (kind) {
    case 'follow_up':
      return 'Follow-Up'
    case 'apply':
      return 'Apply'
    case 'needs_tailoring':
      return 'Needs Tailoring'
    case 'interview':
      return 'Interview'
    case 'waiting':
      return 'Waiting'
    default:
      return kind.replaceAll('_', ' ')
  }
}

function formatMaybeDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Today
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
          Nothing urgent right now
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Your queue is clear for the moment. You can still review jobs, prep
          assets, or check scheduled follow-ups.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Open Jobs
          </Link>
          <Link
            href="/follow-ups"
            className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Open Follow-Ups
          </Link>
        </div>
      </div>
    </section>
  )
}

function normalizeApplications(rows: unknown[]): NormalizedTodayApplication[] {
  return rows.map((raw) => {
    const row = raw as Record<string, unknown>

    const jobSource =
      (row.job as Record<string, unknown> | null | undefined) ?? null

    const workflowMetaSource =
      (row.workflowMeta as Record<string, unknown> | null | undefined) ??
      (row.workflow_meta as Record<string, unknown> | null | undefined) ??
      (row.application_workflow_meta as
        | Record<string, unknown>
        | null
        | undefined) ??
      null

    const jobId =
      (row.jobId as string | undefined) ??
      (row.job_id as string | undefined) ??
      ''

    const company =
      (row.company as string | undefined) ??
      (jobSource?.company as string | undefined) ??
      'Unknown company'

    const title =
      (row.title as string | undefined) ??
      (jobSource?.title as string | undefined) ??
      'Untitled role'

    const location =
      (row.location as string | undefined) ??
      (jobSource?.location as string | undefined) ??
      'No location'

    const appliedAt =
      (row.appliedAt as string | null | undefined) ??
      (row.applied_at as string | null | undefined) ??
      null

    const followUpDate =
      (row.followUpDate as string | null | undefined) ??
      (row.follow_up_1_due as string | null | undefined) ??
      (row.follow_up_2_due as string | null | undefined) ??
      null

    const followUpCompletedAt =
      (row.followUpCompletedAt as string | null | undefined) ??
      (row.follow_up_1_sent_at as string | null | undefined) ??
      (row.follow_up_2_sent_at as string | null | undefined) ??
      null

    const interviewDate =
      (row.interviewDate as string | null | undefined) ??
      (row.interview_date as string | null | undefined) ??
      null

    return {
      id: (row.id as string) ?? jobId,
      applicationId:
        ((row.applicationId as string | undefined) ??
          (row.id as string | undefined) ??
          jobId) as string,
      jobId,
      job: {
        company,
        title,
        location,
      },
      company,
      title,
      location,
      status: (row.status as string | null | undefined) ?? null,
      appliedAt,
      score: (row.score as number | null | undefined) ?? null,
      followUpDate,
      followUpCompletedAt,
      interviewDate,
      workflowMeta: workflowMetaSource
        ? {
            decision: toWorkflowDecision(workflowMetaSource.decision),
            snoozedUntil:
              (workflowMetaSource.snoozedUntil as string | null | undefined) ??
              (workflowMetaSource.snoozed_until as string | null | undefined) ??
              null,
            lastReviewedAt:
              (workflowMetaSource.lastReviewedAt as string | null | undefined) ??
              (workflowMetaSource.last_reviewed_at as
                | string
                | null
                | undefined) ??
              null,
          }
        : null,
    }
  })
}

export default async function TodayPage() {
  const supabase = createAdminClient()

  let applicationRows: unknown[] = []

  try {
    applicationRows = await getActiveWorkflowApplications(supabase)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load today queue.'

    return (
      <main className="space-y-6">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Workflow
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Today
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              Focus on what is actionable right now: overdue follow-ups, due-now
              outreach, ready applications, and items needing attention.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
            Load error
          </p>
          <h2 className="mt-2 text-lg font-semibold text-red-950">
            Failed to load today queue
          </h2>
          <p className="mt-2 text-sm text-red-800">{message}</p>
        </section>
      </main>
    )
  }

  const applications = normalizeApplications(applicationRows)
  const items = buildActionItems(applications)
  const groups = groupTodayActionItems(items)

  const overdueItems = items.filter((item) => item.bucket === 'overdue')
  const dueTodayItems = items.filter((item) => item.bucket === 'today')
  const applyNowItems = items.filter((item) => item.bucket === 'apply_now')
  const needsAttentionItems = items.filter(
    (item) => item.bucket === 'needs_attention'
  )
  const waitingItems = items.filter((item) => item.bucket === 'waiting')
  const snoozedItems = items.filter((item) => item.bucket === 'snoozed')

  return (
    <main className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Workflow
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Today
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              Focus on what is actionable right now: overdue follow-ups, due-now
              outreach, ready applications, and items needing attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/follow-ups"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Follow-Ups
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="Overdue"
            value={overdueItems.length}
            hint="Items already past due."
            tone={overdueItems.length > 0 ? 'warning' : 'default'}
          />
          <SummaryCard
            label="Due now"
            value={dueTodayItems.length}
            hint="Actionable follow-ups right now."
            tone={dueTodayItems.length > 0 ? 'warning' : 'default'}
          />
          <SummaryCard
            label="Apply now"
            value={applyNowItems.length}
            hint="Ready applications to move on."
            tone={applyNowItems.length > 0 ? 'priority' : 'default'}
          />
          <SummaryCard
            label="Needs attention"
            value={needsAttentionItems.length}
            hint="Tailoring or interview-related work."
          />
          <SummaryCard
            label="Waiting"
            value={waitingItems.length}
            hint="Tracked but not urgent."
          />
          <SummaryCard
            label="Snoozed"
            value={snoozedItems.length}
            hint="Deferred intentionally."
          />
        </div>
      </section>

      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-6">
          {groups.map((group) => {
            const tone = getBucketTone(group.key)

            return (
              <SectionCard
                key={group.key}
                title={group.label}
                eyebrow="Action Queue"
                actions={
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone.badge}`}
                  >
                    {group.items.length} item{group.items.length === 1 ? '' : 's'}
                  </span>
                }
              >
                <div className="grid gap-4">
                  {group.items.map((item) => {
                    const cardTone = getBucketTone(item.bucket)

                    return (
                      <article
                        key={item.id}
                        className={`rounded-2xl border p-5 shadow-sm ${cardTone.card}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${cardTone.badge}`}
                              >
                                {getKindLabel(item.kind)}
                              </span>

                              {item.score !== null ? (
                                <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-zinc-700 ring-1 ring-zinc-200">
                                  Score {item.score}/100
                                </span>
                              ) : null}

                              {item.status ? (
                                <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium capitalize text-zinc-700 ring-1 ring-zinc-200">
                                  {item.status.replaceAll('_', ' ')}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-4 space-y-1">
                              <p className="text-sm font-medium text-zinc-500">
                                {item.company}
                              </p>
                              <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">
                                {item.title}
                              </h3>
                              <p className="text-sm text-zinc-600">
                                {item.location || 'No location'}
                              </p>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-xl border border-zinc-200 bg-white/80 p-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                                  Reason
                                </p>
                                <p className="mt-2 text-sm text-zinc-800">
                                  {item.reason}
                                </p>
                              </div>

                              <div className="rounded-xl border border-zinc-200 bg-white/80 p-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                                  Due
                                </p>
                                <p className="mt-2 text-sm text-zinc-800">
                                  {formatMaybeDate(item.dueDate ?? null)}
                                </p>
                              </div>

                              <div className="rounded-xl border border-zinc-200 bg-white/80 p-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                                  Priority
                                </p>
                                <p className="mt-2 text-sm text-zinc-800">
                                  {item.priorityScore}
                                </p>
                              </div>
                            </div>

                            {item.overdueDays ? (
                              <div className="mt-4 inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                                {item.overdueDays} day
                                {item.overdueDays === 1 ? '' : 's'} overdue
                              </div>
                            ) : null}

                            {item.snoozedUntil ? (
                              <div className="mt-4 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                                Snoozed until {formatMaybeDate(item.snoozedUntil)}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Link
                              href={item.href}
                              className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                            >
                              Open
                            </Link>

                            <Link
                              href={`/jobs/${item.jobId}`}
                              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                            >
                              Job Detail
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </SectionCard>
            )
          })}
        </section>
      )}
    </main>
  )
}