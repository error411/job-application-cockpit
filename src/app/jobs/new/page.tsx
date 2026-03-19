'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewJobPage() {
  const [form, setForm] = useState({
    company: '',
    title: '',
    location: '',
    url: '',
    source: 'manual',
    description: '',
  })

  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage('Saving...')

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await res.json()

      if (!res.ok) {
        setMessage(`Error: ${result.error || 'Failed to save job'}`)
        return
      }

      setMessage('Job saved successfully.')
      setForm({
        company: '',
        title: '',
        location: '',
        url: '',
        source: 'manual',
        description: '',
      })
    } catch (error) {
      setMessage('Error: Could not reach the server.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="p-6 max-w-3xl">
      <div className="mb-6">
        <Link href="/jobs" className="text-sm underline">
          ← Back to Jobs
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Job URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />

        <textarea
          className="w-full border rounded p-2 min-h-[240px]"
          placeholder="Paste the full job description here"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button
          className="border rounded px-4 py-2 disabled:opacity-50"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Job'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  )
}