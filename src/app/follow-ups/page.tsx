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
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Follow-Ups</h1>
        <div className="flex gap-3">
          <Link href="/applications" className="rounded border px-4 py-2">
            Applications
          </Link>
          <Link href="/jobs" className="rounded border px-4 py-2">
            Jobs
          </Link>
        </div>
      </div>

      <section className="mb-6 rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Due Now</h2>
        <div className="space-y-4">
          {dueNow.length ? (
            dueNow.map((app) => <FollowUpCard key={app.id} app={app} />)
          ) : (
            <p>No follow-ups due right now.</p>
          )}
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
        <div className="space-y-4">
          {upcoming.length ? (
            upcoming.map((app) => <FollowUpCard key={app.id} app={app} />)
          ) : (
            <p>No upcoming follow-ups scheduled.</p>
          )}
        </div>
      </section>
    </main>
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