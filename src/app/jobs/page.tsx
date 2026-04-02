export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/types'
import { formatDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { ScoreBadge } from '@/components/score-badge'
import { PageShell, PageHeader } from '@/components/ui/page-shell'
import {
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
} from '@/components/ui/section-card'
import { DispositionBadge } from '@/components/disposition-badge'

type JobRow = Pick<
  Database['public']['Tables']['jobs']['Row'],
  | 'id'
  | 'company'
  | 'title'
  | 'location'
  | 'status'
  | 'created_at'
  | 'archived_at'
  | 'url'
> & {
  applications?:
    | Array<{
        status: string | null
        disposition: string | null
        updated_at: string | null
        created_at: string | null
      }>
    | null
}

type JobScoreRow = Pick<
  Database['public']['Tables']['job_scores']['Row'],
  'job_id' | 'score' | 'created_at'
>

function getPrimaryApplication(job: JobRow) {
  const applications = job.applications ?? []
  if (!applications.length) return null

  const sorted = [...applications].sort((a, b) => {
    const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
    return bTime - aTime
  })

  return sorted[0] ?? null
}

function getPrimaryApplicationStatus(job: JobRow): string | null {
  return getPrimaryApplication(job)?.status ?? null
}

function getPrimaryApplicationDisposition(job: JobRow): string | null {
  return getPrimaryApplication(job)?.disposition ?? null
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium capitalize text-slate-900">
        {value}
      </p>
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
          <Button asChild variant="brand">
            <Link href="/jobs/new">Add Job</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/today">Open Today</Link>
          </Button>
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
        disposition,
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
    <PageShell className="space-y-8">
      <PageHeader
        title="Jobs"
        description="Track roles, scores, statuses, and next actions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active Jobs" value={activeJobs.length} />
        <Metric label="Scored" value={scoredCount} />
        <Metric label="Unscored" value={unscoredCount} />
        <Metric label="Strong Fit" value={strongFitCount} />
      </div>

      {activeJobs.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-4">
          {activeJobs.map((job) => {
            const latestScore = latestScoresByJobId.get(job.id) ?? null
            const displayStatus = getDisplayStatus(job)
            const displayStatusLabel = getDisplayStatusLabel(job)
            const hasApplicationStatus = Boolean(getPrimaryApplicationStatus(job))

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={displayStatus} />
                      <ScoreBadge score={latestScore} />
                      <DispositionBadge
                        disposition={getPrimaryApplicationDisposition(job)}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-500">
                        {job.company}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                        {job.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {job.location || 'No location'}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <InfoBlock
                        label="Score"
                        value={
                          latestScore !== null ? `${latestScore}/100` : 'Unscored'
                        }
                      />
                      <InfoBlock label="Status" value={displayStatusLabel} />
                      <InfoBlock
                        label="Disposition"
                        value={
                          getPrimaryApplicationDisposition(job)?.replaceAll(
                            '_',
                            ' '
                          ) ?? 'Open'
                        }
                      />
                      <InfoBlock label="Added" value={formatDate(job.created_at)} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">Job ID: {job.id}</p>
                      <p className="text-xs text-slate-500">
                        {hasApplicationStatus
                          ? 'Application record linked'
                          : 'No application record yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row flex-wrap gap-2 lg:flex-col">
                    <Button asChild variant="secondary">
                      <Link href={`/jobs/${job.id}`}>Job Detail</Link>
                    </Button>

                    {/* <Button asChild variant="secondary">
                      <Link href={`/jobs/${job.id}`}>Score</Link>
                    </Button> */}

                    {job.url ? (
                      <Button asChild variant="secondary">
                        <a href={job.url} target="_blank" rel="noreferrer">
                          Original Post
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {archivedJobs.length ? (
        <SectionCard>
          <SectionCardHeader
            title="Archived Jobs"
            description="Hidden from active pipeline but kept for reference."
          />

          <SectionCardBody>
            <div className="space-y-4">
              {archivedJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                          Archived
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium text-slate-500">
                          {job.company}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.location || 'No location'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-sm text-slate-500">
                        Added {formatDate(job.created_at)}
                      </div>

                      <Button asChild variant="secondary">
                        <Link href={`/jobs/${job.id}`}>View / Restore</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCardBody>
        </SectionCard>
      ) : null}
    </PageShell>
  )
}