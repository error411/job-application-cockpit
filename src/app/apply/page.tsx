export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ApplyModeClient from './apply-mode-client'
import ProcessAutomationButton from './process-automation-button'
import {
  ACTIVE_APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationStatus,
} from '@/lib/statuses'
import type { Tables } from '@/lib/supabase/types'

import type { ApplyItem } from '@/lib/apply-mode/types'

type ApplicationRow = Pick<
  Tables<'applications'>,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
  | 'notes'
> & {
  jobs:
    | {
        id: string
        company: string
        title: string
        location: string | null
        archived_at: string | null
      }
    | {
        id: string
        company: string
        title: string
        location: string | null
        archived_at: string | null
      }[]
    | null
}

type JobScoreRow = Pick<Tables<'job_scores'>, 'job_id' | 'score' | 'created_at'>

type ApplicationAssetRow = Pick<
  Tables<'application_assets'>,
  | 'job_id'
  | 'resume_markdown'
  | 'cover_letter_markdown'
  | 'follow_up_1_email_markdown'
  | 'follow_up_2_email_markdown'
  | 'created_at'
>

function normalizeApplicationStatus(value: string | null): ApplicationStatus {
  if (value && isApplicationStatus(value)) {
    return value
  }

  return 'ready'
}

export default async function ApplyPage() {
  const supabase = await createClient()

  const { data: applicationData, error: applicationError } = await supabase
    .from('applications')
    .select(
      `
      id,
      job_id,
      status,
      applied_at,
      follow_up_1_due,
      follow_up_2_due,
      follow_up_1_sent_at,
      follow_up_2_sent_at,
      notes,
      jobs (
        id,
        company,
        title,
        location,
        archived_at
      )
    `
    )
    .in('status', ACTIVE_APPLICATION_STATUSES)

  if (applicationError) {
    console.error('Error loading apply page:', applicationError)
  }

  const applicationRows: ApplicationRow[] = (applicationData ?? [])
    .map((row) => ({
      id: row.id,
      job_id: row.job_id,
      status: row.status,
      applied_at: row.applied_at,
      follow_up_1_due: row.follow_up_1_due,
      follow_up_2_due: row.follow_up_2_due,
      follow_up_1_sent_at: row.follow_up_1_sent_at,
      follow_up_2_sent_at: row.follow_up_2_sent_at,
      notes: row.notes,
      jobs: row.jobs,
    }))
    .filter((row) => {
      const job = Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs
      return job?.archived_at == null
    })

  const jobIds = Array.from(new Set(applicationRows.map((row) => row.job_id)))

  const latestScoreByJobId = new Map<string, number>()
  const hasAssetsByJobId = new Map<string, boolean>()
  const followUp1ByJobId = new Map<string, string | null>()
  const followUp2ByJobId = new Map<string, string | null>()

  if (jobIds.length > 0) {
    const [
      { data: scoreData, error: scoreError },
      { data: assetData, error: assetError },
    ] = await Promise.all([
      supabase
        .from('job_scores')
        .select('job_id, score, created_at')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false }),

      supabase
        .from('application_assets')
        .select(
          `
          job_id,
          resume_markdown,
          cover_letter_markdown,
          follow_up_1_email_markdown,
          follow_up_2_email_markdown,
          created_at
        `
        )
        .in('job_id', jobIds)
        .order('created_at', { ascending: false }),
    ])

    if (scoreError) {
      console.error('Error loading job scores for apply page:', scoreError)
    } else {
      const scoreRows: JobScoreRow[] = (scoreData ?? []).map((row) => ({
        job_id: row.job_id,
        score: row.score,
        created_at: row.created_at,
      }))

      for (const row of scoreRows) {
        if (!latestScoreByJobId.has(row.job_id)) {
          latestScoreByJobId.set(row.job_id, row.score)
        }
      }
    }

    if (assetError) {
      console.error('Error loading application assets for apply page:', assetError)
    } else {
      const assetRows: ApplicationAssetRow[] = (assetData ?? []).map((row) => ({
        job_id: row.job_id,
        resume_markdown: row.resume_markdown,
        cover_letter_markdown: row.cover_letter_markdown,
        follow_up_1_email_markdown: row.follow_up_1_email_markdown,
        follow_up_2_email_markdown: row.follow_up_2_email_markdown,
        created_at: row.created_at,
      }))

      for (const row of assetRows) {
        if (!hasAssetsByJobId.has(row.job_id)) {
          const hasAssets = Boolean(
            row.resume_markdown?.trim() && row.cover_letter_markdown?.trim()
          )
          hasAssetsByJobId.set(row.job_id, hasAssets)
        }

        if (!followUp1ByJobId.has(row.job_id)) {
          followUp1ByJobId.set(row.job_id, row.follow_up_1_email_markdown ?? null)
        }

        if (!followUp2ByJobId.has(row.job_id)) {
          followUp2ByJobId.set(row.job_id, row.follow_up_2_email_markdown ?? null)
        }
      }
    }
  }

  const items: ApplyItem[] = applicationRows
    .map((row) => {
      const job = Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs
      const latestScore = latestScoreByJobId.get(row.job_id) ?? null
      const hasAssets = hasAssetsByJobId.get(row.job_id) ?? false
      const status = normalizeApplicationStatus(row.status)

      return {
        id: row.id,
        jobId: row.job_id,
        status,
        company: job?.company ?? 'Unknown company',
        title: job?.title ?? 'Untitled role',
        location: job?.location ?? '—',
        notes: row.notes ?? null,
        appliedAt: row.applied_at ?? null,
        followUp1Due: row.follow_up_1_due ?? null,
        followUp2Due: row.follow_up_2_due ?? null,
        followUp1SentAt: row.follow_up_1_sent_at ?? null,
        followUp2SentAt: row.follow_up_2_sent_at ?? null,
        followUp1EmailMarkdown: followUp1ByJobId.get(row.job_id) ?? null,
        followUp2EmailMarkdown: followUp2ByJobId.get(row.job_id) ?? null,
        hasAssets,
        latestScore,
        priorityScore: latestScore ?? 0,
        reason:
          latestScore !== null
            ? `Prioritized by latest score: ${latestScore}/100`
            : 'Ready to work, but not yet scored',
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Execution
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1>Apply Hub</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600">
              Prioritized execution queue combining score, asset readiness,
              application state, and follow-up urgency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ProcessAutomationButton />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Items in queue</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
            {items.length}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Active applications prioritized for action.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Sorted by score</p>
          <p className="mt-3 text-lg font-semibold text-zinc-950">
            Highest first
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Uses latest job scoring output.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600">Execution mode</p>
          <p className="mt-3 text-lg font-semibold text-zinc-950">
            Guided workflow
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Focused step-by-step interaction per item.
          </p>
        </div>
      </section>

      <section className="app-panel p-0">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Execution Queue
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Work through applications in priority order. Each item includes assets,
            status, and next actions.
          </p>
        </div>

        <div className="p-5">
          <ApplyModeClient items={items} />
        </div>
      </section>
    </div>
  )
}