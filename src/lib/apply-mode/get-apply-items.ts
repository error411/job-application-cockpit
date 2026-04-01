import {
  getActiveWorkflowApplications,
  type ActiveWorkflowApplicationRow,
} from '@/lib/applications/get-active-workflow-applications'
import type { ApplyItem } from './types'

type ApplicationAssetRow = {
  job_id: string
  resume_markdown: string | null
  cover_letter_markdown: string | null
  follow_up_1_email_markdown: string | null
  follow_up_2_email_markdown: string | null
  created_at: string
}

type JobScoreRow = {
  job_id: string
  score: number
  created_at: string
}

type ApplyItemsQueryBuilder = {
  select: (query: string) => {
    in: (
      column: string,
      values: readonly string[]
    ) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => Promise<{
        data: unknown[] | null
        error: { message: string } | null
      }>
    }
  }
}

type ApplyItemsSupabase = {
  from: (table: 'job_scores' | 'application_assets' | 'applications') => unknown
}

function getPriorityScore(row: ActiveWorkflowApplicationRow, latestScore: number | null) {
  const scoreBoost = latestScore ?? 0

  if (row.status === 'ready') {
    return 60 + scoreBoost
  }

  if (row.status === 'applied') {
    if (row.follow_up_1_due && !row.follow_up_1_sent_at) {
      return 85 + scoreBoost
    }

    if (row.follow_up_2_due && !row.follow_up_2_sent_at) {
      return 80 + scoreBoost
    }

    return 40 + scoreBoost
  }

  if (row.status === 'interviewing') {
    return 50 + scoreBoost
  }

  return 20 + scoreBoost
}

function getReason(row: ActiveWorkflowApplicationRow, latestScore: number | null) {
  if (row.status === 'ready') {
    return latestScore !== null
      ? `Ready to apply (${latestScore}/100)`
      : 'Ready to apply'
  }

  if (row.status === 'applied') {
    if (row.follow_up_1_due && !row.follow_up_1_sent_at) {
      return 'Applied, first follow-up scheduled'
    }

    if (row.follow_up_2_due && !row.follow_up_2_sent_at) {
      return 'Applied, second follow-up scheduled'
    }

    return 'Applied'
  }

  if (row.status === 'interviewing') {
    return 'Interview process active'
  }

  return row.status ?? 'unknown'
}

export async function getApplyItems(
  supabase: ApplyItemsSupabase
): Promise<ApplyItem[]> {
  const applicationRows = await getActiveWorkflowApplications(supabase)

  const jobIds = Array.from(new Set(applicationRows.map((row) => row.job_id)))

  const latestScoreByJobId = new Map<string, number | null>()
  const hasAssetsByJobId = new Map<string, boolean>()
  const followUp1ByJobId = new Map<string, string | null>()
  const followUp2ByJobId = new Map<string, string | null>()

  if (jobIds.length > 0) {
    const jobScoresQuery = supabase.from('job_scores') as ApplyItemsQueryBuilder
    const applicationAssetsQuery = supabase.from(
      'application_assets'
    ) as ApplyItemsQueryBuilder

    const [
      { data: scoreData, error: scoreError },
      { data: assetData, error: assetError },
    ] = await Promise.all([
      jobScoresQuery
        .select('job_id, score, created_at')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false }),

      applicationAssetsQuery
        .select(`
          job_id,
          resume_markdown,
          cover_letter_markdown,
          follow_up_1_email_markdown,
          follow_up_2_email_markdown,
          created_at
        `)
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
        hasAssetsByJobId.set(
          row.job_id,
          Boolean(
            row.resume_markdown?.trim() && row.cover_letter_markdown?.trim()
          )
        )
      }

      if (!followUp1ByJobId.has(row.job_id)) {
        followUp1ByJobId.set(row.job_id, row.follow_up_1_email_markdown ?? null)
      }

      if (!followUp2ByJobId.has(row.job_id)) {
        followUp2ByJobId.set(row.job_id, row.follow_up_2_email_markdown ?? null)
      }
    }
  }

  const items: ApplyItem[] = applicationRows
    .map((row) => {
      const latestScore = latestScoreByJobId.get(row.job_id) ?? null
      const hasAssets = hasAssetsByJobId.get(row.job_id) ?? false

      return {
        id: row.id,
        jobId: row.job_id,
        status: row.status,
        company: row.job?.company ?? 'Unknown company',
        title: row.job?.title ?? 'Untitled role',
        location: row.job?.location ?? '—',
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
        priorityScore: getPriorityScore(row, latestScore),
        reason: getReason(row, latestScore),
      }
    })
    .filter((item) => item.status !== null)

  items.sort((a, b) => b.priorityScore - a.priorityScore)

  return items
}