import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import type { ApplicationRow as DbApplicationRow, JobRow } from '../../lib/supabase/types'

type ApplicationListJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>

type RawApplicationRow = Pick<
  DbApplicationRow,
  'id' | 'job_id' | 'status' | 'applied_at' | 'follow_up_1_due' | 'follow_up_2_due' | 'notes'
> & {
  jobs: ApplicationListJob | ApplicationListJob[] | null
}

type ApplicationListItem = Pick<
  DbApplicationRow,
  'id' | 'job_id' | 'status' | 'applied_at' | 'follow_up_1_due' | 'follow_up_2_due' | 'notes'
> & {
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

function toApplicationListItem(row: RawApplicationRow): ApplicationListItem {
  return {
    id: row.id,
    job_id: row.job_id,
    status: row.status,
    applied_at: row.applied_at,
    follow_up_1_due: row.follow_up_1_due,
    follow_up_2_due: row.follow_up_2_due,
    notes: row.notes,
    job: normalizeJob(row.jobs),
  }
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

  const applications = ((data ?? []) as RawApplicationRow[]).map(toApplicationListItem)

  const grouped = {
    ready: applications.filter((a) => a.status === 'ready'),
    applied: applications.filter((a) => a.status === 'applied'),
    interviewing: applications.filter((a) => a.status === 'interviewing'),
    other: applications.filter(
      (a) => !['ready', 'applied', 'interviewing'].includes(a.status)
    ),
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex gap-3">
          <Link href="/follow-ups" className="border rounded px-4 py-2">
            Follow-Ups
          </Link>
          <Link href="/jobs" className="border rounded px-4 py-2">
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Ready</h2>
          <div className="space-y-4">
            {grouped.ready.length ? (
              grouped.ready.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))
            ) : (
              <p>No ready applications.</p>
            )}
          </div>
        </section>

        <section className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Applied</h2>
          <div className="space-y-4">
            {grouped.applied.length ? (
              grouped.applied.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))
            ) : (
              <p>No applied jobs.</p>
            )}
          </div>
        </section>

        <section className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Interviewing</h2>
          <div className="space-y-4">
            {grouped.interviewing.length ? (
              grouped.interviewing.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))
            ) : (
              <p>No interviews yet.</p>
            )}
          </div>
        </section>
      </div>

      {grouped.other.length ? (
        <section className="border rounded p-4 mt-6">
          <h2 className="text-xl font-semibold mb-4">Other</h2>
          <div className="space-y-4">
            {grouped.other.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

function ApplicationCard({ app }: { app: ApplicationListItem }) {
  const job = app.job

  return (
    <div className="border rounded p-3">
      <h3 className="font-semibold">{job?.title || 'Unknown Job'}</h3>
      <p>{job?.company || 'Unknown Company'}</p>
      <p className="text-sm opacity-70">{job?.location || 'No location'}</p>

      <div className="mt-3 text-sm space-y-1">
        <p>Status: {app.status}</p>
        <p>Applied: {formatDate(app.applied_at)}</p>
        <p>Follow-up 1: {formatDate(app.follow_up_1_due)}</p>
        <p>Follow-up 2: {formatDate(app.follow_up_2_due)}</p>
      </div>

      <div className="mt-3">
        <p className="text-sm">
          <span className="font-medium">Notes:</span> {app.notes || '—'}
        </p>
      </div>

      <div className="mt-3">
        <Link href={`/jobs/${app.job_id}`} className="underline text-sm">
          View Job
        </Link>
      </div>
    </div>
  )
}