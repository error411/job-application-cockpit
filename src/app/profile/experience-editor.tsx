'use client'

import { useMemo, useState } from 'react'

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

type Props = {
  candidateProfileId: string
  initialExperience: ExperienceRow[]
}

type FormState = {
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

function formFromRow(row: ExperienceRow): FormState {
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

function emptyForm(): FormState {
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

export default function ExperienceEditor({
  candidateProfileId,
  initialExperience,
}: Props) {
  const [rows, setRows] = useState<ExperienceRow[]>(initialExperience)
  const [newForm, setNewForm] = useState<FormState>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    [rows]
  )

  async function createRow() {
    try {
      setSaving(true)
      setError(null)

      const res = await fetch('/api/profile/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_profile_id: candidateProfileId,
          company: newForm.company,
          title: newForm.title,
          location: newForm.location || null,
          start_date: newForm.start_date || null,
          end_date: newForm.is_current ? null : newForm.end_date || null,
          is_current: newForm.is_current,
          summary: newForm.summary || null,
          bullets: toLines(newForm.bulletsText),
          technologies: toCommaList(newForm.technologiesText),
          sort_order: Number(newForm.sort_order || '0'),
        }),
      })

      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to create experience row.')
      }

      setRows((current) => [...current, payload.experience])
      setNewForm(emptyForm())
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Failed to create experience row.'
      )
    } finally {
      setSaving(false)
    }
  }

  function startEdit(row: ExperienceRow) {
    setEditingId(row.id)
    setEditingForm(formFromRow(row))
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingForm(emptyForm())
  }

  async function saveEdit(id: string) {
    try {
      setSaving(true)
      setError(null)

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

      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to update experience row.')
      }

      setRows((current) =>
        current.map((row) => (row.id === id ? payload.experience : row))
      )
      cancelEdit()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Failed to update experience row.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteRow(id: string) {
    const confirmed = window.confirm('Delete this experience entry?')
    if (!confirmed) return

    try {
      setSaving(true)
      setError(null)

      const res = await fetch(`/api/profile/experience/${id}`, {
        method: 'DELETE',
      })

      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to delete experience row.')
      }

      setRows((current) => current.filter((row) => row.id !== id))
      if (editingId === id) {
        cancelEdit()
      }
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Failed to delete experience row.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-10 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Past Experience</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Keep your work history structured so scoring and asset generation stay grounded.
        </p>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white p-5">
        <h3 className="text-lg font-medium">Add experience</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={newForm.company}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, company: e.target.value }))
            }
            placeholder="Company"
            className="rounded border p-2"
          />
          <input
            value={newForm.title}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, title: e.target.value }))
            }
            placeholder="Title"
            className="rounded border p-2"
          />
          <input
            value={newForm.location}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, location: e.target.value }))
            }
            placeholder="Location"
            className="rounded border p-2"
          />
          <input
            value={newForm.sort_order}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, sort_order: e.target.value }))
            }
            placeholder="Sort order"
            className="rounded border p-2"
          />
          <input
            type="date"
            value={newForm.start_date}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, start_date: e.target.value }))
            }
            className="rounded border p-2"
          />
          <input
            type="date"
            value={newForm.end_date}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, end_date: e.target.value }))
            }
            disabled={newForm.is_current}
            className="rounded border p-2 disabled:opacity-50"
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newForm.is_current}
            onChange={(e) =>
              setNewForm((current) => ({ ...current, is_current: e.target.checked }))
            }
          />
          Current role
        </label>

        <textarea
          value={newForm.summary}
          onChange={(e) =>
            setNewForm((current) => ({ ...current, summary: e.target.value }))
          }
          placeholder="Summary"
          className="mt-4 min-h-[90px] w-full rounded border p-2"
        />

        <textarea
          value={newForm.bulletsText}
          onChange={(e) =>
            setNewForm((current) => ({ ...current, bulletsText: e.target.value }))
          }
          placeholder="Bullets (one per line)"
          className="mt-4 min-h-[140px] w-full rounded border p-2"
        />

        <textarea
          value={newForm.technologiesText}
          onChange={(e) =>
            setNewForm((current) => ({
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
            onClick={() => void createRow()}
            disabled={saving}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add experience'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRows.map((row) => {
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
                      onClick={() => void saveEdit(row.id)}
                      disabled={saving}
                      className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
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
                        onClick={() => startEdit(row)}
                        className="rounded border px-3 py-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteRow(row.id)}
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
                      <span className="font-medium text-zinc-800">Technologies:</span>{' '}
                      {(row.technologies ?? []).join(', ')}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}