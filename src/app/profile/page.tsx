'use client'

import { useEffect, useMemo, useState } from 'react'

type Profile = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  title: string | null
  summary: string | null
  strengths: string[]
  experience_bullets: string[]
}

type ExperienceRow = {
  id: string
  candidate_profile_id: string
  company: string
  title: string
  location: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean | null
  summary: string | null
  bullets: string[] | null
  technologies: string[] | null
  sort_order: number | null
}

type ExperienceFormState = {
  company: string
  title: string
  location: string
  start_date: string
  end_date: string
  is_current: boolean
  summary: string
  bulletsText: string
  technologiesText: string
  sort_order: string
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-zinc-900">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-zinc-900">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
    </div>
  )
}

function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function toCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function emptyExperienceForm(): ExperienceFormState {
  return {
    company: '',
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    summary: '',
    bulletsText: '',
    technologiesText: '',
    sort_order: '0',
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experienceRows, setExperienceRows] = useState<ExperienceRow[]>([])
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [experienceMessage, setExperienceMessage] = useState('')
  const [isSavingExperience, setIsSavingExperience] = useState(false)
  const [newExperience, setNewExperience] = useState<ExperienceFormState>(
    emptyExperienceForm()
  )

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/profile/current')
      const result = await res.json()

      if (!res.ok) {
        setMessage(`Error: ${result.error || 'Failed to load profile'}`)
        return
      }

      setProfile(result.profile)
    }

    loadProfile()
  }, [])

  useEffect(() => {
    async function loadExperience() {
      const res = await fetch('/api/profile/experience/current')
      const result = await res.json()

      if (!res.ok) {
        setExperienceMessage(
          `Error: ${result.error || 'Failed to load experience'}`
        )
        return
      }

      setExperienceRows(result.experience ?? [])
    }

    loadExperience()
  }, [])

  const sortedExperience = useMemo(
    () =>
      [...experienceRows].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    [experienceRows]
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!profile) return

    setIsSaving(true)
    setMessage('Saving...')

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })

    const result = await res.json()

    if (!res.ok) {
      setMessage(`Error: ${result.error || 'Failed to save profile'}`)
      setIsSaving(false)
      return
    }

    setProfile(result.profile)
    setMessage('Profile saved.')
    setIsSaving(false)
  }

  async function handleCreateExperience() {
    if (!profile) return

    setIsSavingExperience(true)
    setExperienceMessage('Saving experience...')

    const res = await fetch('/api/profile/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_profile_id: profile.id,
        company: newExperience.company,
        title: newExperience.title,
        location: newExperience.location || null,
        start_date: newExperience.start_date || null,
        end_date: newExperience.is_current ? null : newExperience.end_date || null,
        is_current: newExperience.is_current,
        summary: newExperience.summary || null,
        bullets: toLines(newExperience.bulletsText),
        technologies: toCommaList(newExperience.technologiesText),
        sort_order: Number(newExperience.sort_order || '0'),
      }),
    })

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      setExperienceMessage(
        `Error: ${result?.error || 'Failed to create experience row'}`
      )
      setIsSavingExperience(false)
      return
    }

    setExperienceRows((current) => [...current, result.experience])
    setNewExperience(emptyExperienceForm())
    setExperienceMessage('Experience added.')
    setIsSavingExperience(false)
  }

  async function handleDeleteExperience(id: string) {
    const confirmed = window.confirm('Delete this experience entry?')
    if (!confirmed) return

    setIsSavingExperience(true)
    setExperienceMessage('Deleting experience...')

    const res = await fetch(`/api/profile/experience/${id}`, {
      method: 'DELETE',
    })

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      setExperienceMessage(
        `Error: ${result?.error || 'Failed to delete experience row'}`
      )
      setIsSavingExperience(false)
      return
    }

    setExperienceRows((current) => current.filter((row) => row.id !== id))

    setExperienceMessage('Experience deleted.')
    setIsSavingExperience(false)
  }

  if (!profile) {
    return <main className="p-6">Loading profile...</main>
  }

  return (
  <div className="space-y-10">
    <section className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Candidate
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
        Profile
      </h1>

      <p className="max-w-3xl text-sm leading-6 text-zinc-600">
        This is your source of truth for scoring, resume generation, and cover letters.
      </p>
    </section>

    {/* Profile Panel */}
    <section className="app-panel">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Core Profile
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Used across all generated assets and scoring.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Full Name"
            value={profile.full_name}
            onChange={(v) =>
              setProfile({ ...profile, full_name: v })
            }
          />

          <InputField
            label="Email"
            value={profile.email ?? ''}
            onChange={(v) =>
              setProfile({ ...profile, email: v })
            }
          />

          <InputField
            label="Phone"
            value={profile.phone ?? ''}
            onChange={(v) =>
              setProfile({ ...profile, phone: v })
            }
          />

          <InputField
            label="Location"
            value={profile.location ?? ''}
            onChange={(v) =>
              setProfile({ ...profile, location: v })
            }
          />

          <InputField
            label="LinkedIn Profile"
            value={profile.linkedin_url ?? ''}
            onChange={(v) =>
              setProfile({ ...profile, linkedin_url: v })
            }
            placeholder="https://www.linkedin.com/in/your-name"
          />
        </div>

        <InputField
          label="Title"
          value={profile.title ?? ''}
          onChange={(v) =>
            setProfile({ ...profile, title: v })
          }
        />

        <TextareaField
          label="Summary"
          value={profile.summary ?? ''}
          onChange={(v) =>
            setProfile({ ...profile, summary: v })
          }
          rows={5}
        />

        <TextareaField
          label="Strengths (one per line)"
          value={profile.strengths.join('\n')}
          onChange={(v) =>
            setProfile({
              ...profile,
              strengths: toLines(v),
            })
          }
          rows={6}
        />

        <TextareaField
          label="Experience Bullets (one per line)"
          value={profile.experience_bullets.join('\n')}
          onChange={(v) =>
            setProfile({
              ...profile,
              experience_bullets: toLines(v),
            })
          }
          rows={8}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>

          {message ? (
            <p className="text-sm text-zinc-600">{message}</p>
          ) : null}
        </div>
      </form>
    </section>

    {/* Experience Section */}
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          Experience
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Improves scoring accuracy and generated content quality.
        </p>
      </div>

      {/* Add Experience */}
      <div className="app-panel">
        <h3 className="text-lg font-medium text-zinc-950">
          Add Experience
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            value={newExperience.company}
            onChange={(v) =>
              setNewExperience((c) => ({ ...c, company: v }))
            }
            placeholder="Company"
          />

          <InputField
            value={newExperience.title}
            onChange={(v) =>
              setNewExperience((c) => ({ ...c, title: v }))
            }
            placeholder="Title"
          />

          <InputField
            value={newExperience.location}
            onChange={(v) =>
              setNewExperience((c) => ({ ...c, location: v }))
            }
            placeholder="Location"
          />

          <InputField
            value={newExperience.sort_order}
            onChange={(v) =>
              setNewExperience((c) => ({ ...c, sort_order: v }))
            }
            placeholder="Sort order"
          />

          <input
            type="date"
            value={newExperience.start_date}
            onChange={(e) =>
              setNewExperience((c) => ({
                ...c,
                start_date: e.target.value,
              }))
            }
            className="rounded-xl border p-2"
          />

          <input
            type="date"
            value={newExperience.end_date}
            onChange={(e) =>
              setNewExperience((c) => ({
                ...c,
                end_date: e.target.value,
              }))
            }
            disabled={newExperience.is_current}
            className="rounded-xl border p-2 disabled:opacity-50"
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newExperience.is_current}
            onChange={(e) =>
              setNewExperience((c) => ({
                ...c,
                is_current: e.target.checked,
              }))
            }
          />
          Current role
        </label>

        <TextareaField
          value={newExperience.summary}
          onChange={(v) =>
            setNewExperience((c) => ({ ...c, summary: v }))
          }
          placeholder="Summary"
          rows={3}
        />

        <TextareaField
          value={newExperience.bulletsText}
          onChange={(v) =>
            setNewExperience((c) => ({ ...c, bulletsText: v }))
          }
          placeholder="Bullets (one per line)"
          rows={5}
        />

        <TextareaField
          value={newExperience.technologiesText}
          onChange={(v) =>
            setNewExperience((c) => ({
              ...c,
              technologiesText: v,
            }))
          }
          placeholder="Technologies (comma separated)"
          rows={3}
        />

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleCreateExperience()}
            disabled={isSavingExperience}
            className="app-button-primary disabled:opacity-50"
          >
            {isSavingExperience ? 'Saving...' : 'Add Experience'}
          </button>
        </div>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {sortedExperience.map((row) => (
          <div key={row.id} className="app-panel">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  {row.title}
                </h3>
                <p className="text-sm text-zinc-700">{row.company}</p>
                <p className="text-sm text-zinc-500">
                  {row.location || 'No location'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => void handleDeleteExperience(row.id)}
                  className="app-button border-red-300 text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            {row.summary && (
              <p className="mt-3 text-sm text-zinc-700">{row.summary}</p>
            )}

            {(row.bullets ?? []).length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                {row.bullets!.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {experienceMessage && (
        <p className="text-sm text-zinc-600">{experienceMessage}</p>
      )}
    </section>
  </div>
)
}
