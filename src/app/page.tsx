import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

type ApplicationRow = Tables<'applications'>
type JobRow = Tables<'jobs'>
type JobScoreRow = Tables<'job_scores'>

type HomeJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location' | 'status' | 'created_at'>
type HomeApplicationJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>
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
  | 'updated_at'
  | 'notes'
> & {
  jobs: HomeApplicationJob | HomeApplicationJob[] | null
}

type HomeApplication = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
  | 'updated_at'
  | 'notes'
> & {
  job: HomeApplicationJob | null
}

type HomeScore = Pick<JobScoreRow, 'job_id' | 'score' | 'created_at'>

type PunchListItem = {
  id: string
  kind: 'follow_up' | 'apply'
  company: string
  title: string
  location: string
  status: string | null
  score: number | null
  reason: string
  href: string
  dueDate?: string | null
  priority: number
}

function normalizeJob(
  value: HomeApplicationJob | HomeApplicationJob[] | null
): HomeApplicationJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function toHomeApplication(row: RawApplicationRow): HomeApplication {
  return {
    id: row.id,
    job_id: row.job_id,
    status: row.status,
    applied_at: row.applied_at,
    follow_up_1_due: row.follow_up_1_due,
    follow_up_2_due: row.follow_up_2_due,
    follow_up_1_sent_at: row.follow_up_1_sent_at,
    follow_up_2_sent_at: row.follow_up_2_sent_at,
    updated_at: row.updated_at,
    notes: row.notes,
    job: normalizeJob(row.jobs),
  }
}

function startOfTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function isDueNow(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  return new Date(dateString) <= new Date()
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function daysSince(value: string | null | undefined): number | null {
  if (!value) return null
  const date = new Date(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function buildLatestScoresMap(scores: HomeScore[]): Map<string, number | null> {
  const map = new Map<string, number | null>()

  for (const row of scores) {
    if (!map.has(row.job_id)) {
      map.set(row.job_id, row.score)
    }
  }

  return map
}

function getActiveFollowUpLabel(app: HomeApplication): {
  label: string
  dueDate: string | null
} | null {
  if (app.follow_up_1_due && !app.follow_up_1_sent_at && isDueNow(app.follow_up_1_due)) {
    return {
      label: 'Follow-up 1 due now',
      dueDate: app.follow_up_1_due,
    }
  }

  if (app.follow_up_2_due && !app.follow_up_2_sent_at && isDueNow(app.follow_up_2_due)) {
    return {
      label: 'Follow-up 2 due now',
      dueDate: app.follow_up_2_due,
    }
  }

  return null
}

function buildPunchList(
  applications: HomeApplication[],
  latestScoresByJobId: Map<string, number | null>
): PunchListItem[] {
  const items: PunchListItem[] = []

  for (const app of applications) {
    const job = app.job
    const company = job?.company ?? 'Unknown company'
    const title = job?.title ?? 'Untitled role'
    const location = job?.location ?? '—'
    const score = latestScoresByJobId.get(app.job_id) ?? null
    const scoreBoost = score ?? 0

    const activeFollowUp = getActiveFollowUpLabel(app)

    if (activeFollowUp) {
      items.push({
        id: `${app.id}-follow-up`,
        kind: 'follow_up',
        company,
        title,
        location,
        status: app.status,
        score,
        reason: activeFollowUp.label,
        href: '/follow-ups',
        dueDate: activeFollowUp.dueDate,
        priority: 100 + scoreBoost,
      })
      continue
    }

    if (app.status === 'ready') {
      items.push({
        id: `${app.id}-apply`,
        kind: 'apply',
        company,
        title,
        location,
        status: app.status,
        score,
        reason: 'Ready to apply',
        href: '/applications',
        priority: 70 + scoreBoost,
      })
      continue
    }

    if (app.status === 'applied') {
      const age = daysSince(app.applied_at)

      if (age !== null && age >= 5 && age <= 10) {
        items.push({
          id: `${app.id}-window`,
          kind: 'follow_up',
          company,
          title,
          location,
          status: app.status,
          score,
          reason: `Applied ${age} days ago — follow-up window active`,
          href: '/follow-ups',
          priority: 55 + scoreBoost,
        })
      }
    }
  }

  return items.sort((a, b) => b.priority - a.priority)
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function PunchListCard({ item }: { item: PunchListItem }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
          {item.kind === 'follow_up' ? 'Follow-Up' : 'Apply'}
        </span>

        {item.score !== null ? (
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
            Score {item.score}/100
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight">{item.title}</h3>
      <p className="text-sm text-zinc-700">{item.company}</p>
      <p className="text-sm text-zinc-500">{item.location}</p>

      <p className="mt-3 text-sm text-zinc-700">{item.reason}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
        <span>Status: {item.status ?? '—'}</span>
        {item.dueDate ? <span>Due: {formatDate(item.dueDate)}</span> : null}
      </div>

      <div className="mt-4">
        <Link
          href={item.href}
          className="inline-flex rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-50"
        >
          Open
        </Link>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: jobs, error: jobsError },
    { data: applications, error: applicationsError },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, company, title, location, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
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
        updated_at,
        notes,
        jobs:jobs!applications_job_id_fkey (
          id,
          company,
          title,
          location
        )
      `)
      .order('updated_at', { ascending: false }),
  ])

  if (jobsError) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-red-600">Failed to load jobs.</p>
        <p className="text-sm text-zinc-600">{jobsError.message}</p>
      </div>
    )
  }

  if (applicationsError) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-red-600">Failed to load applications.</p>
        <p className="text-sm text-zinc-600">{applicationsError.message}</p>
      </div>
    )
  }

  const typedJobs: HomeJob[] = jobs ?? []
  const typedApplications = ((applications ?? []) as RawApplicationRow[]).map(
    toHomeApplication
  )

  const jobIds = typedApplications.map((row) => row.job_id)

  let latestScoresByJobId = new Map<string, number | null>()

  if (jobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      return (
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-red-600">Failed to load job scores.</p>
          <p className="text-sm text-zinc-600">{scoresError.message}</p>
        </div>
      )
    }

    latestScoresByJobId = buildLatestScoresMap((scores ?? []) as HomeScore[])
  }

  const dueNowCount = typedApplications.filter(
    (app) =>
      (app.follow_up_1_due &&
        !app.follow_up_1_sent_at &&
        isDueNow(app.follow_up_1_due)) ||
      (app.follow_up_2_due &&
        !app.follow_up_2_sent_at &&
        isDueNow(app.follow_up_2_due))
  ).length

  const readyCount = typedApplications.filter((app) => app.status === 'ready').length
  const appliedCount = typedApplications.filter((app) => app.status === 'applied').length
  const interviewingCount = typedApplications.filter(
    (app) => app.status === 'interviewing'
  ).length

  const recentJobs = typedJobs.slice(0, 5)
  const punchList = buildPunchList(typedApplications, latestScoresByJobId).slice(0, 6)

  const jobsThisWeek = typedJobs.filter((job) => {
    if (!job.created_at) return false
    const created = new Date(job.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return created >= sevenDaysAgo
  }).length

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Snapshot of what needs attention next across applications, follow-ups,
          and recent pipeline activity.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Due now"
          value={dueNowCount}
          hint="Active follow-ups derived from due and sent timestamps."
        />
        <SummaryCard
          label="Ready to apply"
          value={readyCount}
          hint="Applications waiting for execution."
        />
        <SummaryCard
          label="Applied"
          value={appliedCount}
          hint="Recently submitted jobs still in flight."
        />
        <SummaryCard
          label="Interviewing"
          value={interviewingCount}
          hint="Live opportunities needing active management."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Today&apos;s punch list
            </h2>
            <Link
              href="/today"
              className="text-sm font-medium text-zinc-700 underline underline-offset-4"
            >
              Open Today
            </Link>
          </div>

          {punchList.length ? (
            <div className="grid gap-4">
              {punchList.map((item) => (
                <PunchListCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="text-lg font-semibold tracking-tight">
                Nothing urgent right now
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                No due follow-ups and no ready applications currently match the
                dashboard rules.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Pipeline snapshot
              </h2>
              <Link
                href="/applications"
                className="text-sm font-medium text-zinc-700 underline underline-offset-4"
              >
                View applications
              </Link>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600">Total jobs</dt>
                <dd className="font-medium text-zinc-900">{typedJobs.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600">Jobs added in last 7 days</dt>
                <dd className="font-medium text-zinc-900">{jobsThisWeek}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600">Tracked applications</dt>
                <dd className="font-medium text-zinc-900">
                  {typedApplications.length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-600">Follow-ups due now</dt>
                <dd className="font-medium text-zinc-900">{dueNowCount}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">Recent jobs</h2>
              <Link
                href="/jobs"
                className="text-sm font-medium text-zinc-700 underline underline-offset-4"
              >
                View jobs
              </Link>
            </div>

            {recentJobs.length ? (
              <div className="mt-4 space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border-t border-zinc-200 pt-4 first:border-t-0 first:pt-0">
                    <h3 className="text-base font-semibold tracking-tight">
                      {job.title}
                    </h3>
                    <p className="text-sm text-zinc-700">{job.company}</p>
                    <p className="text-sm text-zinc-500">
                      {job.location || 'No location'}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                      <span className="text-zinc-600">Status: {job.status ?? '—'}</span>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-zinc-700 underline underline-offset-4"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">No jobs yet.</p>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}