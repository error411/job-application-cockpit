import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getFollowUpState,
  type FollowUpState,
} from '@/lib/applications/get-follow-up-state'
import type { Tables } from '@/lib/supabase/types'
import FollowUpActions from './follow-up-actions'
import { formatDate } from '@/lib/dates'

type ApplicationRow = Tables<'applications'>
type JobRow = Tables<'jobs'>
type AssetRow = Tables<'application_assets'>

type FollowUpListJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>

type RawFollowUpRow = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
  | 'notes'
> & {
  jobs: FollowUpListJob | FollowUpListJob[] | null
}

type FollowUpListAsset = Pick<
  AssetRow,
  'job_id' | 'follow_up_1_email_markdown' | 'follow_up_2_email_markdown'
>

type FollowUpListItem = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
  | 'notes'
> & {
  job: FollowUpListJob | null
  asset: FollowUpListAsset | null
}

type FollowUpListItemWithState = FollowUpListItem & {
  followUpState: FollowUpState
}

// function formatDate(dateString: string | null) {
//   if (!dateString) return '—'
//   return new Date(dateString).toLocaleDateString()
// }

// function formatDateTime(dateString: string | null) {
//   if (!dateString) return '—'
//   return new Date(dateString).toLocaleString()
// }

function normalizeJob(
  value: FollowUpListJob | FollowUpListJob[] | null
): FollowUpListJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function toFollowUpListItem(
  row: RawFollowUpRow,
  assetByJobId: Map<string, FollowUpListAsset>
): FollowUpListItem {
  return {
    id: row.id,
    job_id: row.job_id,
    status: row.status,
    follow_up_1_due: row.follow_up_1_due,
    follow_up_2_due: row.follow_up_2_due,
    follow_up_1_sent_at: row.follow_up_1_sent_at,
    follow_up_2_sent_at: row.follow_up_2_sent_at,
    notes: row.notes,
    job: normalizeJob(row.jobs),
    asset: assetByJobId.get(row.job_id) ?? null,
  }
}

function withFollowUpState(app: FollowUpListItem): FollowUpListItemWithState {
  return {
    ...app,
    followUpState: getFollowUpState({
      follow_up_1_due: app.follow_up_1_due,
      follow_up_2_due: app.follow_up_2_due,
      follow_up_1_sent_at: app.follow_up_1_sent_at,
      follow_up_2_sent_at: app.follow_up_2_sent_at,
    }),
  }
}

function getCardTone(app: FollowUpListItemWithState) {
  return app.followUpState.hasDueNow
    ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white'
    : 'border-zinc-200 bg-white'
}

function FollowUpCard({ app }: { app: FollowUpListItemWithState }) {
  const activeFollowUpStage = app.followUpState.activeStage

  const activeFollowUpContent =
    activeFollowUpStage === 1
      ? app.asset?.follow_up_1_email_markdown ?? null
      : activeFollowUpStage === 2
        ? app.asset?.follow_up_2_email_markdown ?? null
        : null

  const activeFollowUpDue =
    activeFollowUpStage === 1
      ? app.follow_up_1_due
      : activeFollowUpStage === 2
        ? app.follow_up_2_due
        : null

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${getCardTone(app)}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {activeFollowUpStage !== null
                ? `Follow-Up ${activeFollowUpStage}`
                : 'Scheduled'}
            </span>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {activeFollowUpStage !== null ? 'Due Now' : 'Upcoming'}
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
          <Link href={`/jobs/${app.job_id}`} className="app-button">
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
            {app.follow_up_1_sent_at
              ? `Sent ${formatDate(app.follow_up_1_sent_at)}`
              : formatDate(app.follow_up_1_due)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Follow-Up 2
          </p>
          <p className="mt-2 text-base font-semibold text-zinc-950">
            {app.follow_up_2_sent_at
              ? `Sent ${formatDate(app.follow_up_2_sent_at)}`
              : formatDate(app.follow_up_2_due)}
          </p>
        </div>
      </div>

      {activeFollowUpStage !== null ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Follow-up {activeFollowUpStage} active
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Due: {formatDateTime(activeFollowUpDue)}
          </p>

          {activeFollowUpContent ? (
            <>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-amber-900">
                  Preview follow-up email
                </summary>
                <div className="mt-2 whitespace-pre-wrap rounded-xl border border-amber-200 bg-white p-3 text-sm text-zinc-700">
                  {activeFollowUpContent}
                </div>
              </details>

              <FollowUpActions
                jobId={app.job_id}
                title={app.job?.title || 'this role'}
                body={activeFollowUpContent}
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-amber-800">
              No generated follow-up content found yet.
            </p>
          )}
        </div>
      ) : null}

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

  const applicationRows = (data ?? []) as RawFollowUpRow[]
  const jobIds = Array.from(new Set(applicationRows.map((row) => row.job_id)))

  const assetByJobId = new Map<string, FollowUpListAsset>()

  if (jobIds.length > 0) {
    const { data: assetData, error: assetError } = await supabase
      .from('application_assets')
      .select(`
        job_id,
        follow_up_1_email_markdown,
        follow_up_2_email_markdown
      `)
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (assetError) {
      return (
        <main className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Workflow
          </p>
          <h1>Follow-Ups</h1>
          <p className="text-sm text-red-600">
            Error loading follow-up assets: {assetError.message}
          </p>
        </main>
      )
    }

    for (const row of (assetData ?? []) as FollowUpListAsset[]) {
      if (!assetByJobId.has(row.job_id)) {
        assetByJobId.set(row.job_id, row)
      }
    }
  }

  const applications = applicationRows
    .map((row) => toFollowUpListItem(row, assetByJobId))
    .map(withFollowUpState)

  const dueNow = applications.filter((app) => app.followUpState.hasDueNow)
  const upcoming = applications.filter((app) => app.followUpState.hasUpcoming)

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
              Derived from due and sent timestamps. No follow-up statuses. The
              UI reflects urgency from schedule data, not manual workflow
              states.
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Active
          </p>
          <h2 className="mt-1">Due Now</h2>
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