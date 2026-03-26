'use client'

import { useMemo, useState } from 'react'
import { getActiveFollowUpStage } from '@/lib/applications/get-active-follow-up-stage'
import type { ApplicationStatus } from '@/lib/statuses'

type ApplyItem = {
  id: string
  jobId: string
  status: ApplicationStatus
  company: string
  title: string
  location: string
  notes: string | null
  appliedAt: string | null
  followUp1Due: string | null
  followUp2Due: string | null
  followUp1SentAt: string | null
  followUp2SentAt: string | null
  followUp1EmailMarkdown: string | null
  followUp2EmailMarkdown: string | null
  hasAssets: boolean
  latestScore: number | null
  priorityScore: number
  reason: string
}

type Props = {
  items: ApplyItem[]
}

type FollowUpResponse = {
  application?: {
    id: string
    job_id: string
    status: string
    notes: string | null
    follow_up_1_due: string | null
    follow_up_2_due: string | null
    follow_up_1_sent_at: string | null
    follow_up_2_sent_at: string | null
  }
  completedStage?: 1 | 2
  error?: string
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value: string | null): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getItemActiveFollowUpStage(item: ApplyItem) {
  return getActiveFollowUpStage({
    follow_up_1_due: item.followUp1Due,
    follow_up_2_due: item.followUp2Due,
    follow_up_1_sent_at: item.followUp1SentAt,
    follow_up_2_sent_at: item.followUp2SentAt,
  })
}

function ApplyItemCard({
  item,
  markingJobId,
  onMarkFollowUpSent,
}: {
  item: ApplyItem
  markingJobId: string | null
  onMarkFollowUpSent: (jobId: string) => void
}) {
  const activeFollowUpStage = getItemActiveFollowUpStage(item)

  const activeFollowUpContent =
    activeFollowUpStage === 1
      ? item.followUp1EmailMarkdown
      : activeFollowUpStage === 2
        ? item.followUp2EmailMarkdown
        : null

  const activeFollowUpDueDate =
    activeFollowUpStage === 1
      ? item.followUp1Due
      : activeFollowUpStage === 2
        ? item.followUp2Due
        : null

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {item.title}
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {item.status}
            </span>

            {item.hasAssets ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Assets ready
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Assets pending
              </span>
            )}

            {activeFollowUpStage !== null ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                Follow-up {activeFollowUpStage} due
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-slate-700">
            {item.company} · {item.location}
          </p>

          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="font-medium text-slate-900">Applied:</span>{' '}
              {formatDate(item.appliedAt)}
            </div>

            <div>
              <span className="font-medium text-slate-900">Score:</span>{' '}
              {item.latestScore !== null ? `${item.latestScore}/100` : '—'}
            </div>

            <div>
              <span className="font-medium text-slate-900">Follow-up 1:</span>{' '}
              {item.followUp1SentAt
                ? `Sent ${formatDate(item.followUp1SentAt)}`
                : formatDate(item.followUp1Due)}
            </div>

            <div>
              <span className="font-medium text-slate-900">Follow-up 2:</span>{' '}
              {item.followUp2SentAt
                ? `Sent ${formatDate(item.followUp2SentAt)}`
                : formatDate(item.followUp2Due)}
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-700">{item.reason}</p>

          {item.notes ? (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {item.notes}
              </p>
            </div>
          ) : null}

          {activeFollowUpStage !== null ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    Follow-up {activeFollowUpStage} due
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Due: {formatDateTime(activeFollowUpDueDate)}
                  </p>

                  {activeFollowUpContent ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-amber-900">
                        Preview follow-up email
                      </summary>
                      <div className="mt-2 whitespace-pre-wrap rounded-md border border-amber-200 bg-white p-3 text-sm text-slate-700">
                        {activeFollowUpContent}
                      </div>
                    </details>
                  ) : (
                    <p className="mt-2 text-sm text-amber-800">
                      No generated follow-up content found yet.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onMarkFollowUpSent(item.jobId)}
                  disabled={markingJobId === item.jobId}
                  className="inline-flex shrink-0 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {markingJobId === item.jobId
                    ? 'Marking...'
                    : 'Mark Follow-Up Sent'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function ApplyModeClient({ items: initialItems }: Props) {
  const [items, setItems] = useState<ApplyItem[]>(initialItems)
  const [markingJobId, setMarkingJobId] = useState<string | null>(null)

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aFollowUpStage = getItemActiveFollowUpStage(a)
      const bFollowUpStage = getItemActiveFollowUpStage(b)

      if (aFollowUpStage !== null && bFollowUpStage === null) return -1
      if (aFollowUpStage === null && bFollowUpStage !== null) return 1

      return b.priorityScore - a.priorityScore
    })
  }, [items])

  const followUpItems = useMemo(
    () => sortedItems.filter((item) => getItemActiveFollowUpStage(item) !== null),
    [sortedItems]
  )

  const pipelineItems = useMemo(
    () => sortedItems.filter((item) => getItemActiveFollowUpStage(item) === null),
    [sortedItems]
  )

  async function handleMarkFollowUpSent(jobId: string) {
    try {
      setMarkingJobId(jobId)

      const response = await fetch('/api/applications/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const payload = (await response.json()) as FollowUpResponse

      if (!response.ok || !payload.application) {
        throw new Error(payload.error ?? 'Failed to mark follow-up as sent')
      }

      setItems((prev) =>
        prev.map((item) =>
          item.jobId === jobId
            ? {
                ...item,
                followUp1Due:
                  payload.application?.follow_up_1_due ?? item.followUp1Due,
                followUp2Due:
                  payload.application?.follow_up_2_due ?? item.followUp2Due,
                followUp1SentAt:
                  payload.application?.follow_up_1_sent_at ?? item.followUp1SentAt,
                followUp2SentAt:
                  payload.application?.follow_up_2_sent_at ?? item.followUp2SentAt,
              }
            : item
        )
      )
    } catch (error) {
      console.error(error)
      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to mark follow-up as sent'
      )
    } finally {
      setMarkingJobId(null)
    }
  }

  if (sortedItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Apply Queue</h2>
        <p className="mt-2 text-sm text-slate-600">
          No active applications are currently in the apply queue.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {followUpItems.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">
              Follow-ups due
            </h2>
            <p className="mt-1 text-sm text-amber-800">
              These need action before the rest of the pipeline.
            </p>
          </div>

          <div className="space-y-4">
            {followUpItems.map((item) => (
              <ApplyItemCard
                key={item.id}
                item={item}
                markingJobId={markingJobId}
                onMarkFollowUpSent={handleMarkFollowUpSent}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Pipeline
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Prioritized applications ready for review and action.
          </p>
        </div>

        {pipelineItems.length > 0 ? (
          <div className="space-y-4">
            {pipelineItems.map((item) => (
              <ApplyItemCard
                key={item.id}
                item={item}
                markingJobId={markingJobId}
                onMarkFollowUpSent={handleMarkFollowUpSent}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-600">
              No remaining pipeline items right now.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}