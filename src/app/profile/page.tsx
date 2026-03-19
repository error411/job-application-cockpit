'use client'

import { useEffect, useState } from 'react'

type Profile = {
  id: string
  full_name: string
  title: string | null
  summary: string | null
  strengths: string[]
  experience_bullets: string[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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

  if (!profile) {
    return <main className="p-6">Loading profile...</main>
  }

  return (
    <main className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Candidate Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">Full Name</label>
          <input
            className="w-full border rounded p-2"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Title</label>
          <input
            className="w-full border rounded p-2"
            value={profile.title || ''}
            onChange={(e) =>
              setProfile({ ...profile, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Summary</label>
          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={profile.summary || ''}
            onChange={(e) =>
              setProfile({ ...profile, summary: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Strengths (one per line)
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[180px]"
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
          <label className="block font-medium mb-2">
            Experience Bullets (one per line)
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[220px]"
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
          className="border rounded px-4 py-2 disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  )
}