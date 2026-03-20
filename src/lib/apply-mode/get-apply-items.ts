import { createClient } from '@/lib/supabase/server'
import type { ApplyItem } from './types'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

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

export async function getApplyItems(
  supabase: SupabaseClient
): Promise<ApplyItem[]> {
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
    .in('status', ['ready', 'applied', 'interviewing'])

  if (applicationError) {
    throw new Error(applicationError.message)
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
      throw new Error(scoreError.message)
    }

    if (assetError) {
      throw new Error(assetError.message)
    }

    const scoreRows = (scoreData ?? []) as JobScoreRow[]
    const assetRows = (assetData ?? []) as ApplicationAssetRow[]

    for (const row of scoreRows) {
      if (!latestScoreByJobId.has(row.job_id)) {
        latestScoreByJobId.set(row.job_id, row.score)
      }
    }

    for (const row of assetRows) {
      if (!hasAssetsByJobId.has(row.job_id)) {
        const hasAssets = Boolean(
          row.resume_markdown?.trim() && row.cover_letter_markdown?.trim()
        )
        hasAssetsByJobId.set(row.job_id, hasAssets)
      }
    }
  }

  const now = Date.now()

  const items: ApplyItem[] = applicationRows.map((row) => {
    const job = Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs
    const latestScore = latestScoreByJobId.get(row.job_id) ?? null
    const hasAssets = hasAssetsByJobId.get(row.job_id) ?? false

    let priority = latestScore ?? 0

    if (!hasAssets) {
      priority += 10
    }

    if ((row.status ?? 'ready') === 'ready') {
      priority += 5
    }

    if ((row.status ?? '') === 'interviewing') {
      priority += 15
    }

    let followUpOverdue = false

    if (row.follow_up_1_due) {
      const diff = new Date(row.follow_up_1_due).getTime() - now
      if (diff < 0) {
        priority += 25
        followUpOverdue = true
      }
    }

    if (row.follow_up_2_due) {
      const diff = new Date(row.follow_up_2_due).getTime() - now
      if (diff < 0) {
        priority += 25
        followUpOverdue = true
      }
    }

    let reason = 'Ready to work'

    if (followUpOverdue) {
      reason = 'Follow-up overdue'
    } else if (latestScore !== null && !hasAssets) {
      reason = `High-value target (${latestScore}/100) missing assets`
    } else if (latestScore !== null && hasAssets) {
      reason = `Ready to apply (${latestScore}/100, assets complete)`
    } else if (hasAssets) {
      reason = 'Assets ready, but not yet scored'
    } else if ((row.status ?? '') === 'interviewing') {
      reason = 'Interview process active'
    } else if ((row.status ?? 'ready') === 'ready') {
      reason = 'Ready for next action'
    }

    return {
      id: row.id,
      jobId: row.job_id,
      status: row.status ?? 'ready',
      company: job?.company ?? 'Unknown company',
      title: job?.title ?? 'Untitled role',
      location: job?.location ?? '—',
      notes: row.notes ?? null,
      appliedAt: row.applied_at ?? null,
      followUp1Due: row.follow_up_1_due ?? null,
      followUp2Due: row.follow_up_2_due ?? null,
      hasAssets,
      latestScore,
      priorityScore: priority,
      reason,
    }
  })

  items.sort((a, b) => b.priorityScore - a.priorityScore)

  return items
}