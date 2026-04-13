'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { markOnboardingStepComplete } from '@/lib/onboarding/progress'
import { OnboardingTourPopup } from '@/components/onboarding-tour-popup'

type NewJobForm = {
  company: string
  title: string
  location: string
  url: string
  source: string
  description: string
}

type CreateJobApiResponse = {
  error?: string
  details?: string
  job?: {
    id: string
    company: string | null
    title: string | null
    status: string | null
  }
  application?: {
    id: string
    job_id: string
    status: string | null
  }
  score?: {
    id?: string
    score?: number | null
  } | null
  scoringApplied?: boolean
  scoringError?: string | null
}

type ProfileHints = {
  full_name: string
  title: string | null
  location: string | null
}

const initialForm: NewJobForm = {
  company: '',
  title: '',
  location: '',
  url: '',
  source: 'manual',
  description: '',
}

function FieldLabel({
  children,
  htmlFor,
  required = false,
}: {
  children: React.ReactNode
  htmlFor: string
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase"
    >
      {children}
      {required ? ' *' : ''}
    </label>
  )
}

function Input({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  id: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
    />
  )
}

function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  id: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
    />
  )
}

function MessageBanner({
  message,
  tone = 'success',
}: {
  message: string
  tone?: 'success' | 'error' | 'info'
}) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : tone === 'info'
        ? 'border-blue-200 bg-blue-50 text-blue-800'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'

  return (
    <div className={['rounded-2xl border px-4 py-3 text-sm', toneClass].join(' ')}>
      {message}
    </div>
  )
}

function NewJobPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState<NewJobForm>(initialForm)
  const [profileHints, setProfileHints] = useState<ProfileHints | null>(null)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>(
    'info'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const isOnboardingFlow = searchParams.get('onboarding') === 'add-job'
  const nextPath = searchParams.get('next') || '/today?onboarding=work-queue'

  useEffect(() => {
    async function loadProfileHints() {
      const res = await fetch('/api/profile/current')
      const result = await res.json().catch(() => null)

      if (!res.ok || !result?.profile) {
        return
      }

      setProfileHints({
        full_name: result.profile.full_name ?? '',
        title: result.profile.title ?? null,
        location: result.profile.location ?? null,
      })
    }

    void loadProfileHints()
  }, [])

  const titlePlaceholder =
    profileHints?.title?.trim() || 'Role title from the job post'
  const locationPlaceholder =
    profileHints?.location?.trim() || 'Remote, hybrid, or on-site location'
  const roleGuidance =
    profileHints?.title && profileHints?.location
      ? `Add a role that fits your ${profileHints.title} profile and location preference of ${profileHints.location}.`
      : profileHints?.title
        ? `Add a role that fits your ${profileHints.title} profile.`
        : profileHints?.location
          ? `Add a role that matches your location preference of ${profileHints.location}.`
          : 'Add a role directly into the jobs pipeline.'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isSaving) return

    setIsSaving(true)
    setCreatedJobId(null)
    setMessageTone('info')
    setMessage('Creating job record...')

    try {
      setMessage('Creating job and initial application...')

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = (await res.json()) as CreateJobApiResponse

      if (!res.ok) {
        setMessageTone('error')
        setMessage(
          `Error: ${
            result.error || result.details || 'Failed to save and score job.'
          }`
        )
        return
      }

      if (!result.job?.id) {
        setMessageTone('error')
        setMessage('Job was created, but no job id was returned.')
        return
      }

      setCreatedJobId(result.job.id)

      if (result.scoringApplied) {
        const scoreText =
          typeof result.score?.score === 'number'
            ? ` Score: ${result.score.score}.`
            : ''

        setMessageTone('success')
        setMessage(
          isOnboardingFlow
            ? `Job saved and scored successfully.${scoreText} Moving to draft generation...`
            : `Job saved and scored successfully.${scoreText} Opening job page...`
        )

        setForm(initialForm)

        if (isOnboardingFlow) {
          markOnboardingStepComplete('add_job')
        }

        router.push(
          isOnboardingFlow
            ? `/jobs/${result.job.id}?onboarding=generate-assets&next=${encodeURIComponent(nextPath)}`
            : `/jobs/${result.job.id}`
        )
        router.refresh()
        return
      }

      setMessageTone('info')
      setMessage(
        isOnboardingFlow
          ? `Job saved. ${
              result.scoringError ||
              'Moving to draft generation so you can keep onboarding.'
            }`
          : `Job saved, but scoring did not complete. ${
              result.scoringError ||
              'Opening job page so you can review it manually.'
            }`
      )

      setForm(initialForm)

      if (isOnboardingFlow) {
        markOnboardingStepComplete('add_job')
      }

      router.push(
        isOnboardingFlow
          ? `/jobs/${result.job.id}?onboarding=generate-assets&next=${encodeURIComponent(nextPath)}`
          : `/jobs/${result.job.id}`
      )
      router.refresh()
    } catch {
      setMessageTone('error')
      setMessage('Error: Could not reach the server.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="space-y-8">
      {isOnboardingFlow ? (
        <OnboardingTourPopup
          stageKey="onboarding-add-job"
          stepLabel="Product Tour"
          title="Add your first target job"
          description="Paste the role you want to pursue here. We’ll create the record, score it, and move you straight into draft generation."
          targetSelector='[data-tour-target="onboarding-save-job-button"]'
          placement="top"
        />
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
              Pipeline
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Add Job
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              Create a new job record, create its linked application, and score
              it immediately on submission.
            </p>
            {isOnboardingFlow ? (
              <div className="max-w-3xl rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Add your first job, then we&apos;ll automatically take you to
                the draft generation step.
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Back to Jobs
            </Link>

            {createdJobId ? (
              <Link
                href={`/jobs/${createdJobId}`}
                className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
              >
                Open New Job
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="app-panel rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Entry point
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              Manual intake
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {roleGuidance}
            </p>
          </div>

          <div className="app-panel rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Processing
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              Create + score
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Submission now creates the job, creates the application, and
              applies scoring immediately.
            </p>
          </div>

          <div className="app-panel rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Result
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              Auto-open job
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              On success, the new job detail page opens automatically so you can
              continue the workflow immediately.
            </p>
          </div>
        </div>
      </section>

      {message ? <MessageBanner message={message} tone={messageTone} /> : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="app-panel overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-white via-zinc-50/60 to-white px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                Job details
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Opportunity information
              </h2>
            </div>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="company" required>
                  Company
                </FieldLabel>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Company from the job post"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="title" required>
                  Title
                </FieldLabel>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      title: e.target.value,
                    }))
                  }
                  placeholder={titlePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      location: e.target.value,
                    }))
                  }
                  placeholder={locationPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="url">Job URL</FieldLabel>
                <Input
                  id="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://company.com/careers/role"
                  type="url"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="source">Source</FieldLabel>
                <Input
                  id="source"
                  value={form.source}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      source: e.target.value,
                    }))
                  }
                  placeholder="manual"
                />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="description" required>
                Job description
              </FieldLabel>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Paste the full role description here..."
                rows={14}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            data-tour-target="onboarding-save-job-button"
            className={[
              'app-button-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium',
              isSaving ? 'cursor-not-allowed opacity-70' : '',
            ].join(' ')}
          >
            {isSaving ? 'Creating + Scoring...' : 'Save Job + Score'}
          </button>

          <Link
            href="/jobs"
            className="app-button inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading add job...</main>}>
      <NewJobPageClient />
    </Suspense>
  )
}
