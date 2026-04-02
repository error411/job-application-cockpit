export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  ApplicationAssetRow,
  ApplicationRow,
  JobRow,
  JobScoreRow,
} from '@/lib/supabase/model-types'
import { formatDate } from '@/lib/dates'
import JobFollowUpActions from './job-follow-up-actions'
import GenerateDraftAssetsButton from './generate-draft-assets-button'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; error?: string }>
}

type JobDetailRow = Pick<
  JobRow,
  | 'id'
  | 'company'
  | 'title'
  | 'location'
  | 'url'
  | 'status'
  | 'description_raw'
  | 'archived_at'
  | 'archived_reason'
>

type JobDetailApplicationRow = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
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
  | 'follow_up_1_email_markdown'
  | 'follow_up_2_email_markdown'
  | 'created_at'
>

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function getStatusTone(status: string | null | undefined) {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-700'
    case 'interviewing':
      return 'bg-violet-100 text-violet-700'
    case 'ready':
      return 'bg-emerald-100 text-emerald-700'
    case 'rejected':
      return 'bg-rose-100 text-rose-700'
    case 'offer':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-zinc-100 text-zinc-700'
  }
}

function SectionCard({
  title,
  eyebrow,
  children,
  actions,
}: {
  title: string
  eyebrow?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

export default async function JobDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { from, error } = await searchParams
  const supabase = createAdminClient()

  const backHref = from === 'apply' ? '/apply' : '/jobs'
  const backLabel = from === 'apply' ? '← Back to Apply Mode' : '← Back to Jobs'

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(
      'id, company, title, location, url, status, description_raw, archived_at, archived_reason'
    )
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
      `
      id,
      job_id,
      resume_markdown,
      cover_letter_markdown,
      recruiter_note,
      follow_up_1_email_markdown,
      follow_up_2_email_markdown,
      created_at
    `
    )
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const { data: application } = await supabase
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
      notes
    `
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
    <main className="max-w-6xl p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm font-medium text-zinc-600 underline">
            {backLabel}
          </Link>

          <div className="flex flex-wrap gap-2">
            {typedJob.archived_at ? (
              <>
                <form action={`/api/jobs/${typedJob.id}/restore-form`} method="post">
                  <button className="app-button-primary" type="submit">
                    Restore Job
                  </button>
                </form>

                <form action={`/api/jobs/${typedJob.id}/delete-form`} method="post">
                  <input
                    type="hidden"
                    name="from"
                    value={from === 'apply' ? 'apply' : 'jobs'}
                  />
                  <button
                    className="rounded-md border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700"
                    type="submit"
                  >
                    Delete Permanently
                  </button>
                </form>
              </>
            ) : (
              <>
                <form action={`/api/jobs/${typedJob.id}/archive-form`} method="post">
                  <input
                    type="hidden"
                    name="from"
                    value={from === 'apply' ? 'apply' : 'jobs'}
                  />
                  <button className="app-button" type="submit">
                    Archive Job
                  </button>
                </form>

                <form action={`/api/jobs/${typedJob.id}/delete-form`} method="post">
                  <input
                    type="hidden"
                    name="from"
                    value={from === 'apply' ? 'apply' : 'jobs'}
                  />
                  <button
                    className="rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600"
                    type="submit"
                  >
                    Delete Permanently
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-800">{error}</p>
          </div>
        ) : null}

        <section className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                    typedApplication?.status ?? typedJob.status
                  )}`}
                >
                  {(typedApplication?.status ?? typedJob.status ?? 'unknown')
                    .replaceAll('_', ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>

                {typedJob.archived_at ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Archived
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                {typedJob.title}
              </h1>
              <p className="mt-2 text-base font-medium text-zinc-700">
                {typedJob.company}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {typedJob.location || 'No location'}
              </p>

              {typedJob.archived_at ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Archived
                  </p>
                  <p className="mt-2 text-sm text-amber-900">
                    This job was archived on {formatDate(typedJob.archived_at)}.
                  </p>
                  {typedJob.archived_reason ? (
                    <p className="mt-1 text-sm text-amber-800">
                      Reason: {typedJob.archived_reason}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid min-w-[260px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-zinc-500">Applied</p>
                <p className="mt-2 text-base font-semibold text-zinc-950">
                  {typedApplication?.applied_at
                    ? formatDate(typedApplication.applied_at)
                    : 'Not applied yet'}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-zinc-500">Latest score</p>
                <p className="mt-2 text-base font-semibold text-zinc-950">
                  {latestScore ? `${latestScore.score}/100` : 'Not scored'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <GenerateDraftAssetsButton jobId={typedJob.id} />

              <form action="/api/score-form" method="post">
                <input type="hidden" name="jobId" value={typedJob.id} />
                <input
                  type="hidden"
                  name="from"
                  value={from === 'apply' ? 'apply' : 'jobs'}
                />
                <button className="app-button" type="submit">
                  Score This Job
                </button>
              </form>

              {typedJob.url ? (
                <a
                  href={typedJob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="app-button"
                >
                  View Original Job Post
                </a>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <form action="/api/applications-form" method="post">
                <input type="hidden" name="jobId" value={typedJob.id} />
                <input type="hidden" name="status" value="ready" />
                <input
                  type="hidden"
                  name="from"
                  value={from === 'apply' ? 'apply' : 'jobs'}
                />
                <button
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  type="submit"
                >
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
                <button
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  type="submit"
                >
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
                <button
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  type="submit"
                >
                  Mark Interviewing
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard title="Application" eyebrow="Workflow">
              {typedApplication ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-medium text-zinc-500">Status</p>
                    <p className="mt-2 text-base font-semibold text-zinc-950">
                      {typedApplication.status ?? '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-medium text-zinc-500">Applied At</p>
                    <p className="mt-2 text-base font-semibold text-zinc-950">
                      {typedApplication.applied_at
                        ? formatDateTime(typedApplication.applied_at)
                        : 'Not applied yet'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-medium text-zinc-500">Follow-Up 1 Due</p>
                    <p className="mt-2 text-base font-semibold text-zinc-950">
                      {typedApplication.follow_up_1_due
                        ? formatDateTime(typedApplication.follow_up_1_due)
                        : '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-medium text-zinc-500">Follow-Up 2 Due</p>
                    <p className="mt-2 text-base font-semibold text-zinc-950">
                      {typedApplication.follow_up_2_due
                        ? formatDateTime(typedApplication.follow_up_2_due)
                        : '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">No application record yet.</p>
              )}

              <form
                action="/api/applications-form"
                method="post"
                className="mt-5 space-y-3"
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
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={typedApplication?.notes || ''}
                    className="min-h-[140px] w-full rounded-xl border border-zinc-300 p-3 text-sm"
                    placeholder="Add notes about recruiter contact, application details, follow-up plan, etc."
                  />
                </div>

                <button className="app-button" type="submit">
                  Save Notes
                </button>
              </form>
            </SectionCard>

            {latestScore ? (
              <SectionCard title="Latest Score" eyebrow="Fit">
                <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-zinc-800">
                    Show score breakdown ({latestScore.score}/100)
                  </summary>

                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">Score</p>
                      <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">
                        {latestScore.score}/100
                      </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <h3 className="font-medium text-zinc-950">Matched Skills</h3>
                        {matchedSkills.length ? (
                          <ul className="mt-3 ml-5 list-disc space-y-1 text-sm text-zinc-700">
                            {matchedSkills.map((skill: string, index: number) => (
                              <li key={index}>{skill}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-zinc-500">
                            No matched skills listed.
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <h3 className="font-medium text-zinc-950">Missing Skills</h3>
                        {missingSkills.length ? (
                          <ul className="mt-3 ml-5 list-disc space-y-1 text-sm text-zinc-700">
                            {missingSkills.map((skill: string, index: number) => (
                              <li key={index}>{skill}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-zinc-500">
                            No missing skills listed.
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <h3 className="font-medium text-zinc-950">Reasons</h3>
                        {reasons.length ? (
                          <ul className="mt-3 ml-5 list-disc space-y-1 text-sm text-zinc-700">
                            {reasons.map((reason: string, index: number) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-zinc-500">
                            No reasons listed.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              </SectionCard>
            ) : (
              <SectionCard title="Latest Score" eyebrow="Fit">
                <p className="text-sm text-zinc-600">No score yet.</p>
              </SectionCard>
            )}

            <SectionCard title="Raw Description" eyebrow="Source">
              <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <summary className="cursor-pointer text-sm font-medium text-zinc-800">
                  Show full job description
                </summary>
                <div className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
                  {typedJob.description_raw || 'No description available.'}
                </div>
              </details>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Documents"
              eyebrow="Assets"
              actions={
                <div className="flex flex-wrap gap-2">
                  {/* <a
                    href={`/api/application-assets/${job.id}/resume-html`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  >
                    Preview Resume HTML
                  </a> */}

                  <a
                    href={`/api/application-assets/${job.id}/resume-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  >
                    Download Resume PDF
                  </a>

                  {/* <a
                    href={`/api/application-assets/${job.id}/cover-letter-html`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  >
                    Preview Cover Letter HTML
                  </a> */}

                  <a
                    href={`/api/application-assets/${job.id}/cover-letter-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  >
                    Download Cover Letter PDF
                  </a>
                </div>
              }
            >
              {latestAsset ? (
                <div className="space-y-4">
                  <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-800">
                      Show latest resume draft
                    </summary>
                    <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">
                      {latestAsset.resume_markdown || 'No resume draft.'}
                    </div>
                  </details>

                  <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-800">
                      Show latest cover letter draft
                    </summary>
                    <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">
                      {latestAsset.cover_letter_markdown || 'No cover letter draft.'}
                    </div>
                  </details>

                  <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-zinc-800">
                      Show recruiter note
                    </summary>
                    <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">
                      {latestAsset.recruiter_note || 'No recruiter note.'}
                    </div>
                  </details>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">No draft assets yet.</p>
              )}
            </SectionCard>

            <SectionCard title="Follow-Up Emails" eyebrow="Outreach">
              {latestAsset?.follow_up_1_email_markdown ||
              latestAsset?.follow_up_2_email_markdown ? (
                <div className="space-y-4">
                  {latestAsset.follow_up_1_email_markdown ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-zinc-950">Follow-Up 1</p>
                        <p className="text-sm text-zinc-500">
                          {typedApplication?.follow_up_1_due
                            ? `Due ${formatDate(typedApplication.follow_up_1_due)}`
                            : 'No due date'}
                        </p>
                      </div>

                      <div className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                        {latestAsset.follow_up_1_email_markdown}
                      </div>

                      <JobFollowUpActions
                        jobId={typedJob.id}
                        stage={1}
                        body={latestAsset.follow_up_1_email_markdown}
                        from={from === 'apply' ? 'apply' : 'jobs'}
                        sentAt={typedApplication?.follow_up_1_sent_at ?? null}
                      />
                    </div>
                  ) : null}

                  {latestAsset.follow_up_2_email_markdown ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-zinc-950">Follow-Up 2</p>
                        <p className="text-sm text-zinc-500">
                          {typedApplication?.follow_up_2_due
                            ? `Due ${formatDate(typedApplication.follow_up_2_due)}`
                            : 'No due date'}
                        </p>
                      </div>

                      <div className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                        {latestAsset.follow_up_2_email_markdown}
                      </div>

                      <JobFollowUpActions
                        jobId={typedJob.id}
                        stage={2}
                        body={latestAsset.follow_up_2_email_markdown}
                        from={from === 'apply' ? 'apply' : 'jobs'}
                        sentAt={typedApplication?.follow_up_2_sent_at ?? null}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-zinc-600">
                  No follow-up email assets yet.
                </p>
              )}
            </SectionCard>
          </div>
        </section>
      </div>
    </main>
  )
}