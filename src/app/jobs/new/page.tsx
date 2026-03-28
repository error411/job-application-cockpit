'use client'

import { useState } from 'react'
import Link from 'next/link'

type NewJobForm = {
  company: string
  title: string
  location: string
  url: string
  source: string
  description: string
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

function MessageBanner({ message }: { message: string }) {
  const isError = message.toLowerCase().startsWith('error')

  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3 text-sm',
        isError
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800',
      ].join(' ')}
    >
      {message}
    </div>
  )
}

export default function NewJobPage() {
  const [form, setForm] = useState<NewJobForm>(initialForm)
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setMessage('Saving...')

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(`Error: ${result.error || 'Failed to save job'}`)
        return
      }

      setMessage('Job saved successfully.')
      setForm(initialForm)
    } catch {
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
              Create a new job record without changing the existing scoring,
              application, or automation pipeline.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Back to Jobs
            </Link>
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
              Source field
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              Preserved
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Defaults to manual unless you change it.
            </p>
          </div>

          <div className="app-panel rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-4 shadow-sm">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Pipeline behavior
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              Unchanged
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              This page only improves presentation, not workflow logic.
            </p>
          </div>
        </div>
      </section>

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
                  placeholder="Frontend Developer"
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
                  placeholder="San Diego, CA / Remote"
                />
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="url">Job URL</FieldLabel>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://company.com/careers/role"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="app-panel overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-white via-zinc-50/60 to-white px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                Context
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Description
              </h2>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div className="space-y-2">
              <FieldLabel htmlFor="description">Job description</FieldLabel>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Paste the role summary, requirements, responsibilities, and any notes you want preserved for downstream scoring and asset generation."
                rows={12}
              />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-4">
              <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
                Note
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-700">
                Keep the form simple and structured. This page feeds the existing
                jobs pipeline and should not take on downstream logic.
              </p>
            </div>
          </div>
        </section>

        {message ? <MessageBanner message={message} /> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Save creates the job record and leaves the rest of the pipeline
            unchanged.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}