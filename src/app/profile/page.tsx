'use client'

import { useEffect, useMemo, useState } from 'react'

type Profile = {
  id: string
  full_name: string
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

function formFromRow(row: ExperienceRow): ExperienceFormState {
  return {
    company: row.company ?? '',
    title: row.title ?? '',
    location: row.location ?? '',
    start_date: row.start_date ?? '',
    end_date: row.end_date ?? '',
    is_current: Boolean(row.is_current),
    summary: row.summary ?? '',
    bulletsText: (row.bullets ?? []).join('\n'),
    technologiesText: (row.technologies ?? []).join(', '),
    sort_order: String(row.sort_order ?? 0),
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<ExperienceFormState>(
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

  function startEditExperience(row: ExperienceRow) {
    setEditingId(row.id)
    setEditingForm(formFromRow(row))
    setExperienceMessage('')
  }

  function cancelEditExperience() {
    setEditingId(null)
    setEditingForm(emptyExperienceForm())
  }

  async function handleSaveExperience(id: string) {
    setIsSavingExperience(true)
    setExperienceMessage('Saving experience...')

    const res = await fetch(`/api/profile/experience/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: editingForm.company,
        title: editingForm.title,
        location: editingForm.location || null,
        start_date: editingForm.start_date || null,
        end_date: editingForm.is_current ? null : editingForm.end_date || null,
        is_current: editingForm.is_current,
        summary: editingForm.summary || null,
        bullets: toLines(editingForm.bulletsText),
        technologies: toCommaList(editingForm.technologiesText),
        sort_order: Number(editingForm.sort_order || '0'),
      }),
    })

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      setExperienceMessage(
        `Error: ${result?.error || 'Failed to update experience row'}`
      )
      setIsSavingExperience(false)
      return
    }

    setExperienceRows((current) =>
      current.map((row) => (row.id === id ? result.experience : row))
    )
    setEditingId(null)
    setEditingForm(emptyExperienceForm())
    setExperienceMessage('Experience updated.')
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

    if (editingId === id) {
      setEditingId(null)
      setEditingForm(emptyExperienceForm())
    }

    setExperienceMessage('Experience deleted.')
    setIsSavingExperience(false)
  }

  if (!profile) {
    return <main className="p-6">Loading profile...</main>
  }

  return (
    <main className="max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Candidate Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="mb-2 block font-medium">Full Name</label>
          <input
            className="w-full rounded border p-2"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Title</label>
          <input
            className="w-full rounded border p-2"
            value={profile.title || ''}
            onChange={(e) =>
              setProfile({ ...profile, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Summary</label>
          <textarea
            className="min-h-[120px] w-full rounded border p-2"
            value={profile.summary || ''}
            onChange={(e) =>
              setProfile({ ...profile, summary: e.target.value })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Strengths (one per line)
          </label>
          <textarea
            className="min-h-[180px] w-full rounded border p-2"
            value={profile.strengths.join('\n')}
            onChange={(e) =>
              setProfile({
                ...profile,
                strengths: e.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Experience Bullets (one per line)
          </label>
          <textarea
            className="min-h-[220px] w-full rounded border p-2"
            value={profile.experience_bullets.join('\n')}
            onChange={(e) =>
              setProfile({
                ...profile,
                experience_bullets: e.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <button
          type="submit"
          className="rounded border px-4 py-2 disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>

        {message && <p>{message}</p>}
      </form>

      <section className="mt-12 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Past Experience</h2>
          <p className="mt-1 text-sm text-zinc-600">
            This powers better scoring and better generated assets.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-lg font-medium">Add experience</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={newExperience.company}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  company: e.target.value,
                }))
              }
              placeholder="Company"
              className="rounded border p-2"
            />
            <input
              value={newExperience.title}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
              placeholder="Title"
              className="rounded border p-2"
            />
            <input
              value={newExperience.location}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  location: e.target.value,
                }))
              }
              placeholder="Location"
              className="rounded border p-2"
            />
            <input
              value={newExperience.sort_order}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  sort_order: e.target.value,
                }))
              }
              placeholder="Sort order"
              className="rounded border p-2"
            />
            <input
              type="date"
              value={newExperience.start_date}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  start_date: e.target.value,
                }))
              }
              className="rounded border p-2"
            />
            <input
              type="date"
              value={newExperience.end_date}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  end_date: e.target.value,
                }))
              }
              disabled={newExperience.is_current}
              className="rounded border p-2 disabled:opacity-50"
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newExperience.is_current}
              onChange={(e) =>
                setNewExperience((current) => ({
                  ...current,
                  is_current: e.target.checked,
                }))
              }
            />
            Current role
          </label>

          <textarea
            value={newExperience.summary}
            onChange={(e) =>
              setNewExperience((current) => ({
                ...current,
                summary: e.target.value,
              }))
            }
            placeholder="Summary"
            className="mt-4 min-h-[90px] w-full rounded border p-2"
          />

          <textarea
            value={newExperience.bulletsText}
            onChange={(e) =>
              setNewExperience((current) => ({
                ...current,
                bulletsText: e.target.value,
              }))
            }
            placeholder="Bullets (one per line)"
            className="mt-4 min-h-[140px] w-full rounded border p-2"
          />

          <textarea
            value={newExperience.technologiesText}
            onChange={(e) =>
              setNewExperience((current) => ({
                ...current,
                technologiesText: e.target.value,
              }))
            }
            placeholder="Technologies (comma separated)"
            className="mt-4 min-h-[90px] w-full rounded border p-2"
          />

          <div className="mt-4">
            <button
              type="button"
              onClick={() => void handleCreateExperience()}
              disabled={isSavingExperience}
              className="rounded border px-4 py-2 text-sm disabled:opacity-50"
            >
              {isSavingExperience ? 'Saving...' : 'Add experience'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedExperience.map((row) => {
            const isEditing = editingId === row.id
            const form = isEditing ? editingForm : formFromRow(row)

            return (
              <div key={row.id} className="rounded-xl border bg-white p-5">
                {isEditing ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={form.company}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            company: e.target.value,
                          }))
                        }
                        placeholder="Company"
                        className="rounded border p-2"
                      />
                      <input
                        value={form.title}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Title"
                        className="rounded border p-2"
                      />
                      <input
                        value={form.location}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Location"
                        className="rounded border p-2"
                      />
                      <input
                        value={form.sort_order}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            sort_order: e.target.value,
                          }))
                        }
                        placeholder="Sort order"
                        className="rounded border p-2"
                      />
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            start_date: e.target.value,
                          }))
                        }
                        className="rounded border p-2"
                      />
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            end_date: e.target.value,
                          }))
                        }
                        disabled={form.is_current}
                        className="rounded border p-2 disabled:opacity-50"
                      />
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.is_current}
                        onChange={(e) =>
                          setEditingForm((current) => ({
                            ...current,
                            is_current: e.target.checked,
                          }))
                        }
                      />
                      Current role
                    </label>

                    <textarea
                      value={form.summary}
                      onChange={(e) =>
                        setEditingForm((current) => ({
                          ...current,
                          summary: e.target.value,
                        }))
                      }
                      placeholder="Summary"
                      className="mt-4 min-h-[90px] w-full rounded border p-2"
                    />

                    <textarea
                      value={form.bulletsText}
                      onChange={(e) =>
                        setEditingForm((current) => ({
                          ...current,
                          bulletsText: e.target.value,
                        }))
                      }
                      placeholder="Bullets (one per line)"
                      className="mt-4 min-h-[140px] w-full rounded border p-2"
                    />

                    <textarea
                      value={form.technologiesText}
                      onChange={(e) =>
                        setEditingForm((current) => ({
                          ...current,
                          technologiesText: e.target.value,
                        }))
                      }
                      placeholder="Technologies (comma separated)"
                      className="mt-4 min-h-[90px] w-full rounded border p-2"
                    />

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSaveExperience(row.id)}
                        disabled={isSavingExperience}
                        className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditExperience}
                        className="rounded border px-4 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-medium">{row.title}</h3>
                        <p className="text-sm text-zinc-700">{row.company}</p>
                        <p className="text-sm text-zinc-500">
                          {row.location || 'No location'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditExperience(row)}
                          className="rounded border px-3 py-2 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteExperience(row.id)}
                          className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {row.summary ? (
                      <p className="mt-3 text-sm text-zinc-700">{row.summary}</p>
                    ) : null}

                    {(row.bullets ?? []).length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                        {(row.bullets ?? []).map((bullet, index) => (
                          <li key={index}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}

                    {(row.technologies ?? []).length ? (
                      <p className="mt-3 text-sm text-zinc-600">
                        <span className="font-medium text-zinc-800">
                          Technologies:
                        </span>{' '}
                        {(row.technologies ?? []).join(', ')}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {experienceMessage && <p>{experienceMessage}</p>}
      </section>
    </main>
  )
}