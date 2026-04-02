'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function NewJobPage() {
  const router = useRouter()

  const [form, setForm] = useState<NewJobForm>(initialForm)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>(
    'info'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)

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
          `Job saved and scored successfully.${scoreText} Opening job page...`
        )

        setForm(initialForm)

        router.push(`/jobs/${result.job.id}`)
        router.refresh()
        return
      }

      setMessageTone('info')
      setMessage(
        `Job saved, but scoring did not complete. ${
          result.scoringError || 'Opening job page so you can review it manually.'
        }`
      )

      setForm(initialForm)

      router.push(`/jobs/${result.job.id}`)
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
              Add a role directly into the jobs pipeline.
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
                  placeholder="Acme Inc."
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
                  placeholder="Senior WordPress Developer"
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
                  placeholder="Remote / San Diego, CA"
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