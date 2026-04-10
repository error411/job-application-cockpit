'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import type { Database } from '@/lib/supabase/schema'
import { formatDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { ScoreBadge } from '@/components/score-badge'
import { EmptyState as SearchEmptyState } from '@/components/empty-state'
import {
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
} from '@/components/ui/section-card'
import { DispositionBadge } from '@/components/disposition-badge'

export type JobRow = Pick<
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

function isJobConsideredScored(
  job: JobRow,
  latestScoresByJobId: Record<string, number | null>
) {
  return (
    job.id in latestScoresByJobId ||
    job.status === 'scored' ||
    job.status === 'assets_generated' ||
    job.status === 'ready_to_apply'
  )
}

function getJobScoreDisplay(
  job: JobRow,
  latestScoresByJobId: Record<string, number | null>
) {
  const latestScore = latestScoresByJobId[job.id] ?? null

  if (latestScore !== null) {
    return {
      score: latestScore,
      label: `${latestScore}/100`,
    }
  }

  if (isJobConsideredScored(job, latestScoresByJobId)) {
    return {
      score: null,
      label: 'Scored',
    }
  }

  return {
    score: null,
    label: 'Unscored',
  }
}

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

function JobsEmptyState({ showOnboarding }: { showOnboarding: boolean }) {
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

          {showOnboarding ? (
            <Button asChild variant="secondary">
              <Link href="/onboarding">Start Onboarding</Link>
            </Button>
          ) : null}

          <Button asChild variant="secondary">
            <Link href="/today">Open Today</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SearchBar({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string
  onSearchChange: (value: string) => void
}) {
  return (
    <SectionCard>
      <SectionCardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="job-search"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
          >
            Search jobs
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="job-search"
              name="search"
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by job title or company"
              className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>
        </div>

        {searchTerm ? (
          <Button type="button" variant="secondary" onClick={() => onSearchChange('')}>
            Clear
          </Button>
        ) : null}
      </SectionCardBody>
    </SectionCard>
  )
}

export function JobsList({
  jobs,
  latestScoresByJobId,
}: {
  jobs: JobRow[]
  latestScoresByJobId: Record<string, number | null>
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase()

  const activeJobs = jobs.filter((job) => job.archived_at == null)
  const archivedJobs = jobs.filter((job) => job.archived_at != null)

  const matchesSearch = (job: JobRow) => {
    if (!normalizedSearchTerm) return true

    return [job.title, job.company].some((value) =>
      (value ?? '').toLowerCase().includes(normalizedSearchTerm)
    )
  }

  const filteredActiveJobs = activeJobs.filter(matchesSearch)
  const filteredArchivedJobs = archivedJobs.filter(matchesSearch)
  const hasSearchResults =
    filteredActiveJobs.length > 0 || filteredArchivedJobs.length > 0

  const scoredCount = filteredActiveJobs.filter((job) =>
    isJobConsideredScored(job, latestScoresByJobId)
  ).length
  const unscoredCount = filteredActiveJobs.length - scoredCount
  const strongFitCount = filteredActiveJobs.filter((job) => {
    const score = latestScoresByJobId[job.id] ?? null
    return score !== null && score >= 80
  }).length

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active Jobs" value={filteredActiveJobs.length} />
        <Metric label="Scored" value={scoredCount} />
        <Metric label="Unscored" value={unscoredCount} />
        <Metric label="Strong Fit" value={strongFitCount} />
      </div>

      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {activeJobs.length === 0 ? (
        <JobsEmptyState showOnboarding={jobs.length === 0} />
      ) : normalizedSearchTerm && !hasSearchResults ? (
        <SearchEmptyState
          title="Nothing found"
          description={`No jobs matched "${deferredSearchTerm.trim()}". Try a job title or company name.`}
        />
      ) : (
        <section className="space-y-4">
          {filteredActiveJobs.map((job) => {
            const scoreDisplay = getJobScoreDisplay(job, latestScoresByJobId)
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
                      {scoreDisplay.score !== null ? (
                        <ScoreBadge score={scoreDisplay.score} />
                      ) : scoreDisplay.label === 'Scored' ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
                          Scored
                        </span>
                      ) : (
                        <ScoreBadge score={null} />
                      )}
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
                        value={scoreDisplay.label}
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

      {filteredArchivedJobs.length ? (
        <SectionCard>
          <SectionCardHeader
            title="Archived Jobs"
            description="Hidden from active pipeline but kept for reference."
          />

          <SectionCardBody>
            <div className="space-y-4">
              {filteredArchivedJobs.map((job) => (
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
    </>
  )
}
