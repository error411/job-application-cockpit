export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/types'
import { formatDate } from '@/lib/dates'

type JobRow = Pick<
  Database['public']['Tables']['jobs']['Row'],
  'id' | 'company' | 'title' | 'location' | 'status' | 'created_at' | 'archived_at' | 'url'
> & {
  applications?:
    | Array<{
        status: string | null
        updated_at: string | null
        created_at: string | null
      }>
    | null
}

type JobScoreRow = Pick<
  Database['public']['Tables']['job_scores']['Row'],
  'job_id' | 'score' | 'created_at'
>

function getScoreLabel(score: number | null) {
  if (score === null) return 'Not scored'
  if (score >= 80) return 'Strong fit'
  if (score >= 60) return 'Possible fit'
  return 'Weak fit'
}

function getScoreTone(score: number | null) {
  if (score === null) return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  if (score >= 60) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
}

function getStatusTone(status: string | null | undefined) {
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
    case 'archived':
      return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200'
    default:
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
  }
}

function getPrimaryApplicationStatus(job: JobRow): string | null {
  const applications = job.applications ?? []
  if (!applications.length) return null

  const sorted = [...applications].sort((a, b) => {
    const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
    return bTime - aTime
  })

  return sorted[0]?.status ?? null
}

function getDisplayStatus(job: JobRow): string {
  return getPrimaryApplicationStatus(job) ?? job.status ?? 'unknown'
}

function getDisplayStatusLabel(job: JobRow): string {
  const applicationStatus = getPrimaryApplicationStatus(job)
  if (applicationStatus) return applicationStatus.replaceAll('_', ' ')

  switch (job.status) {
    case 'assets_generated':
      return 'assets generated'
    case 'ready_to_apply':
      return 'ready to apply'
    default:
      return (job.status ?? 'unknown').replaceAll('_', ' ')
  }
}

function JobsSummaryCard({
  label,
  value,
  hint,
  emphasize = false,
}: {
  label: string
  value: string | number
  hint: string
  emphasize?: boolean
}) {
  return (
    <div
      className={[
        'rounded-2xl border p-5 shadow-sm',
        emphasize
          ? 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100'
          : 'border-zinc-200 bg-white',
      ].join(' ')}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Jobs
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
          No active jobs
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Add your first opportunity to start the scoring, asset generation, and
          application pipeline.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs/new"
            className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Add Job
          </Link>
          <Link
            href="/today"
            className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Open Today
          </Link>
        </div>
      </div>
    </section>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Pipeline
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Jobs
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Source opportunities entering the pipeline, with latest score signal
            and quick access to downstream actions.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
          Load error
        </p>
        <h2 className="mt-2 text-lg font-semibold text-red-950">
          Failed to load jobs
        </h2>
        <p className="mt-2 text-sm text-red-800">{message}</p>
      </section>
    </main>
  )
}

export default async function JobsPage() {
  const supabase = createAdminClient()

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select(
      `
      id,
      company,
      title,
      location,
      url,
      status,
      created_at,
      archived_at,
      applications (
        status,
        updated_at,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false })

  if (jobsError) {
    return <ErrorState message={jobsError.message} />
  }

  const typedJobs: JobRow[] = jobs ?? []
  const activeJobs = typedJobs.filter((job) => job.archived_at == null)
  const archivedJobs = typedJobs.filter((job) => job.archived_at != null)

  const jobIds = activeJobs.map((job) => job.id)
  const latestScoresByJobId = new Map<string, number | null>()

  if (jobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      return <ErrorState message={scoresError.message} />
    }

    const typedScores: JobScoreRow[] = scores ?? []

    for (const scoreRow of typedScores) {
      if (!latestScoresByJobId.has(scoreRow.job_id)) {
        latestScoresByJobId.set(scoreRow.job_id, scoreRow.score)
      }
    }
  }

  const scoredCount = activeJobs.filter((job) =>
    latestScoresByJobId.has(job.id)
  ).length
  const unscoredCount = activeJobs.length - scoredCount
  const strongFitCount = activeJobs.filter((job) => {
    const score = latestScoresByJobId.get(job.id) ?? null
    return score !== null && score >= 80
  }).length

  return (
    <main className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Pipeline
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Jobs
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              Source opportunities entering the pipeline, with latest score
              signal and quick access to downstream actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/today"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Today
            </Link>
            <Link
              href="/jobs/new"
              className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Add Job
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <JobsSummaryCard
            label="Active jobs"
            value={activeJobs.length}
            hint="Current opportunities in the pipeline."
          />
          <JobsSummaryCard
            label="Scored"
            value={scoredCount}
            hint="Active jobs with at least one score result."
          />
          <JobsSummaryCard
            label="Unscored"
            value={unscoredCount}
            hint="Active jobs still waiting on score signal."
          />
          <JobsSummaryCard
            label="Strong fit"
            value={strongFitCount}
            hint="Active jobs with latest score 80 or higher."
            emphasize
          />
        </div>
      </section>

      {activeJobs.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-4">
          {activeJobs.map((job, index) => {
            const latestScore = latestScoresByJobId.get(job.id) ?? null
            const displayStatus = getDisplayStatus(job)
            const displayStatusLabel = getDisplayStatusLabel(job)
            const hasApplicationStatus = Boolean(getPrimaryApplicationStatus(job))

            return (
              <article
                key={job.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="border-b border-zinc-100 bg-gradient-to-r from-white via-zinc-50/60 to-white px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                          #{index + 1}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusTone(
                            displayStatus
                          )}`}
                        >
                          {displayStatusLabel}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getScoreTone(
                            latestScore
                          )}`}
                        >
                          {getScoreLabel(latestScore)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-500">
                          {job.company}
                        </p>
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                          {job.title}
                        </h2>
                        <p className="text-sm text-zinc-600">
                          {job.location || 'No location'}
                        </p>
                      </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-[260px]">
                      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-center">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                          Latest score
                        </p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">
                          {latestScore !== null ? `${latestScore}/100` : '—'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-center">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                          Added
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                          {formatDate(job.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5 sm:px-6">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                        Score signal
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-700">
                        {latestScore !== null
                          ? `Latest score is ${latestScore}/100, currently labeled as ${getScoreLabel(
                              latestScore
                            ).toLowerCase()}.`
                          : 'This job has not been scored yet.'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                        Pipeline state
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-zinc-900">
                        {displayStatusLabel}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {hasApplicationStatus
                          ? 'Driven by the linked application lifecycle.'
                          : 'No application yet. Showing job prep state.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                      >
                        Open Job
                      </Link>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                      >
                        Score
                      </Link>

                      {job.url ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                        >
                          Original Post
                        </a>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">Job ID: {job.id}</p>
                      <p className="text-xs text-zinc-500">
                        {hasApplicationStatus
                          ? 'Application record linked'
                          : 'No application record yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {archivedJobs.length ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              History
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Archived Jobs
            </h2>
            <p className="text-sm text-zinc-600">
              Archived opportunities are hidden from the active pipeline but kept
              for reference and restore.
            </p>
          </div>

          <div className="space-y-4">
            {archivedJobs.map((job) => (
              <article
                key={job.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm"
              >
                <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                          Archived
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-500">
                          {job.company}
                        </p>
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">
                          {job.title}
                        </h3>
                        <p className="text-sm text-zinc-600">
                          {job.location || 'No location'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-center">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                        Added
                      </p>
                      <p className="mt-2 text-sm font-semibold text-zinc-950">
                        {formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-zinc-500">Job ID: {job.id}</p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
                    >
                      View / Restore
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}