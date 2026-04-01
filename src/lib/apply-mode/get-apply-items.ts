import type { ApplyItem } from './types'
import { getFollowUpState } from '@/lib/applications/get-follow-up-state'
import {
  getActiveWorkflowApplications,
  type ActiveWorkflowApplicationRow,
} from '@/lib/applications/get-active-workflow-applications'

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

function getPriorityScore(params: {
  application: ActiveWorkflowApplicationRow
  latestScore: number | null
  hasAssets: boolean
}) {
  const { application, latestScore, hasAssets } = params
  const status = application.status
  const scoreBoost = latestScore ?? 0

  const followUpState = getFollowUpState({
    follow_up_1_due: application.follow_up_1_due,
    follow_up_2_due: application.follow_up_2_due,
    follow_up_1_sent_at: application.follow_up_1_sent_at,
    follow_up_2_sent_at: application.follow_up_2_sent_at,
  })

  if (followUpState.stage1?.isDueNow) {
    return followUpState.stage1.isOverdue ? 100 + scoreBoost : 85 + scoreBoost
  }

  if (followUpState.stage2?.isDueNow) {
    return followUpState.stage2.isOverdue ? 95 + scoreBoost : 80 + scoreBoost
  }

  if (status === 'ready' && hasAssets) {
    return 70 + scoreBoost
  }

  if (status === 'ready' && !hasAssets) {
    return 60 + scoreBoost
  }

  if (status === 'interviewing') {
    return 55 + scoreBoost
  }

  if (status === 'applied') {
    return 45 + scoreBoost
  }

  return scoreBoost
}

function getReason(params: {
  application: ActiveWorkflowApplicationRow
  latestScore: number | null
  hasAssets: boolean
}) {
  const { application, latestScore, hasAssets } = params
  const status = application.status

  const followUpState = getFollowUpState({
    follow_up_1_due: application.follow_up_1_due,
    follow_up_2_due: application.follow_up_2_due,
    follow_up_1_sent_at: application.follow_up_1_sent_at,
    follow_up_2_sent_at: application.follow_up_2_sent_at,
  })

  if (followUpState.stage1?.isDueNow) {
    return followUpState.stage1.isOverdue
      ? 'Follow-up 1 overdue'
      : 'Follow-up 1 due today'
  }

  if (followUpState.stage2?.isDueNow) {
    return followUpState.stage2.isOverdue
      ? 'Follow-up 2 overdue'
      : 'Follow-up 2 due today'
  }

  if (status === 'ready' && latestScore !== null && hasAssets) {
    return `Ready to apply (${latestScore}/100, assets complete)`
  }

  if (status === 'ready' && latestScore !== null && !hasAssets) {
    return `High-value target (${latestScore}/100) missing assets`
  }

  if (status === 'ready' && hasAssets) {
    return 'Assets ready, application ready'
  }

  if (status === 'ready') {
    return 'Ready for next action'
  }

  if (status === 'interviewing') {
    return 'Interview process active'
  }

  if (status === 'applied' && followUpState.hasUpcoming) {
    return 'Applied, next follow-up scheduled'
  }

  if (status === 'applied') {
    return 'Applied, waiting for follow-up window'
  }

  return 'Ready to work'
}

export async function getApplyItems(
  supabase: ApplyItemsSupabase
): Promise<ApplyItem[]> {
  const applicationRows = await getActiveWorkflowApplications(supabase)

  const jobIds = Array.from(new Set(applicationRows.map((row) => row.job_id)))

  const latestScoreByJobId = new Map<string, number>()
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

  const items: ApplyItem[] = applicationRows.map((row) => {
    const latestScore = latestScoreByJobId.get(row.job_id) ?? null
    const hasAssets = hasAssetsByJobId.get(row.job_id) ?? false
    const priorityScore = getPriorityScore({
      application: row,
      latestScore,
      hasAssets,
    })

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
      priorityScore,
      reason: getReason({
        application: row,
        latestScore,
        hasAssets,
      }),
    }
  })

  items.sort((a, b) => b.priorityScore - a.priorityScore)

  return items
}