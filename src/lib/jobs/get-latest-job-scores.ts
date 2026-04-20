import { createAdminClient } from '@/lib/supabase/admin'
import type { Tables } from '@/lib/supabase/schema'

type JobScoreLookupRow = Pick<Tables<'job_scores'>, 'job_id' | 'score' | 'created_at'>

export async function getLatestJobScoresByJobId(
  jobIds: string[]
): Promise<Map<string, number>> {
  const uniqueJobIds = [...new Set(jobIds.filter(Boolean))]
  const latestScoresByJobId = new Map<string, number>()

  if (uniqueJobIds.length === 0) {
    return latestScoresByJobId
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('job_scores')
    .select('job_id, score, created_at')
    .in('job_id', uniqueJobIds)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  for (const row of (data ?? []) as JobScoreLookupRow[]) {
    if (!latestScoresByJobId.has(row.job_id)) {
      latestScoresByJobId.set(row.job_id, row.score)
    }
  }

  return latestScoresByJobId
}
