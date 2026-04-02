export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { ScoreBadge } from '@/components/score-badge'
import { DispositionBadge } from '@/components/disposition-badge'
import {
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from '@/components/ui/section-card'
import { PageShell, PageHeader } from '@/components/ui/page-shell'
import { getActiveWorkflowApplications } from '@/lib/applications/get-active-workflow-applications'
import {
  buildActionItems,
  groupTodayActionItems,
} from '@/lib/applications/build-action-items'
import type { WorkflowDecision } from '@/lib/workflow/types'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isApplicationDisposition,
  type ApplicationDisposition,
} from '@/lib/statuses'

type NormalizedTodayApplication = Parameters<typeof buildActionItems>[0][number]

function toWorkflowDecision(value: unknown): WorkflowDecision | null {
  if (typeof value !== 'string' || value.length === 0) return null
  return value as WorkflowDecision
}

function toApplicationDisposition(
  value: unknown
): ApplicationDisposition | null {
  if (typeof value !== 'string') return null
  return isApplicationDisposition(value) ? value : null
}

function formatMaybeDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
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

    const disposition = toApplicationDisposition(row.disposition)

    const dispositionAt =
      (row.dispositionAt as string | null | undefined) ??
      (row.disposition_at as string | null | undefined) ??
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
      disposition,
      dispositionAt,
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function EmptyStateModern() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">
        Nothing urgent right now
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Your queue is clear. Add a new job or review your pipeline.
      </p>
      <div className="mt-5">
        <Button asChild variant="brand">
          <Link href="/jobs/new">Add Job</Link>
        </Button>
      </div>
    </div>
  )
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
      <PageShell>
        <SectionCard>
          <SectionCardHeader title="Load error" />
          <SectionCardBody>
            <p className="text-sm text-red-600">{message}</p>
          </SectionCardBody>
        </SectionCard>
      </PageShell>
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
    <PageShell className="space-y-8">
      <PageHeader
        title="Today"
        description="Focus on the highest-value next actions across your pipeline."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Metric label="Overdue" value={overdueItems.length} />
        <Metric label="Due Now" value={dueTodayItems.length} />
        <Metric label="Apply Now" value={applyNowItems.length} />
        <Metric label="Needs Attention" value={needsAttentionItems.length} />
        <Metric label="Waiting" value={waitingItems.length} />
        <Metric label="Snoozed" value={snoozedItems.length} />
      </div>

      {groups.length === 0 ? (
        <EmptyStateModern />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <SectionCard key={group.key}>
              <SectionCardHeader
                title={group.label}
                description={`${group.items.length} item${
                  group.items.length === 1 ? '' : 's'
                }`}
              />

              <SectionCardBody>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                              {item.kind.replaceAll('_', ' ')}
                            </span>

                            <ScoreBadge score={item.score} />

                            {item.status ? (
                              <StatusBadge status={item.status} />
                            ) : null}

                            <DispositionBadge disposition={item.disposition} />
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-medium text-slate-500">
                              {item.company}
                            </p>
                            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {item.location || 'No location'}
                            </p>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <InfoBlock label="Reason" value={item.reason} />
                            <InfoBlock
                              label="Due"
                              value={formatMaybeDate(item.dueDate)}
                            />
                            <InfoBlock
                              label="Disposition"
                              value={item.disposition?.replaceAll('_', ' ') ?? 'Open'}
                            />
                            <InfoBlock
                              label="Priority"
                              value={String(item.priorityScore)}
                            />
                          </div>

                          {item.overdueDays ? (
                            <div className="mt-4 inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                              {item.overdueDays} day
                              {item.overdueDays === 1 ? '' : 's'} overdue
                            </div>
                          ) : null}

                          {item.snoozedUntil ? (
                            <div className="mt-4 inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                              Snoozed until {formatMaybeDate(item.snoozedUntil)}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-row flex-wrap gap-2 lg:flex-col">
                          {/* <Button asChild variant="brand">
                            <Link href={item.href}>Open</Link>
                          </Button> */}

                          <Button asChild variant="secondary">
                            <Link href={`/jobs/${item.jobId}`}>Job Detail</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCardBody>
            </SectionCard>
          ))}
        </div>
      )}
    </PageShell>
  )
}