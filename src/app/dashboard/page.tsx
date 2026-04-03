import Link from 'next/link'
import { requireUser } from '@/lib/auth/require-user'
import { formatDate } from '@/lib/dates'
import {
  getActiveWorkflowApplications,
  type ActiveWorkflowApplicationRow,
} from '@/lib/applications/get-active-workflow-applications'

type RecentJob = {
  id: string
  company: string
  title: string
  location: string | null
  status: string | null
  updated_at: string
  applications?:
    | Array<{
        status: string | null
        updated_at: string | null
        created_at: string | null
      }>
    | null
}

function startOfTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function endOfTodayLocal(): Date {
  const start = startOfTodayLocal()
  return new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    23,
    59,
    59,
    999
  )
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isDatePast(dateString: string | null | undefined): boolean {
  const date = parseDate(dateString)
  if (!date) return false

  return date < startOfTodayLocal()
}

function isDateToday(dateString: string | null | undefined): boolean {
  const date = parseDate(dateString)
  if (!date) return false

  const start = startOfTodayLocal()
  const end = endOfTodayLocal()

  return date >= start && date <= end
}

function getEarliestFollowUpDate(
  app: ActiveWorkflowApplicationRow
): string | null {
  return app.follow_up_1_due ?? app.follow_up_2_due ?? null
}

function isApplicationOverdue(app: ActiveWorkflowApplicationRow): boolean {
  return isDatePast(getEarliestFollowUpDate(app))
}

function isApplicationDueToday(app: ActiveWorkflowApplicationRow): boolean {
  return isDateToday(getEarliestFollowUpDate(app))
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
    case 'new':
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
    case 'scored':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
    case 'queued':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'assets_generated':
      return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
    case 'ready_to_apply':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    default:
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
  }
}

function getPrimaryApplicationStatusForJob(job: RecentJob): string | null {
  const applications = job.applications ?? []
  if (!applications.length) return null

  const sorted = [...applications].sort((a, b) => {
    const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
    return bTime - aTime
  })

  return sorted[0]?.status ?? null
}

function getDashboardJobStatus(job: RecentJob): string {
  return getPrimaryApplicationStatusForJob(job) ?? job.status ?? 'unknown'
}

function getDashboardJobStatusLabel(job: RecentJob): string {
  const applicationStatus = getPrimaryApplicationStatusForJob(job)
  if (applicationStatus) return applicationStatus

  switch (job.status) {
    case 'assets_generated':
      return 'assets generated'
    case 'ready_to_apply':
      return 'ready to apply'
    default:
      return job.status ?? 'unknown'
  }
}

function SummaryCard({
  label,
  value,
  hint,
  tone = 'zinc',
}: {
  label: string
  value: string | number
  hint: string
  tone?: 'red' | 'green' | 'blue' | 'violet' | 'zinc'
}) {
  const toneClasses =
    tone === 'red'
      ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white'
      : tone === 'green'
        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
        : tone === 'blue'
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
          : tone === 'violet'
            ? 'border-violet-200 bg-gradient-to-br from-violet-50 to-white'
            : 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100'

  return (
    <div className={`app-panel rounded-2xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{hint}</p>
    </div>
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

function PipelineOverview({
  readyCount,
  appliedCount,
  interviewingCount,
}: {
  readyCount: number
  appliedCount: number
  interviewingCount: number
}) {
  const total = readyCount + appliedCount + interviewingCount
  const safeTotal = Math.max(total, 1)

  const readyWidth = (readyCount / safeTotal) * 100
  const appliedWidth = (appliedCount / safeTotal) * 100
  const interviewingWidth = (interviewingCount / safeTotal) * 100

  return (
    <SectionCard
      title="Pipeline Overview"
      description={`${total} active applications across lifecycle stages.`}
      href="/jobs"
      hrefLabel="Open Jobs"
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-lg bg-zinc-200">
          <div className="flex h-4 w-full">
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

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-blue-500 px-1.5 text-xs font-semibold text-white">
                {readyCount}
              </span>
              <span className="text-sm font-medium text-zinc-700">Ready</span>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Jobs ready for application work.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-violet-500 px-1.5 text-xs font-semibold text-white">
                {appliedCount}
              </span>
              <span className="text-sm font-medium text-zinc-700">Applied</span>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Applications currently in post-submit follow-up mode.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-amber-500 px-1.5 text-xs font-semibold text-white">
                {interviewingCount}
              </span>
              <span className="text-sm font-medium text-zinc-700">
                Interviewing
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Active interview process items.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function UrgentAttention({
  overdueFollowUps,
  dueTodayFollowUps,
  readyToApply,
  snoozedCount,
}: {
  overdueFollowUps: number
  dueTodayFollowUps: number
  readyToApply: number
  snoozedCount: number
}) {
  return (
    <SectionCard
      title="Urgent Attention"
      description="Summary only. The action queue itself belongs on Today."
      href="/today"
      hrefLabel="Open Today"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-rose-700">
            Overdue
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            {overdueFollowUps}
          </p>
          <p className="mt-1 text-sm text-zinc-600">Follow-ups past due.</p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-orange-700">
            Due Today
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            {dueTodayFollowUps}
          </p>
          <p className="mt-1 text-sm text-zinc-600">Follow-ups due today.</p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-700">
            Ready to Apply
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            {readyToApply}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Ready-stage applications awaiting action.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            Snoozed
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            {snoozedCount}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Snoozing not currently surfaced in dashboard metrics.
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

function QuickLinks() {
  return (
    <SectionCard
      title="Quick Links"
      description="Use Dashboard to understand state, then jump into the right place."
    >
      <div className="grid gap-3">
        <Link
          href="/today"
          className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50"
        >
          <p className="font-medium text-zinc-950">Open Today</p>
          <p className="mt-1 text-sm text-zinc-600">
            Work the queue, handle follow-ups, and move applications forward.
          </p>
        </Link>

        <Link
          href="/jobs"
          className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50"
        >
          <p className="font-medium text-zinc-950">Browse Jobs</p>
          <p className="mt-1 text-sm text-zinc-600">
            Review all opportunities, search, filter, and edit records.
          </p>
        </Link>

        <Link
          href="/jobs/new"
          className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50"
        >
          <p className="font-medium text-zinc-950">Add Job</p>
          <p className="mt-1 text-sm text-zinc-600">
            Capture a new opportunity quickly.
          </p>
        </Link>
      </div>
    </SectionCard>
  )
}

function RecentActivity({ jobs }: { jobs: RecentJob[] }) {
  return (
    <SectionCard
      title="Recent Activity"
      description="Recently updated active jobs."
      href="/jobs"
      hrefLabel="View all jobs"
    >
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
          No recent activity yet.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 transition hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight text-zinc-950">
                  {job.company} · {job.title}
                </p>
                <p className="mt-1 truncate text-sm text-zinc-600">
                  {job.location ?? '—'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusTone(
                    getDashboardJobStatus(job)
                  )}`}
                >
                  {getDashboardJobStatusLabel(job)}
                </span>
                <span className="text-xs text-zinc-500">
                  Updated {formatDate(job.updated_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

export default async function DashboardPage() {
  const { supabase } = await requireUser()

  const [activeJobsResult, recentJobsResult, workflowApplications] =
    await Promise.all([
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .is('archived_at', null),
      supabase
        .from('jobs')
        .select(
          `
          id,
          company,
          title,
          location,
          status,
          updated_at,
          applications (
            status,
            updated_at,
            created_at
          )
        `
        )
        .is('archived_at', null)
        .order('updated_at', { ascending: false })
        .limit(6),
      getActiveWorkflowApplications(supabase),
    ])

  if (activeJobsResult.error) {
    throw new Error(activeJobsResult.error.message)
  }

  if (recentJobsResult.error) {
    throw new Error(recentJobsResult.error.message)
  }

  const activeJobsCount = activeJobsResult.count ?? 0
  const recentJobs = (recentJobsResult.data ?? []) as RecentJob[]

  const readyCount = workflowApplications.filter(
    (app) => app.status === 'ready'
  ).length

  const appliedCount = workflowApplications.filter(
    (app) => app.status === 'applied'
  ).length

  const interviewingCount = workflowApplications.filter(
    (app) => app.status === 'interviewing'
  ).length

  const overdueFollowUps = workflowApplications.filter(
    isApplicationOverdue
  ).length

  const dueTodayFollowUps = workflowApplications.filter(
    isApplicationDueToday
  ).length

  const snoozedCount = 0

  const readyToApplyCount = workflowApplications.filter(
    (app) => app.status === 'ready'
  ).length

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Overview of pipeline state
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Use Dashboard to understand what is going on, then jump into Today
            for execution or Jobs for record management.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/today" className="app-button-primary">
            Open Today
          </Link>
          <Link href="/jobs" className="app-button">
            View Jobs
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total Jobs"
          value={activeJobsCount}
          hint="Active, non-archived opportunities."
          tone="zinc"
        />
        <SummaryCard
          label="Ready"
          value={readyCount}
          hint="Applications ready for work."
          tone="blue"
        />
        <SummaryCard
          label="Applied"
          value={appliedCount}
          hint="Submitted and awaiting progression."
          tone="violet"
        />
        <SummaryCard
          label="Interviewing"
          value={interviewingCount}
          hint="In active interview process."
          tone="green"
        />
        <SummaryCard
          label="Overdue"
          value={overdueFollowUps}
          hint="Follow-ups that need attention."
          tone="red"
        />
      </section>

      <PipelineOverview
        readyCount={readyCount}
        appliedCount={appliedCount}
        interviewingCount={interviewingCount}
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <UrgentAttention
          overdueFollowUps={overdueFollowUps}
          dueTodayFollowUps={dueTodayFollowUps}
          readyToApply={readyToApplyCount}
          snoozedCount={snoozedCount}
        />

        <QuickLinks />
      </section>

      <RecentActivity jobs={recentJobs} />
    </div>
  )
}