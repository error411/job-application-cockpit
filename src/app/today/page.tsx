import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'
import { buildActionItems } from '@/lib/applications/build-action-items'
import { formatDate } from '@/lib/dates'
import {
  getActiveWorkflowApplications,
  type ActiveWorkflowApplicationRow,
} from '@/lib/applications/get-active-workflow-applications'

type DbApplicationRow = Tables<'applications'>
// type JobRow = Tables<'jobs'>
type DbJobScoreRow = Tables<'job_scores'>

// type TodayJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>

// type RawApplicationRow = Pick<
//   DbApplicationRow,
//   | 'id'
//   | 'job_id'
//   | 'status'
//   | 'applied_at'
//   | 'follow_up_1_due'
//   | 'follow_up_2_due'
//   | 'follow_up_1_sent_at'
//   | 'follow_up_2_sent_at'
//   | 'notes'
//   | 'updated_at'
// > & {
//   jobs: TodayJob | TodayJob[] | null
// }

// type TodayApplicationRow = Pick<
//   DbApplicationRow,
//   | 'id'
//   | 'job_id'
//   | 'status'
//   | 'applied_at'
//   | 'follow_up_1_due'
//   | 'follow_up_2_due'
//   | 'follow_up_1_sent_at'
//   | 'follow_up_2_sent_at'
//   | 'notes'
//   | 'updated_at'
// > & {
//   job: TodayJob | null
// }

type TodayJobScoreRow = Pick<DbJobScoreRow, 'job_id' | 'score' | 'created_at'>

type TodayItem = {
  kind: 'follow_up' | 'application'
  id: string
  jobId: string
  company: string
  title: string
  location: string
  status: string
  score: number | null
  reason: string
  priorityScore: number
  href: string
  dueDate?: string | null
}

type TodayApplicationRow = ActiveWorkflowApplicationRow

// function startOfTodayLocal(): Date {
//   const now = new Date()
//   return new Date(now.getFullYear(), now.getMonth(), now.getDate())
// }

// function endOfTodayLocal(): Date {
//   const start = startOfTodayLocal()
//   return new Date(
//     start.getFullYear(),
//     start.getMonth(),
//     start.getDate(),
//     23,
//     59,
//     59,
//     999
//   )
// }

// function isDateToday(dateString: string | null | undefined): boolean {
//   if (!dateString) return false

//   const date = new Date(dateString)
//   const start = startOfTodayLocal()
//   const end = endOfTodayLocal()

//   return date >= start && date <= end
// }

function isDatePast(dateString: string | null | undefined): boolean {
  if (!dateString) return false

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  return date < startOfToday
}

// function daysSince(dateString: string | null | undefined): number | null {
//   if (!dateString) return null

//   const date = new Date(dateString)
//   const now = new Date()
//   const diff = now.getTime() - date.getTime()

//   return Math.floor(diff / (1000 * 60 * 60 * 24))
// }

// function formatDate(dateString: string | null | undefined): string {
//   if (!dateString) return '—'

//   return new Date(dateString).toLocaleDateString(undefined, {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   })
// }

// function normalizeJob(value: TodayJob | TodayJob[] | null): TodayJob | null {
//   if (!value) return null
//   return Array.isArray(value) ? value[0] ?? null : value
// }

// function toTodayApplicationRow(row: RawApplicationRow): TodayApplicationRow {
//   return {
//     id: row.id,
//     job_id: row.job_id,
//     status: row.status,
//     applied_at: row.applied_at,
//     follow_up_1_due: row.follow_up_1_due,
//     follow_up_2_due: row.follow_up_2_due,
//     follow_up_1_sent_at: row.follow_up_1_sent_at,
//     follow_up_2_sent_at: row.follow_up_2_sent_at,
//     notes: row.notes,
//     updated_at: row.updated_at,
//     job: normalizeJob(row.jobs),
//   }
// }

function buildLatestScoresMap(
  scores: TodayJobScoreRow[]
): Map<string, number | null> {
  const map = new Map<string, number | null>()

  for (const row of scores) {
    if (!map.has(row.job_id)) {
      map.set(row.job_id, row.score)
    }
  }

  return map
}

function buildTodayItems(
  applications: TodayApplicationRow[],
  latestScoresByJobId: Map<string, number | null>
): TodayItem[] {
  return buildActionItems(applications, latestScoresByJobId).map((item) => ({
    kind: item.kind,
    id: item.id,
    jobId: item.jobId,
    company: item.company,
    title: item.title,
    location: item.location,
    status: item.status ?? 'unknown',
    score: item.score,
    reason: item.reason,
    priorityScore: item.priorityScore,
    href: item.href,
    dueDate: item.dueDate,
  }))
}

function getStatusTone(status: string | null | undefined): string {
  switch (status) {
    case 'ready':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
    case 'applied':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'interviewing':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'rejected':
    case 'closed':
      return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200'
    default:
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
  }
}

function getReasonTone(item: TodayItem): string {
  if (item.kind === 'follow_up' && isDatePast(item.dueDate)) {
    return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
  }

  if (item.kind === 'follow_up') {
    return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
  }

  return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
}

function getPrimaryActionLabel(item: TodayItem): string {
  return item.kind === 'follow_up' ? 'Open follow-ups' : 'Open applications'
}

function TodayPriorityCard({
  item,
  index,
}: {
  item: TodayItem
  index: number
}) {
  const isOverdue = item.kind === 'follow_up' && isDatePast(item.dueDate)
  const isTop = index === 0

  return (
    <article
      className={[
        'app-panel overflow-hidden rounded-2xl border bg-white shadow-sm transition',
        isTop
          ? 'border-zinc-300 ring-1 ring-zinc-200'
          : 'border-zinc-200',
      ].join(' ')}
    >
      <div
        className={[
          'border-b px-5 py-4 sm:px-6',
          isTop
            ? 'border-zinc-200 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white'
            : 'border-zinc-100 bg-gradient-to-r from-white via-zinc-50/60 to-white',
        ].join(' ')}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase',
                  isTop
                    ? 'bg-white/15 text-white ring-1 ring-white/15'
                    : 'bg-zinc-900 text-white',
                ].join(' ')}
              >
                #{index + 1}
              </span>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getReasonTone(
                  item
                )}`}
              >
                {item.kind === 'follow_up' ? 'Follow-up' : 'Application'}
              </span>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusTone(
                  item.status
                )}`}
              >
                {item.status}
              </span>

              {isTop ? (
                <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15">
                  Top priority
                </span>
              ) : null}
            </div>

            <div className="space-y-1">
              <p
                className={[
                  'text-sm font-medium',
                  isTop ? 'text-zinc-200' : 'text-zinc-500',
                ].join(' ')}
              >
                {item.company}
              </p>

              <h2
                className={[
                  'text-xl font-semibold tracking-tight',
                  isTop ? 'text-white' : 'text-zinc-950',
                ].join(' ')}
              >
                {item.title}
              </h2>

              <p
                className={[
                  'text-sm',
                  isTop ? 'text-zinc-300' : 'text-zinc-600',
                ].join(' ')}
              >
                {item.location}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:min-w-[320px]">
            <div
              className={[
                'rounded-2xl px-3 py-3 text-center',
                isTop
                  ? 'border border-white/10 bg-white/5'
                  : 'border border-zinc-200 bg-white',
              ].join(' ')}
            >
              <p
                className={[
                  'text-[11px] font-medium tracking-[0.16em] uppercase',
                  isTop ? 'text-zinc-300' : 'text-zinc-500',
                ].join(' ')}
              >
                Score
              </p>
              <p
                className={[
                  'mt-1 text-lg font-semibold',
                  isTop ? 'text-white' : 'text-zinc-950',
                ].join(' ')}
              >
                {item.score !== null ? `${item.score}/100` : '—'}
              </p>
            </div>

            <div
              className={[
                'rounded-2xl px-3 py-3 text-center',
                isTop
                  ? 'border border-white/10 bg-white/5'
                  : 'border border-zinc-200 bg-white',
              ].join(' ')}
            >
              <p
                className={[
                  'text-[11px] font-medium tracking-[0.16em] uppercase',
                  isTop ? 'text-zinc-300' : 'text-zinc-500',
                ].join(' ')}
              >
                Priority
              </p>
              <p
                className={[
                  'mt-1 text-lg font-semibold',
                  isTop ? 'text-white' : 'text-zinc-950',
                ].join(' ')}
              >
                {item.priorityScore}
              </p>
            </div>

            <div
              className={[
                'rounded-2xl px-3 py-3 text-center',
                isTop
                  ? 'border border-white/10 bg-white/5'
                  : 'border border-zinc-200 bg-white',
              ].join(' ')}
            >
              <p
                className={[
                  'text-[11px] font-medium tracking-[0.16em] uppercase',
                  isTop ? 'text-zinc-300' : 'text-zinc-500',
                ].join(' ')}
              >
                Due
              </p>
              <p
                className={[
                  'mt-1 text-sm font-semibold',
                  isTop ? 'text-white' : 'text-zinc-950',
                ].join(' ')}
              >
                {item.dueDate ? formatDate(item.dueDate) : 'No due date'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div
            className={[
              'rounded-2xl border px-4 py-4',
              isOverdue
                ? 'border-rose-200 bg-rose-50'
                : 'border-zinc-200 bg-zinc-50/70',
            ].join(' ')}
          >
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Recommended next step
            </p>
            <p className="mt-2 text-base font-semibold tracking-tight text-zinc-950">
              {item.reason}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              {item.kind === 'follow_up'
                ? isOverdue
                  ? 'This follow-up is overdue and belongs at the top of your queue.'
                  : 'This follow-up is due now and should be handled before lower-priority work.'
                : 'This application is currently actionable based on your existing pipeline rules.'}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Action target
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              {item.kind === 'follow_up' ? 'Follow-Ups page' : 'Applications page'}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Open the destination page to complete the next action on this item.
            </p>
            <p className="mt-3 text-xs text-zinc-500">Job ID: {item.jobId}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500">
            {isOverdue
              ? 'Overdue items should be handled first.'
              : item.kind === 'follow_up'
              ? 'Due follow-ups are surfaced from timestamps.'
              : 'Application priorities are surfaced from current state and timing.'}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={item.href}
              className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              {getPrimaryActionLabel(item)}
            </Link>

            <Link
              href="/jobs"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              View jobs
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Today is clear
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
          Nothing urgent today
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          No due follow-ups and no applications currently match the priority
          rules. You can review the pipeline, check active applications, or add
          more opportunities.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/applications"
            className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            View applications
          </Link>
          <Link
            href="/follow-ups"
            className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            View follow-ups
          </Link>
          <Link
            href="/jobs/new"
            className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Add job
          </Link>
        </div>
      </div>
    </section>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Operations
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Today
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Highest-priority actions based on application state, follow-up due
            dates, and latest job score.
          </p>
        </div>
      </section>

      <section className="app-panel rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.16em] text-red-700 uppercase">
          Load error
        </p>
        <h2 className="mt-2 text-lg font-semibold text-red-950">
          Failed to load today priorities
        </h2>
        <p className="mt-2 text-sm text-red-800">{message}</p>
      </section>
    </main>
  )
}

export default async function TodayPage() {
  const supabase = await createClient()

    let typedApplications: TodayApplicationRow[] = []

  try {
    typedApplications = await getActiveWorkflowApplications(supabase)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load applications.'
    return <ErrorState message={message} />
  }

  const jobIds = Array.from(new Set(typedApplications.map((row) => row.job_id)))

  let latestScoresByJobId = new Map<string, number | null>()

  if (jobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      return <ErrorState message={scoresError.message} />
    }

    const typedScores: TodayJobScoreRow[] = scores ?? []
    latestScoresByJobId = buildLatestScoresMap(typedScores)
  }

  const items = buildTodayItems(typedApplications, latestScoresByJobId)
  const followUpCount = items.filter((item) => item.kind === 'follow_up').length
  const applicationCount = items.filter((item) => item.kind === 'application').length
  const overdueCount = items.filter(
    (item) => item.kind === 'follow_up' && isDatePast(item.dueDate)
  ).length
  const topItem = items[0] ?? null

  return (
    <main className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
            Operations
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Today
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Highest-priority actions based on application state, follow-up due
            dates, and latest job score.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="app-panel rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Priority items
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {items.length}
            </p>
          </div>

          <div className="app-panel rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Follow-ups
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {followUpCount}
            </p>
          </div>

          <div className="app-panel rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Applications
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {applicationCount}
            </p>
          </div>

          <div className="app-panel rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Immediate focus
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              {topItem ? topItem.company : 'No urgent action'}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {topItem ? topItem.reason : 'Everything is clear for now.'}
            </p>
          </div>
        </div>
      </section>

      {overdueCount > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.16em] text-rose-700 uppercase">
            Attention needed
          </p>
          <p className="mt-2 text-sm text-rose-900">
            You have {overdueCount} overdue {overdueCount === 1 ? 'follow-up' : 'follow-ups'} at the top of the queue.
          </p>
        </section>
      ) : null}

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-4">
          {items.map((item, index) => (
            <TodayPriorityCard key={item.id} item={item} index={index} />
          ))}
        </section>
      )}
    </main>
  )
}