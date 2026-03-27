import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

type ApplicationRow = Tables<'applications'>
type JobRow = Tables<'jobs'>

type FollowUpListJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>

type RawFollowUpRow = Pick<
  ApplicationRow,
  'id' | 'job_id' | 'status' | 'follow_up_1_due' | 'follow_up_2_due' | 'notes'
> & {
  jobs: FollowUpListJob | FollowUpListJob[] | null
}

type FollowUpListItem = Pick<
  ApplicationRow,
  'id' | 'job_id' | 'status' | 'follow_up_1_due' | 'follow_up_2_due' | 'notes'
> & {
  job: FollowUpListJob | null
}

function isDue(dateString: string | null) {
  if (!dateString) return false
  return new Date(dateString) <= new Date()
}

function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString()
}

function normalizeJob(
  value: FollowUpListJob | FollowUpListJob[] | null
): FollowUpListJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function toFollowUpListItem(row: RawFollowUpRow): FollowUpListItem {
  return {
    id: row.id,
    job_id: row.job_id,
    status: row.status,
    follow_up_1_due: row.follow_up_1_due,
    follow_up_2_due: row.follow_up_2_due,
    notes: row.notes,
    job: normalizeJob(row.jobs),
  }
}

function getCardTone(app: FollowUpListItem) {
  if (isDue(app.follow_up_1_due) || isDue(app.follow_up_2_due)) {
    return 'border-rose-200 bg-gradient-to-br from-rose-50 to-white'
  }

  return 'border-zinc-200 bg-white'
}

function FollowUpCard({ app }: { app: FollowUpListItem }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${getCardTone(app)}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {isDue(app.follow_up_1_due) || isDue(app.follow_up_2_due)
                ? 'Due Now'
                : 'Upcoming'}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {app.status}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-950">
            {app.job?.title || 'Unknown Job'}
          </h3>
          <p className="mt-1 text-sm font-medium text-zinc-700">
            {app.job?.company || 'Unknown Company'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {app.job?.location || 'No location'}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href={`/jobs/${app.job_id}`}
            className="app-button"
          >
            View Job
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Follow-Up 1
          </p>
          <p className="mt-2 text-base font-semibold text-zinc-950">
            {formatDate(app.follow_up_1_due)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Follow-Up 2
          </p>
          <p className="mt-2 text-base font-semibold text-zinc-950">
            {formatDate(app.follow_up_2_due)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-white/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Notes
        </p>
        <p className="mt-2 text-sm text-zinc-700">{app.notes || '—'}</p>
      </div>
    </div>
  )
}

export default async function FollowUpsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      job_id,
      status,
      follow_up_1_due,
      follow_up_2_due,
      notes,
      jobs:jobs!applications_job_id_fkey (
        id,
        company,
        title,
        location
      )
    `)
    .in('status', ['applied', 'interviewing'])
    .order('updated_at', { ascending: false })

  if (error) {
    return (
      <main className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Workflow
        </p>
        <h1>Follow-Ups</h1>
        <p className="text-sm text-red-600">
          Error loading follow-ups: {error.message}
        </p>
      </main>
    )
  }

  const applications = ((data ?? []) as RawFollowUpRow[]).map(toFollowUpListItem)

  const dueNow = applications.filter(
    (app) => isDue(app.follow_up_1_due) || isDue(app.follow_up_2_due)
  )

  const upcoming = applications.filter(
    (app) =>
      !isDue(app.follow_up_1_due) &&
      !isDue(app.follow_up_2_due) &&
      Boolean(app.follow_up_1_due || app.follow_up_2_due)
  )

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Workflow
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1>Follow-Ups</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600">
              Derived from due and sent timestamps. No follow-up statuses.
              The UI reflects urgency from schedule data, not manual workflow states.
            </p>
          </div>

          {dueNow.length > 0 ? (
            <form action="/api/automation-run-form" method="POST">
              <input type="hidden" name="from" value="/follow-ups" />
              <input
                type="hidden"
                name="limit"
                value={String(Math.min(Math.max(dueNow.length, 1), 10))}
              />
              <button type="submit" className="app-button-primary">
                Run Follow-Up Worker ({dueNow.length})
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Due now</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
            {dueNow.length}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Follow-ups that need attention immediately.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Upcoming</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
            {upcoming.length}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Scheduled follow-ups still ahead.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Tracked apps</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
            {applications.length}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Applied or interviewing opportunities with follow-up relevance.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">View queue</p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-zinc-950">
            Open Today
          </p>
          <div className="mt-4">
            <Link href="/today" className="app-button">
              Go to Today
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Active
            </p>
            <h2 className="mt-1">Due Now</h2>
          </div>
        </div>

        {dueNow.length ? (
          <div className="grid gap-4">
            {dueNow.map((app) => (
              <FollowUpCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
              No follow-ups due right now
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Nothing currently requires immediate follow-up action.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Scheduled
          </p>
          <h2 className="mt-1">Upcoming</h2>
        </div>

        {upcoming.length ? (
          <div className="grid gap-4">
            {upcoming.map((app) => (
              <FollowUpCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
              No upcoming follow-ups scheduled
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              There are no future follow-up dates currently queued.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}