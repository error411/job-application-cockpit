import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationRow, JobRow } from '@/lib/supabase/model-types'
import { isApplicationStatus, type ApplicationStatus } from '@/lib/statuses'
import { getFollowUpState } from '@/lib/applications/get-follow-up-state'

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

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

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

function getPriority(app: ApplicationListItem) {
  const followUpState = getFollowUpState({
    follow_up_1_due: app.follow_up_1_due,
    follow_up_2_due: app.follow_up_2_due,
    follow_up_1_sent_at: app.follow_up_1_sent_at,
    follow_up_2_sent_at: app.follow_up_2_sent_at,
  })

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

function PipelineColumn({
  title,
  items,
}: {
  title: string
  items: ApplicationListItem[]
}) {
  return (
    <section className="app-panel">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h2>

      <div className="mt-4 space-y-4">
        {items.length ? (
          items.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))
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
  .sort((a, b) => getPriority(b) - getPriority(a))
  
  const nextActions = applications.filter(
  (app) =>
    app.status !== 'rejected' &&
    app.status !== 'closed' &&
    app.job !== null
)

  const grouped = {
    ready: applications.filter((a) => a.status === 'ready'),
    applied: applications.filter(
      (a) => a.status === 'applied'
    ),
    interviewing: applications.filter((a) => a.status === 'interviewing'),
    closed: applications.filter(
      (a) => a.status === 'rejected' || a.status === 'closed'
    ),
  }

  return (
  <div className="space-y-8">
    {/* Header */}
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

    {/* Next Actions */}
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Next Actions
        </h2>
        <span className="text-sm text-zinc-500">
          Top priority items
        </span>
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

    {/* Pipeline Columns */}
    <section className="grid gap-6 md:grid-cols-3">
      <PipelineColumn title="Ready" items={grouped.ready} />
      <PipelineColumn title="Applied" items={grouped.applied} />
      <PipelineColumn title="Interviewing" items={grouped.interviewing} />
    </section>

    {/* Closed */}
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
  app: ApplicationListItem
  highlight?: boolean
}) {
  const job = app.job

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        highlight
          ? 'border-amber-200 bg-white'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-zinc-950">
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-zinc-500">Status</p>
          <p className="font-medium text-zinc-900">{app.status}</p>
        </div>

        <div>
          <p className="text-zinc-500">Applied</p>
          <p className="font-medium text-zinc-900">
            {formatDate(app.applied_at)}
          </p>
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
        <p className="mt-1 text-sm text-zinc-700">
          {app.notes || '—'}
        </p>
      </div>
    </div>
  )
}