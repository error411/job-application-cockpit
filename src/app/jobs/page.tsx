export const dynamic = 'force-dynamic'
export const revalidate = 0

import { requireUser } from '@/lib/auth/require-user'
import { PageShell, PageHeader } from '@/components/ui/page-shell'
import { JobsList, type JobRow } from '@/app/jobs/jobs-list'
import type { Database } from '@/lib/supabase/types'

type JobScoreRow = Pick<
  Database['public']['Tables']['job_scores']['Row'],
  'job_id' | 'score' | 'created_at'
>

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
  const { supabase } = await requireUser()

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
  const activeJobIds = typedJobs
    .filter((job) => job.archived_at == null)
    .map((job) => job.id)

  const latestScoresByJobId: Record<string, number | null> = {}

  if (activeJobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', activeJobIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      return <ErrorState message={scoresError.message} />
    }

    const typedScores: JobScoreRow[] = scores ?? []

    for (const scoreRow of typedScores) {
      if (!(scoreRow.job_id in latestScoresByJobId)) {
        latestScoresByJobId[scoreRow.job_id] = scoreRow.score
      }
    }
  }

  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="Jobs"
        description="Track roles, scores, statuses, and next actions."
      />

      <JobsList jobs={typedJobs} latestScoresByJobId={latestScoresByJobId} />
    </PageShell>
  )
}
