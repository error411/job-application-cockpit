'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type JobFollowUpActionsProps = {
  jobId: string
  stage: 1 | 2
  body: string
  from?: string
  sentAt?: string | null
}

function formatSentAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export default function JobFollowUpActions({
  jobId,
  stage,
  body,
  sentAt,
}: JobFollowUpActionsProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  async function handleMarkSent() {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/applications/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null

      if (!response.ok) {
        throw new Error(
          payload?.details || payload?.error || 'Failed to mark follow-up as sent'
        )
      }

      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to mark follow-up as sent'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleCopy} className="app-button">
          {copied ? 'Copied' : 'Copy Email'}
        </button>

        {sentAt ? (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Sent {formatSentAt(sentAt)}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleMarkSent}
            disabled={isSubmitting}
            className="app-button-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : `Mark Follow-Up ${stage} Sent`}
          </button>
        )}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}