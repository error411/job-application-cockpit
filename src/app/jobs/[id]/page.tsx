import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type {
  ApplicationAssetRow,
  ApplicationRow,
  JobRow,
  JobScoreRow,
} from '@/lib/supabase/model-types'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}

type JobDetailRow = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'status' | 'description_raw'
>

type JobDetailApplicationRow = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'notes'
>

type JobDetailScoreRow = Pick<
  JobScoreRow,
  | 'id'
  | 'job_id'
  | 'score'
  | 'matched_skills'
  | 'missing_skills'
  | 'reasons'
  | 'created_at'
>

type JobDetailAssetRow = Pick<
  ApplicationAssetRow,
  | 'id'
  | 'job_id'
  | 'resume_markdown'
  | 'cover_letter_markdown'
  | 'recruiter_note'
  | 'created_at'
>

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export default async function JobDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { from } = await searchParams
  const supabase = await createClient()

  const backHref = from === 'apply' ? '/apply' : '/jobs'
  const backLabel = from === 'apply' ? '← Back to Apply Mode' : '← Back to Jobs'

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, company, title, location, status, description_raw')
    .eq('id', id)
    .single()

  if (jobError || !job) {
    return <main className="p-6">Job not found.</main>
  }

  const { data: scores } = await supabase
    .from('job_scores')
    .select(
      'id, job_id, score, matched_skills, missing_skills, reasons, created_at'
    )
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const { data: assets } = await supabase
    .from('application_assets')
    .select(
      'id, job_id, resume_markdown, cover_letter_markdown, recruiter_note, created_at'
    )
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const { data: application } = await supabase
    .from('applications')
    .select(
      'id, job_id, status, applied_at, follow_up_1_due, follow_up_2_due, notes'
    )
    .eq('job_id', id)
    .maybeSingle()

  const typedJob: JobDetailRow = job
  const latestScore: JobDetailScoreRow | undefined = scores?.[0]
  const latestAsset: JobDetailAssetRow | undefined = assets?.[0]
  const typedApplication: JobDetailApplicationRow | null = application

  const matchedSkills = toStringArray(latestScore?.matched_skills)
  const missingSkills = toStringArray(latestScore?.missing_skills)
  const reasons = toStringArray(latestScore?.reasons)

  return (
    <main className="max-w-5xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={backHref} className="underline">
          {backLabel}
        </Link>

        <form action={`/api/jobs/${typedJob.id}/delete-form`} method="post">
  <input
    type="hidden"
    name="from"
    value={from === 'apply' ? 'apply' : 'jobs'}
  />
  <button
    className="rounded border border-red-300 px-4 py-2 text-sm text-red-700"
    type="submit"
  >
    Delete Job
  </button>
</form>
      </div>

      <h1 className="text-2xl font-bold">{typedJob.title}</h1>
      <p className="mt-1">{typedJob.company}</p>
      <p className="text-sm opacity-70">{typedJob.location || 'No location'}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action="/api/score-form" method="post">
          <input type="hidden" name="jobId" value={typedJob.id} />
          <input
            type="hidden"
            name="from"
            value={from === 'apply' ? 'apply' : 'jobs'}
          />
          <button className="rounded border px-4 py-2" type="submit">
            Score This Job
          </button>
        </form>

        <form action="/api/generate-assets-form" method="post">
          <input type="hidden" name="jobId" value={typedJob.id} />
          <input
            type="hidden"
            name="from"
            value={from === 'apply' ? 'apply' : 'jobs'}
          />
          <button className="rounded border px-4 py-2" type="submit">
            Generate Draft Assets
          </button>
        </form>

        <form action="/api/applications-form" method="post">
          <input type="hidden" name="jobId" value={typedJob.id} />
          <input type="hidden" name="status" value="ready" />
          <input
            type="hidden"
            name="from"
            value={from === 'apply' ? 'apply' : 'jobs'}
          />
          <button className="rounded border px-4 py-2" type="submit">
            Mark Ready
          </button>
        </form>

        <form action="/api/applications-form" method="post">
          <input type="hidden" name="jobId" value={typedJob.id} />
          <input type="hidden" name="status" value="applied" />
          <input
            type="hidden"
            name="from"
            value={from === 'apply' ? 'apply' : 'jobs'}
          />
          <button className="rounded border px-4 py-2" type="submit">
            Mark Applied
          </button>
        </form>

        <form action="/api/applications-form" method="post">
          <input type="hidden" name="jobId" value={typedJob.id} />
          <input type="hidden" name="status" value="interviewing" />
          <input
            type="hidden"
            name="from"
            value={from === 'apply' ? 'apply' : 'jobs'}
          />
          <button className="rounded border px-4 py-2" type="submit">
            Mark Interviewing
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
  <a
    href={`/api/application-assets/${job.id}/resume-html`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
  >
    Preview Resume HTML
  </a>

  <a
    href={`/api/application-assets/${job.id}/resume-pdf`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
  >
    Download Resume PDF
  </a>
  <a
    href={`/api/application-assets/${job.id}/cover-letter-html`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
  >
    Preview Cover Letter HTML
  </a>

  <a
    href={`/api/application-assets/${job.id}/cover-letter-pdf`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
  >
    Download Cover Letter PDF
  </a>
</div>

      </div>

      <div className="mt-8 rounded border p-4">
        <h2 className="mb-3 text-xl font-semibold">Application Status</h2>
        {typedApplication ? (
          <div className="space-y-2">
            <p>Status: {typedApplication.status}</p>
            <p>Applied At: {typedApplication.applied_at || 'Not applied yet'}</p>
            <p>Follow-up 1 Due: {typedApplication.follow_up_1_due || '—'}</p>
            <p>Follow-up 2 Due: {typedApplication.follow_up_2_due || '—'}</p>
            <p>Notes: {typedApplication.notes || '—'}</p>
          </div>
        ) : (
          <p>No application record yet.</p>
        )}

        <form
          action="/api/applications-form"
          method="post"
          className="mt-4 space-y-3"
        >
          <input type="hidden" name="jobId" value={typedJob.id} />
          <input
            type="hidden"
            name="status"
            value={typedApplication?.status || 'ready'}
          />
          <input
            type="hidden"
            name="from"
            value={from === 'apply' ? 'apply' : 'jobs'}
          />

          <div>
            <label className="mb-2 block font-medium">Notes</label>
            <textarea
              name="notes"
              defaultValue={typedApplication?.notes || ''}
              className="min-h-[120px] w-full rounded border p-2"
              placeholder="Add notes about recruiter contact, application details, follow-up plan, etc."
            />
          </div>

          <button className="rounded border px-4 py-2" type="submit">
            Save Notes
          </button>
        </form>
      </div>

      {latestScore ? (
        <div className="mt-8 space-y-3 rounded border p-4">
          <h2 className="text-xl font-semibold">Latest Score</h2>
          <p className="text-lg">Score: {latestScore.score}/100</p>

          <div>
            <h3 className="font-medium">Matched Skills</h3>
            {matchedSkills.length ? (
              <ul className="ml-6 list-disc">
                {matchedSkills.map((skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-70">No matched skills listed.</p>
            )}
          </div>

          <div>
            <h3 className="font-medium">Missing Skills</h3>
            {missingSkills.length ? (
              <ul className="ml-6 list-disc">
                {missingSkills.map((skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-70">No missing skills listed.</p>
            )}
          </div>

          <div>
            <h3 className="font-medium">Reasons</h3>
            {reasons.length ? (
              <ul className="ml-6 list-disc">
                {reasons.map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-70">No reasons listed.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-8">No score yet.</p>
      )}

      {latestAsset ? (
        <div className="mt-8 space-y-6">
          <div className="rounded border p-4">
            <h2 className="mb-3 text-xl font-semibold">Latest Resume Draft</h2>
            <div className="whitespace-pre-wrap">
              {latestAsset.resume_markdown || 'No resume draft.'}
            </div>
          </div>

          <div className="rounded border p-4">
            <h2 className="mb-3 text-xl font-semibold">
              Latest Cover Letter Draft
            </h2>
            <div className="whitespace-pre-wrap">
              {latestAsset.cover_letter_markdown || 'No cover letter draft.'}
            </div>
          </div>

          <div className="rounded border p-4">
            <h2 className="mb-3 text-xl font-semibold">Recruiter Note</h2>
            <div className="whitespace-pre-wrap">
              {latestAsset.recruiter_note || 'No recruiter note.'}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-8">No draft assets yet.</p>
      )}

      <div className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">Raw Description</h2>
        <div className="whitespace-pre-wrap rounded border p-4">
          {typedJob.description_raw || 'No description available.'}
        </div>
      </div>
    </main>
  )
}