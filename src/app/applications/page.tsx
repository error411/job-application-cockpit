import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationRow, JobRow } from '@/lib/supabase/model-types'
import { isApplicationStatus, type ApplicationStatus } from '@/lib/statuses'
import {
  getFollowUpState,
  type FollowUpState,
} from '@/lib/applications/get-follow-up-state'
import { formatDate } from '@/lib/dates'

type ApplicationListJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>

type RawApplicationRow = Pick<
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
> & {
  jobs: ApplicationListJob | ApplicationListJob[] | null
}

type ApplicationListItem = {
  id: string
  job_id: string
  status: ApplicationStatus
  applied_at: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  follow_up_1_sent_at: string | null
  follow_up_2_sent_at: string | null
  notes: string | null
  job: ApplicationListJob | null
}

type ApplicationListItemWithState = ApplicationListItem & {
  followUpState: FollowUpState
  priority: number
}

// function formatDate(value: string | null) {
//   if (!value) return '—'
//   return new Date(value).toLocaleDateString()
// }

function normalizeJob(
  value: ApplicationListJob | ApplicationListJob[] | null
): ApplicationListJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normalizeApplicationStatus(value: string | null): ApplicationStatus {
  if (value && isApplicationStatus(value)) {
    return value
  }

  return 'ready'
}

function toApplicationListItem(row: RawApplicationRow): ApplicationListItem {
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
    job: normalizeJob(row.jobs),
  }
}

function getPriority(app: ApplicationListItem, followUpState: FollowUpState) {
  if (followUpState.hasDueNow) {
    return 4
  }

  if (app.status === 'ready') {
    return 3
  }

  if (app.status === 'applied') {
    return 2
  }

  if (app.status === 'interviewing') {
    return 1
  }

  return 0
}

function withComputedState(app: ApplicationListItem): ApplicationListItemWithState {
  const followUpState = getFollowUpState({
    follow_up_1_due: app.follow_up_1_due,
    follow_up_2_due: app.follow_up_2_due,
    follow_up_1_sent_at: app.follow_up_1_sent_at,
    follow_up_2_sent_at: app.follow_up_2_sent_at,
  })

  return {
    ...app,
    followUpState,
    priority: getPriority(app, followUpState),
  }
}

function getCardTone(app: ApplicationListItemWithState, highlight: boolean) {
  if (highlight && app.followUpState.hasDueNow) {
    return 'border-rose-200 bg-white'
  }

  if (highlight) {
    return 'border-amber-200 bg-white'
  }

  if (app.followUpState.hasDueNow) {
    return 'border-rose-200 bg-rose-50/30'
  }

  return 'border-zinc-200 bg-white'
}

function getActionLabel(app: ApplicationListItemWithState) {
  if (app.followUpState.hasDueNow) {
    return 'Follow-up due now'
  }

  if (app.status === 'ready') {
    return 'Ready to apply'
  }

  if (app.status === 'applied') {
    return 'Applied and in flight'
  }

  if (app.status === 'interviewing') {
    return 'Interview process active'
  }

  return 'No immediate action'
}

function PipelineColumn({
  title,
  items,
}: {
  title: string
  items: ApplicationListItemWithState[]
}) {
  return (
    <section className="app-panel">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h2>

      <div className="mt-4 space-y-4">
        {items.length ? (
          items.map((app) => <ApplicationCard key={app.id} app={app} />)
        ) : (
          <p className="text-sm text-zinc-600">
            No {title.toLowerCase()} applications.
          </p>
        )}
      </div>
    </section>
  )
}

export default async function ApplicationsPage() {
  const supabase = await createClient()

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
      jobs:jobs!applications_job_id_fkey (
        id,
        company,
        title,
        location
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    return <main className="p-6">Error loading applications: {error.message}</main>
  }

  const applications = ((data ?? []) as RawApplicationRow[])
    .map(toApplicationListItem)
    .map(withComputedState)
    .sort((a, b) => b.priority - a.priority)

  const nextActions = applications.filter(
    (app) =>
      app.job !== null &&
      app.status !== 'rejected' &&
      app.status !== 'closed' &&
      app.priority > 0
  )

  const grouped = {
    ready: applications.filter((a) => a.status === 'ready'),
    applied: applications.filter((a) => a.status === 'applied'),
    interviewing: applications.filter((a) => a.status === 'interviewing'),
    closed: applications.filter(
      (a) => a.status === 'rejected' || a.status === 'closed'
    ),
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Pipeline
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1>Applications</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600">
              Track application progress, follow-up timing, and next actions across
              your pipeline.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/follow-ups" className="app-button">
              Follow-Ups
            </Link>
            <Link href="/jobs" className="app-button">
              Back to Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Next Actions
          </h2>
          <span className="text-sm text-zinc-500">Top priority items</span>
        </div>

        <div className="mt-4 grid gap-4">
          {nextActions.slice(0, 3).length ? (
            nextActions.slice(0, 3).map((app) => (
              <ApplicationCard key={app.id} app={app} highlight />
            ))
          ) : (
            <p className="text-sm text-zinc-600">
              No priority actions right now.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <PipelineColumn title="Ready" items={grouped.ready} />
        <PipelineColumn title="Applied" items={grouped.applied} />
        <PipelineColumn title="Interviewing" items={grouped.interviewing} />
      </section>

      {grouped.closed.length ? (
        <section className="app-panel">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Closed
          </h2>

          <div className="mt-4 grid gap-4">
            {grouped.closed.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ApplicationCard({
  app,
  highlight = false,
}: {
  app: ApplicationListItemWithState
  highlight?: boolean
}) {
  const job = app.job

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${getCardTone(app, highlight)}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {app.status}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                app.followUpState.hasDueNow
                  ? 'bg-rose-50 text-rose-700'
                  : app.status === 'ready'
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-blue-50 text-blue-700'
              }`}
            >
              {getActionLabel(app)}
            </span>
          </div>

          <h3 className="mt-3 text-base font-semibold tracking-tight text-zinc-950">
            {job?.title || 'Unknown Job'}
          </h3>

          <p className="mt-1 text-sm font-medium text-zinc-700">
            {job?.company || 'Unknown Company'}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {job?.location || 'No location'}
          </p>
        </div>

        <Link href={`/jobs/${app.job_id}`} className="app-button">
          View Job
        </Link>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-zinc-500">Applied</p>
          <p className="font-medium text-zinc-900">{formatDate(app.applied_at)}</p>
        </div>

        <div>
          <p className="text-zinc-500">Priority</p>
          <p className="font-medium text-zinc-900">{app.priority}</p>
        </div>

        <div>
          <p className="text-zinc-500">Follow-up 1</p>
          <p className="font-medium text-zinc-900">
            {app.follow_up_1_sent_at
              ? `Sent ${formatDate(app.follow_up_1_sent_at)}`
              : formatDate(app.follow_up_1_due)}
          </p>
        </div>

        <div>
          <p className="text-zinc-500">Follow-up 2</p>
          <p className="font-medium text-zinc-900">
            {app.follow_up_2_sent_at
              ? `Sent ${formatDate(app.follow_up_2_sent_at)}`
              : formatDate(app.follow_up_2_due)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Notes
        </p>
        <p className="mt-1 text-sm text-zinc-700">{app.notes || '—'}</p>
      </div>
    </div>
  )
}