import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type JobRow = Pick<
  Database['public']['Tables']['jobs']['Row'],
  'id' | 'company' | 'title' | 'location' | 'status' | 'created_at'
>

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

export default async function JobsPage() {
  const supabase = await createClient()

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id, company, title, location, status, created_at')
    .order('created_at', { ascending: false })

  if (jobsError) {
    return <main className="p-6">Error loading jobs: {jobsError.message}</main>
  }

  const typedJobs: JobRow[] = jobs ?? []
  const jobIds = typedJobs.map((job) => job.id)

  const latestScoresByJobId = new Map<string, number>()

  if (jobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (!scoresError && scores) {
      const typedScores: JobScoreRow[] = scores

      for (const scoreRow of typedScores) {
        if (!latestScoresByJobId.has(scoreRow.job_id)) {
          latestScoresByJobId.set(scoreRow.job_id, scoreRow.score)
        }
      }
    }
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>

        <div className="flex gap-3">
          <Link href="/applications" className="border rounded px-4 py-2">
            Applications
          </Link>
          <Link href="/jobs/new" className="border rounded px-4 py-2">
            Add Job
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {typedJobs.length ? (
          typedJobs.map((job) => {
            const latestScore = latestScoresByJobId.get(job.id) ?? null

            return (
              <div key={job.id} className="border rounded p-4">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p>{job.company}</p>
                <p className="text-sm opacity-70">
                  {job.location || 'No location'}
                </p>
                <p className="text-sm mt-2">Status: {job.status}</p>

                <div className="mt-3 text-sm">
                  <p>
                    <span className="font-medium">Latest Score:</span>{' '}
                    {latestScore !== null ? `${latestScore}/100` : 'Not scored'}
                  </p>
                  <p
                    className={
                      latestScore === null
                        ? 'opacity-70'
                        : latestScore >= 80
                        ? 'font-medium'
                        : latestScore >= 60
                        ? 'opacity-90'
                        : 'opacity-60'
                    }
                  >
                    {getScoreLabel(latestScore)}
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="border rounded px-3 py-2"
                  >
                    View
                  </Link>

                  <form action="/api/score-form" method="post">
                    <input type="hidden" name="jobId" value={job.id} />
                    <button
                      type="submit"
                      className="border rounded px-3 py-2"
                    >
                      Score
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        ) : (
          <p>No jobs yet.</p>
        )}
      </div>
    </main>
  )
}