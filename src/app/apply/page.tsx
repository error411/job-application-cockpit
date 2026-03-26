export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ApplyModeClient from './apply-mode-client'
import ProcessAutomationButton from './process-automation-button'
import {
  ACTIVE_APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationStatus,
} from '@/lib/statuses'

type ApplyItem = {
  id: string
  jobId: string
  status: ApplicationStatus
  company: string
  title: string
  location: string
  notes: string | null
  appliedAt: string | null
  followUp1Due: string | null
  followUp2Due: string | null
  hasAssets: boolean
  latestScore: number | null
  priorityScore: number
  reason: string
}

type ApplicationRow = {
  id: string
  job_id: string
  status: string | null
  applied_at: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  notes: string | null
  jobs:
    | {
        id: string
        company: string
        title: string
        location: string | null
      }
    | {
        id: string
        company: string
        title: string
        location: string | null
      }[]
    | null
}

type JobScoreRow = {
  job_id: string
  score: number
  created_at: string
}

type ApplicationAssetRow = {
  job_id: string
  resume_markdown: string | null
  cover_letter_markdown: string | null
  created_at: string
}

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
    .select(`
      id,
      job_id,
      status,
      applied_at,
      follow_up_1_due,
      follow_up_2_due,
      notes,
      jobs (
        id,
        company,
        title,
        location
      )
    `)
    .in('status', ACTIVE_APPLICATION_STATUSES)

  if (applicationError) {
    console.error('Error loading apply page:', applicationError)
  }

  const applicationRows = (applicationData ?? []) as ApplicationRow[]
  const jobIds = Array.from(new Set(applicationRows.map((row) => row.job_id)))

  const latestScoreByJobId = new Map<string, number>()
  const hasAssetsByJobId = new Map<string, boolean>()

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
        .select('job_id, resume_markdown, cover_letter_markdown, created_at')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false }),
    ])

    if (scoreError) {
      console.error('Error loading job scores for apply page:', scoreError)
    } else {
      const scoreRows = (scoreData ?? []) as JobScoreRow[]

      for (const row of scoreRows) {
        if (!latestScoreByJobId.has(row.job_id)) {
          latestScoreByJobId.set(row.job_id, row.score)
        }
      }
    }

    if (assetError) {
      console.error('Error loading application assets for apply page:', assetError)
    } else {
      const assetRows = (assetData ?? []) as ApplicationAssetRow[]

      for (const row of assetRows) {
        if (!hasAssetsByJobId.has(row.job_id)) {
          const hasAssets = Boolean(
            row.resume_markdown?.trim() && row.cover_letter_markdown?.trim()
          )
          hasAssetsByJobId.set(row.job_id, hasAssets)
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
    <div className="space-y-6">
      <ProcessAutomationButton />
      <ApplyModeClient items={items} />
    </div>
  )
}