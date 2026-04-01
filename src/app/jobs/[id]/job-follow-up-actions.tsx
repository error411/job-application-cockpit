'use client'

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
  from = 'jobs',
  sentAt,
}: JobFollowUpActionsProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" onClick={handleCopy} className="app-button">
        {copied ? 'Copied' : 'Copy Email'}
      </button>

      {sentAt ? (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Sent {formatSentAt(sentAt)}
        </span>
      ) : (
        <form action="/api/applications/follow-up" method="post">
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="stage" value={String(stage)} />
          <input type="hidden" name="from" value={from} />
          <button type="submit" className="app-button-primary">
            Mark Follow-Up {stage} Sent
          </button>
        </form>
      )}
    </div>
  )
}