'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function FollowUpActions({
  jobId,
  title,
  body,
}: {
  jobId: string
  title: string
  body: string
}) {
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(body)
      window.alert('Copied to clipboard')
    } catch {
      window.prompt('Copy manually:', body)
    }
  }

  function handleOpenGmail() {
    const subject = encodeURIComponent(
      `Following up on my application for ${title}`
    )
    const encodedBody = encodeURIComponent(body)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${encodedBody}`

    window.open(gmailUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleMarkSent() {
    if (isMarking) return

    setIsMarking(true)

    try {
      const response = await fetch('/api/applications/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to mark follow-up as sent.')
      }

      router.refresh()
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to mark follow-up as sent.'
      )
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={() => void handleCopy()} className="app-button">
        Copy follow-up
      </button>

      <button type="button" onClick={handleOpenGmail} className="app-button">
        Open Gmail
      </button>

      <button
        type="button"
        onClick={() => void handleMarkSent()}
        disabled={isMarking}
        className="app-button-primary disabled:opacity-50"
      >
        {isMarking ? 'Marking...' : 'Mark Follow-Up Sent'}
      </button>
    </div>
  )
}