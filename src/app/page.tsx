import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

type ApplicationRow = Tables<'applications'>
type JobRow = Tables<'jobs'>
type JobScoreRow = Tables<'job_scores'>

type HomeJob = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'status' | 'created_at'
>

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

function isDueNow(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  return new Date(dateString) <= new Date()
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

function getActiveFollowUpLabel(
  app: HomeApplication
): { label: string; dueDate: string | null } | null {
  if (
    app.follow_up_1_due &&
    !app.follow_up_1_sent_at &&
    isDueNow(app.follow_up_1_due)
  ) {
    return {
      label: 'Follow-up 1 due now',
      dueDate: app.follow_up_1_due,
    }
  }

  if (
    app.follow_up_2_due &&
    !app.follow_up_2_sent_at &&
    isDueNow(app.follow_up_2_due)
  ) {
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

function toneClasses(tone: 'red' | 'green' | 'blue' | 'violet' | 'zinc') {
  if (tone === 'red') {
    return 'border-rose-200 bg-gradient-to-br from-rose-50 to-white'
  }

  if (tone === 'green') {
    return 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
  }

  if (tone === 'blue') {
    return 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
  }

  if (tone === 'violet') {
    return 'border-violet-200 bg-gradient-to-br from-violet-50 to-white'
  }

  return 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100'
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string | number
  hint: string
  tone: 'red' | 'green' | 'blue' | 'violet' | 'zinc'
}) {
  return (
    <div
      className={`app-panel rounded-2xl border p-4 shadow-sm ${toneClasses(tone)}`}
    >
      <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function getStatusTone(status: string | null | undefined): string {
  switch (status) {
    case 'ready':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
    case 'applied':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'interviewing':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    default:
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
  }
}

function PunchListCard({
  item,
  index,
}: {
  item: PunchListItem
  index: number
}) {
  const isTop = index === 0
  const isFollowUp = item.kind === 'follow_up'

  return (
    <article
      className={[
        'app-panel overflow-hidden rounded-2xl border bg-white shadow-sm',
        isTop ? 'border-zinc-300 ring-1 ring-zinc-200' : 'border-zinc-200',
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
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  isFollowUp
                    ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                    : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                }`}
              >
                {isFollowUp ? 'Follow-Up' : 'Apply'}
              </span>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusTone(
                  item.status
                )}`}
              >
                {item.status ?? '—'}
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
              <h3
                className={[
                  'text-xl font-semibold tracking-tight',
                  isTop ? 'text-white' : 'text-zinc-950',
                ].join(' ')}
              >
                {item.title}
              </h3>
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

          <div className="grid grid-cols-2 gap-2 lg:min-w-[220px]">
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
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-4">
          <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
            Recommended next step
          </p>
          <p className="mt-2 text-base font-semibold tracking-tight text-zinc-950">
            {item.reason}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {isFollowUp
              ? 'This follow-up is currently actionable based on due timestamps and existing pipeline rules.'
              : 'This application is ready to move forward and is being surfaced ahead of lower-priority work.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Highest-priority work should be handled first.
          </p>

          <Link href={item.href} className="app-button-primary">
            Open
          </Link>
        </div>
      </div>
    </article>
  )
}

function SectionCard({
  title,
  description,
  href,
  hrefLabel,
  children,
}: {
  title: string
  description?: string
  href?: string
  hrefLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-zinc-600">{description}</p>
          ) : null}
        </div>

        {href && hrefLabel ? (
          <Link href={href} className="app-button">
            {hrefLabel}
          </Link>
        ) : null}
      </div>

      <div className="pt-5">{children}</div>
    </section>
  )
}

function PipelineOverviewCard({
  jobsCount,
  scoredCount,
  readyCount,
  appliedCount,
  interviewingCount,
}: {
  jobsCount: number
  scoredCount: number
  readyCount: number
  appliedCount: number
  interviewingCount: number
}) {
  const safeJobsCount = Math.max(jobsCount, 1)

  const scoredWidth = (scoredCount / safeJobsCount) * 100
  const readyWidth = (readyCount / safeJobsCount) * 100
  const appliedWidth = (appliedCount / safeJobsCount) * 100
  const interviewingWidth = (interviewingCount / safeJobsCount) * 100

  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
          Pipeline Overview
        </h2>
        <p className="text-sm font-medium text-zinc-500">{jobsCount} jobs</p>
      </div>

      <div className="pt-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-emerald-500 px-1.5 text-xs font-semibold text-white">
              {scoredCount}
            </span>
            <span className="text-sm font-medium text-zinc-700">Scored</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-blue-500 px-1.5 text-xs font-semibold text-white">
              {readyCount}
            </span>
            <span className="text-sm font-medium text-zinc-700">Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-violet-500 px-1.5 text-xs font-semibold text-white">
              {appliedCount}
            </span>
            <span className="text-sm font-medium text-zinc-700">Applied</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-amber-500 px-1.5 text-xs font-semibold text-white">
              {interviewingCount}
            </span>
            <span className="text-sm font-medium text-zinc-700">
              Interviewing
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg bg-zinc-200">
          <div className="flex h-4 w-full">
            <div
              className="bg-emerald-500"
              style={{ width: `${scoredWidth}%` }}
              title={`Scored: ${scoredCount}`}
            />
            <div
              className="bg-blue-500"
              style={{ width: `${readyWidth}%` }}
              title={`Ready: ${readyCount}`}
            />
            <div
              className="bg-violet-500"
              style={{ width: `${appliedWidth}%` }}
              title={`Applied: ${appliedCount}`}
            />
            <div
              className="bg-amber-500"
              style={{ width: `${interviewingWidth}%` }}
              title={`Interviewing: ${interviewingCount}`}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 divide-x divide-zinc-200">
          <div className="px-2 text-center first:pl-0">
            <p className="text-4xl font-semibold tracking-tight text-zinc-950">
              {scoredCount}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Scored</p>
          </div>

          <div className="px-2 text-center">
            <p className="text-4xl font-semibold tracking-tight text-zinc-950">
              {readyCount}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Ready</p>
          </div>

          <div className="px-2 text-center">
            <p className="text-4xl font-semibold tracking-tight text-zinc-950">
              {appliedCount}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Applied</p>
          </div>

          <div className="px-2 text-center last:pr-0">
            <p className="text-4xl font-semibold tracking-tight text-zinc-950">
              {interviewingCount}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Interviewing</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ErrorState({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Overview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          Dashboard
        </h1>
      </section>

      <section className="app-panel rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.16em] text-red-700 uppercase">
          Load error
        </p>
        <h2 className="mt-2 text-lg font-semibold text-red-950">{title}</h2>
        <p className="mt-2 text-sm text-red-800">{message}</p>
      </section>
    </main>
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
    return <ErrorState title="Failed to load jobs." message={jobsError.message} />
  }

  if (applicationsError) {
    return (
      <ErrorState
        title="Failed to load applications."
        message={applicationsError.message}
      />
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
        <ErrorState
          title="Failed to load job scores."
          message={scoresError.message}
        />
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

  const readyCount = typedApplications.filter(
    (app) => app.status === 'ready'
  ).length

  const appliedCount = typedApplications.filter(
    (app) => app.status === 'applied'
  ).length

  const interviewingCount = typedApplications.filter(
    (app) => app.status === 'interviewing'
  ).length

  const scoredCount = typedJobs.filter((job) =>
    latestScoresByJobId.has(job.id)
  ).length

  const recentJobs = typedJobs.slice(0, 5)
  const punchList = buildPunchList(typedApplications, latestScoresByJobId).slice(
    0,
    6
  )

  const jobsThisWeek = typedJobs.filter((job) => {
    if (!job.created_at) return false

    const created = new Date(job.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return created >= sevenDaysAgo
  }).length

  const topPunch = punchList[0] ?? null

  return (
    <main className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
            Overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Dashboard
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Snapshot of what needs attention next across applications,
            follow-ups, and recent pipeline activity.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Follow-ups due"
            value={dueNowCount}
            hint="Immediate follow-up work based on due timestamps."
            tone={dueNowCount > 0 ? 'red' : 'zinc'}
          />
          <SummaryCard
            label="Ready to apply"
            value={readyCount}
            hint="Applications that are currently actionable."
            tone={readyCount > 0 ? 'violet' : 'zinc'}
          />
          <SummaryCard
            label="Applications"
            value={typedApplications.length}
            hint="Total tracked application records."
            tone="blue"
          />
          <SummaryCard
            label="Jobs this week"
            value={jobsThisWeek}
            hint="New roles added in the last 7 days."
            tone="green"
          />
          <SummaryCard
            label="Immediate focus"
            value={topPunch ? topPunch.company : 'Clear'}
            hint={
              topPunch
                ? topPunch.reason
                : 'No urgent punch-list item right now.'
            }
            tone="zinc"
          />
        </div>
      </section>

      <PipelineOverviewCard
        jobsCount={typedJobs.length}
        scoredCount={scoredCount}
        readyCount={readyCount}
        appliedCount={appliedCount}
        interviewingCount={interviewingCount}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SectionCard
          title="Today's punch list"
          description="Highest-priority work surfaced from due follow-ups, ready applications, and follow-up timing windows."
          href="/today"
          hrefLabel="Open Today"
        >
          {punchList.length ? (
            <div className="space-y-4">
              {punchList.map((item, index) => (
                <PunchListCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
                Nothing urgent right now
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                No due follow-ups and no ready applications currently match the
                dashboard rules.
              </p>
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Recent jobs"
            description="Most recently added opportunities entering the pipeline."
            href="/jobs"
            hrefLabel="View jobs"
          >
            {recentJobs.length ? (
              <div className="space-y-3">
                {recentJobs.map((job, index) => (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-white uppercase">
                            #{index + 1}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusTone(
                              job.status
                            )}`}
                          >
                            {job.status ?? '—'}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold tracking-tight text-zinc-950">
                          {job.title}
                        </h3>
                        <p className="text-sm text-zinc-600">{job.company}</p>
                        <p className="text-sm text-zinc-500">
                          {job.location || 'No location'}
                        </p>
                      </div>

                      <Link href={`/jobs/${job.id}`} className="app-button">
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">No jobs yet.</p>
            )}
          </SectionCard>

          <SectionCard
            title="Profile"
            description="Manage candidate details, defaults, and resume-backed profile information used across applications."
            href="/profile"
            hrefLabel="Open profile"
          >
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
              <p className="text-sm leading-6 text-zinc-700">
                Profile is intentionally out of the main nav now. Keep the header
                focused on execution, and use the dashboard as the control center
                for setup and maintenance tasks.
              </p>
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}