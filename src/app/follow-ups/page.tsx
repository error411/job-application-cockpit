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
    return <main className="p-6">Error loading follow-ups: {error.message}</main>
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Follow-Ups</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Derived from due and sent timestamps. No follow-up statuses.
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
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
          >
            Run Follow-Up Worker ({dueNow.length})
          </button>
        </form>
      ) : null}
    </div>

    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Due Now</h2>

      {dueNow.length ? (
        <div className="grid gap-4">
          {dueNow.map((app) => (
            <FollowUpCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-600">No follow-ups due right now.</p>
      )}
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Upcoming</h2>

      {upcoming.length ? (
        <div className="grid gap-4">
          {upcoming.map((app) => (
            <FollowUpCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-600">
          No upcoming follow-ups scheduled.
        </p>
      )}
    </section>
  </div>
)
}

function FollowUpCard({ app }: { app: FollowUpListItem }) {
  return (
    <div className="rounded border p-4">
      <h3 className="font-semibold">{app.job?.title || 'Unknown Job'}</h3>
      <p>{app.job?.company || 'Unknown Company'}</p>
      <p className="text-sm opacity-70">{app.job?.location || 'No location'}</p>

      <div className="mt-3 space-y-1 text-sm">
        <p>Status: {app.status}</p>
        <p>Follow-up 1 Due: {formatDate(app.follow_up_1_due)}</p>
        <p>Follow-up 2 Due: {formatDate(app.follow_up_2_due)}</p>
      </div>

      <div className="mt-3">
        <p className="text-sm">
          <span className="font-medium">Notes:</span> {app.notes || '—'}
        </p>
      </div>

      <div className="mt-3">
        <Link href={`/jobs/${app.job_id}`} className="text-sm underline">
          View Job
        </Link>
      </div>
    </div>
  )
}