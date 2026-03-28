'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UnlockFormProps = {
  nextPath: string
}

export default function UnlockForm({ nextPath }: UnlockFormProps) {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('password', password)
    formData.append('next', nextPath)

    const response = await fetch('/api/auth/unlock', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Unable to unlock site.')
      setLoading(false)
      return
    }

    router.replace(data.redirectTo || '/')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <label htmlFor="password" className="block text-sm mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
          autoFocus
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white text-black px-4 py-3 font-medium disabled:opacity-60"
      >
        {loading ? 'Checking…' : 'Unlock'}
      </button>
    </form>
  )
}