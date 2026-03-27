'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ApplyItem } from '@/lib/apply-mode/types'
import { getActiveFollowUpStage } from '@/lib/applications/get-active-follow-up-stage'

type ApplyModeClientProps = {
  items?: ApplyItem[]
}

type ApplicationStatus = 'ready' | 'applied' | 'interviewing'

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

function formatDate(value: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString()
}

function formatDateTime(value: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString()
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'ready'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'applied'
        ? 'bg-blue-100 text-blue-800'
        : status === 'interviewing'
          ? 'bg-violet-100 text-violet-800'
          : 'bg-zinc-100 text-zinc-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {status}
    </span>
  )
}

function QuickActionButtons({
  item,
  onGenerate,
  onStatusChange,
  onCopyFollowUp,
  onOpenGmail,
  generating,
  updatingStatus,
}: {
  item: ApplyItem
  onGenerate: (jobId: string, source: 'manual' | 'auto') => Promise<void>
  onStatusChange: (jobId: string, status: ApplicationStatus) => Promise<void>
  onCopyFollowUp: (text: string) => Promise<void>
  onOpenGmail: (item: ApplyItem, body: string) => void
  generating: boolean
  updatingStatus: boolean
}) {
  const activeFollowUpStage = getActiveFollowUpStage({
    follow_up_1_due: item.followUp1Due,
    follow_up_2_due: item.followUp2Due,
    follow_up_1_sent_at: item.followUp1SentAt,
    follow_up_2_sent_at: item.followUp2SentAt,
  })

  const activeFollowUpContent =
    activeFollowUpStage === 1
      ? item.followUp1EmailMarkdown
      : activeFollowUpStage === 2
        ? item.followUp2EmailMarkdown
        : null

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Link href={`/jobs/${item.jobId}?from=apply`} className="app-button">
        View job
      </Link>

      <button
        type="button"
        onClick={() => void onGenerate(item.jobId, 'manual')}
        disabled={generating}
        className="app-button disabled:opacity-50"
      >
        {generating
          ? 'Generating...'
          : item.hasAssets
            ? 'Regenerate assets'
            : 'Generate assets'}
      </button>

      <button
        type="button"
        onClick={() => void onStatusChange(item.jobId, 'ready')}
        disabled={updatingStatus}
        className="app-button disabled:opacity-50"
      >
        Mark ready
      </button>

      <button
        type="button"
        onClick={() => void onStatusChange(item.jobId, 'applied')}
        disabled={updatingStatus}
        className="app-button disabled:opacity-50"
      >
        Mark applied
      </button>

      <button
        type="button"
        onClick={() => void onStatusChange(item.jobId, 'interviewing')}
        disabled={updatingStatus}
        className="app-button disabled:opacity-50"
      >
        Mark interviewing
      </button>

      {activeFollowUpContent ? (
        <>
          <button
            type="button"
            onClick={() => void onCopyFollowUp(activeFollowUpContent)}
            className="app-button"
          >
            Copy follow-up
          </button>

          <button
            type="button"
            onClick={() => onOpenGmail(item, activeFollowUpContent)}
            className="app-button"
          >
            Open Gmail
          </button>
        </>
      ) : null}
    </div>
  )
}

function NotesForm({
  item,
  onSaveNotes,
  saving,
}: {
  item: ApplyItem
  onSaveNotes: (jobId: string, notes: string) => Promise<void>
  saving: boolean
}) {
  const [draft, setDraft] = useState(() => item.notes ?? '')

  return (
    <form
      className="mt-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        void onSaveNotes(item.jobId, draft)
      }}
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-900">
          Quick notes
        </label>
        <textarea
          name="notes"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-[100px] w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="Add recruiter info, next steps, interview prep notes, etc."
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="app-button-primary disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save notes'}
      </button>
    </form>
  )
}

function KeyboardHelp() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
      <span className="font-medium text-zinc-900">Keyboard:</span>{' '}
      <kbd className="rounded border px-2 py-0.5">j</kbd> next{' '}
      <kbd className="rounded border px-2 py-0.5">k</kbd> prev{' '}
      <kbd className="rounded border px-2 py-0.5">a</kbd> applied{' '}
      <kbd className="rounded border px-2 py-0.5">r</kbd> ready{' '}
      <kbd className="rounded border px-2 py-0.5">i</kbd> interview{' '}
      <kbd className="rounded border px-2 py-0.5">g</kbd> generate{' '}
      <kbd className="rounded border px-2 py-0.5">n</kbd> notes
    </div>
  )
}

function FollowUpPanel({
  item,
  onMarkFollowUpSent,
  onCopyFollowUp,
  onOpenGmail,
  marking,
}: {
  item: ApplyItem
  onMarkFollowUpSent: (jobId: string) => Promise<void>
  onCopyFollowUp: (text: string) => Promise<void>
  onOpenGmail: (item: ApplyItem, body: string) => void
  marking: boolean
}) {
  const activeFollowUpStage = getActiveFollowUpStage({
    follow_up_1_due: item.followUp1Due,
    follow_up_2_due: item.followUp2Due,
    follow_up_1_sent_at: item.followUp1SentAt,
    follow_up_2_sent_at: item.followUp2SentAt,
  })

  if (activeFollowUpStage === null) return null

  const activeFollowUpContent =
    activeFollowUpStage === 1
      ? item.followUp1EmailMarkdown
      : item.followUp2EmailMarkdown

  const activeFollowUpDueDate =
    activeFollowUpStage === 1 ? item.followUp1Due : item.followUp2Due

  return (
    <div className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Follow-up {activeFollowUpStage} due
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Due: {formatDateTime(activeFollowUpDueDate)}
          </p>

          {activeFollowUpContent ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onCopyFollowUp(activeFollowUpContent)}
                  className="app-button"
                >
                  Copy follow-up
                </button>

                <button
                  type="button"
                  onClick={() => onOpenGmail(item, activeFollowUpContent)}
                  className="app-button"
                >
                  Open Gmail
                </button>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-amber-900">
                  Preview follow-up email
                </summary>
                <div className="mt-2 whitespace-pre-wrap rounded-xl border border-amber-200 bg-white p-3 text-sm text-zinc-700">
                  {activeFollowUpContent}
                </div>
              </details>
            </>
          ) : (
            <p className="mt-2 text-sm text-amber-800">
              No generated follow-up content found yet.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void onMarkFollowUpSent(item.jobId)}
          disabled={marking}
          className="app-button-primary disabled:opacity-50"
        >
          {marking ? 'Marking...' : 'Mark Follow-Up Sent'}
        </button>
      </div>
    </div>
  )
}

function ApplyCard({
  item,
  index,
  isFocused,
  onGenerate,
  onStatusChange,
  onSaveNotes,
  onMarkFollowUpSent,
  onCopyFollowUp,
  onOpenGmail,
  generating,
  updatingStatus,
  savingNotes,
  markingFollowUp,
}: {
  item: ApplyItem
  index: number
  isFocused: boolean
  onGenerate: (jobId: string, source: 'manual' | 'auto') => Promise<void>
  onStatusChange: (jobId: string, status: ApplicationStatus) => Promise<void>
  onSaveNotes: (jobId: string, notes: string) => Promise<void>
  onMarkFollowUpSent: (jobId: string) => Promise<void>
  onCopyFollowUp: (text: string) => Promise<void>
  onOpenGmail: (item: ApplyItem, body: string) => void
  generating: boolean
  updatingStatus: boolean
  savingNotes: boolean
  markingFollowUp: boolean
}) {
  const activeFollowUpStage = getActiveFollowUpStage({
    follow_up_1_due: item.followUp1Due,
    follow_up_2_due: item.followUp2Due,
    follow_up_1_sent_at: item.followUp1SentAt,
    follow_up_2_sent_at: item.followUp2SentAt,
  })

  return (
    <div
      id={`apply-item-${item.id}`}
      className={[
        'relative scroll-mt-24 rounded-2xl p-5 transition-all duration-200',
        isFocused
          ? 'border border-zinc-900 bg-white shadow-lg ring-1 ring-zinc-300 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-2xl before:bg-zinc-900'
          : 'border border-zinc-200 bg-white shadow-sm hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {isFocused ? 'Focused item' : `Queue item #${index + 1}`}
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-700">
            {item.company}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{item.location}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={item.status} />
          {activeFollowUpStage !== null ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Follow-up {activeFollowUpStage} due
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-700">
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
          <span className="font-medium text-zinc-900">Why now:</span>{' '}
          {item.reason}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Latest score
            </p>
            <p className="mt-1 font-medium text-zinc-900">
              {item.latestScore !== null ? `${item.latestScore}/100` : 'Not scored'}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Assets
            </p>
            <p className="mt-1 font-medium text-zinc-900">
              {item.hasAssets ? 'Available' : 'Missing'}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Applied
            </p>
            <p className="mt-1 font-medium text-zinc-900">
              {formatDate(item.appliedAt)}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Follow-up 1
            </p>
            <p className="mt-1 font-medium text-zinc-900">
              {item.followUp1SentAt
                ? `Sent ${formatDate(item.followUp1SentAt)}`
                : formatDate(item.followUp1Due)}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Follow-up 2
            </p>
            <p className="mt-1 font-medium text-zinc-900">
              {item.followUp2SentAt
                ? `Sent ${formatDate(item.followUp2SentAt)}`
                : formatDate(item.followUp2Due)}
            </p>
          </div>
        </div>
      </div>

      <QuickActionButtons
        item={item}
        onGenerate={onGenerate}
        onStatusChange={onStatusChange}
        onCopyFollowUp={onCopyFollowUp}
        onOpenGmail={onOpenGmail}
        generating={generating}
        updatingStatus={updatingStatus}
      />

      <FollowUpPanel
        item={item}
        onMarkFollowUpSent={onMarkFollowUpSent}
        onCopyFollowUp={onCopyFollowUp}
        onOpenGmail={onOpenGmail}
        marking={markingFollowUp}
      />

      <NotesForm
        key={`${item.id}:${item.notes ?? ''}`}
        item={item}
        onSaveNotes={onSaveNotes}
        saving={savingNotes}
      />
    </div>
  )
}

export default function ApplyModeClient({
  items: initialItems = [],
}: ApplyModeClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<ApplyItem[]>(initialItems)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null)
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)
  const [savingNotesJobId, setSavingNotesJobId] = useState<string | null>(null)
  const [markingFollowUpJobId, setMarkingFollowUpJobId] = useState<string | null>(
    null
  )

  const autoGeneratedJobIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setItems(initialItems)
    setFocusedIndex((current) =>
      initialItems.length === 0 ? 0 : Math.min(current, initialItems.length - 1)
    )
  }, [initialItems])

  const safeFocusedIndex = useMemo(() => {
    if (items.length === 0) return 0
    return Math.min(focusedIndex, items.length - 1)
  }, [focusedIndex, items.length])

  const refreshFromServer = useCallback(() => {
    router.refresh()
  }, [router])

  const updateStatus = useCallback(
    async (jobId: string, status: ApplicationStatus) => {
      if (updatingJobId) return

      const previousItems = items
      const nowIso = new Date().toISOString()

      setUpdatingJobId(jobId)
      setError(null)

      setItems((current) =>
        current.map((item) => {
          if (item.jobId !== jobId) return item

          const nextItem: ApplyItem = {
            ...item,
            status,
          }

          if (status === 'applied') {
            nextItem.appliedAt = item.appliedAt ?? nowIso
            nextItem.followUp1Due =
              item.followUp1Due ??
              new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            nextItem.followUp2Due =
              item.followUp2Due ??
              new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
          }

          return nextItem
        })
      )

      try {
        const currentItem = previousItems.find((item) => item.jobId === jobId)

        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            status,
            notes: currentItem?.notes ?? null,
          }),
        })

        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null

        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to update application.')
        }

        refreshFromServer()
      } catch (err) {
        console.error(err)
        setItems(previousItems)
        setError(
          err instanceof Error ? err.message : 'Failed to update application.'
        )
      } finally {
        setUpdatingJobId(null)
      }
    },
    [items, refreshFromServer, updatingJobId]
  )

  const saveNotes = useCallback(
    async (jobId: string, notes: string) => {
      if (savingNotesJobId) return

      const previousItems = items

      setSavingNotesJobId(jobId)
      setError(null)

      setItems((current) =>
        current.map((item) =>
          item.jobId === jobId
            ? {
                ...item,
                notes,
              }
            : item
        )
      )

      try {
        const currentItem = previousItems.find((item) => item.jobId === jobId)

        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            status: currentItem?.status ?? 'ready',
            notes,
          }),
        })

        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null

        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to save notes.')
        }

        refreshFromServer()
      } catch (err) {
        console.error(err)
        setItems(previousItems)
        setError(err instanceof Error ? err.message : 'Failed to save notes.')
      } finally {
        setSavingNotesJobId(null)
      }
    },
    [items, refreshFromServer, savingNotesJobId]
  )

  const generateAssets = useCallback(
    async (jobId: string, source: 'manual' | 'auto') => {
      if (generatingJobId) return

      try {
        setGeneratingJobId(jobId)
        setError(null)

        const res = await fetch('/api/generate-assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        })

        const payload = (await res.json().catch(() => null)) as
          | { error?: string; details?: string }
          | null

        if (!res.ok) {
          throw new Error(
            payload?.error || payload?.details || 'Failed to generate assets.'
          )
        }

        setItems((current) =>
          current.map((item) =>
            item.jobId === jobId
              ? {
                  ...item,
                  hasAssets: true,
                }
              : item
          )
        )

        if (source === 'auto') {
          autoGeneratedJobIdsRef.current.add(jobId)
        }

        refreshFromServer()
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error ? err.message : 'Failed to generate assets.'
        )
      } finally {
        setGeneratingJobId(null)
      }
    },
    [generatingJobId, refreshFromServer]
  )

  const markFollowUpSent = useCallback(
    async (jobId: string) => {
      if (markingFollowUpJobId) return

      const previousItems = items

      setMarkingFollowUpJobId(jobId)
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
          | FollowUpResponse
          | null

        if (!response.ok || !payload?.application) {
          throw new Error(payload?.error || 'Failed to mark follow-up as sent.')
        }

        setItems((current) =>
          current.map((item) =>
            item.jobId === jobId
              ? {
                  ...item,
                  followUp1Due:
                    payload.application?.follow_up_1_due ?? item.followUp1Due,
                  followUp2Due:
                    payload.application?.follow_up_2_due ?? item.followUp2Due,
                  followUp1SentAt:
                    payload.application?.follow_up_1_sent_at ??
                    item.followUp1SentAt,
                  followUp2SentAt:
                    payload.application?.follow_up_2_sent_at ??
                    item.followUp2SentAt,
                }
              : item
          )
        )
      } catch (err) {
        console.error(err)
        setItems(previousItems)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to mark follow-up as sent.'
        )
      } finally {
        setMarkingFollowUpJobId(null)
      }
    },
    [items, markingFollowUpJobId]
  )

  const copyFollowUp = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      window.alert('Copied to clipboard')
    } catch {
      window.prompt('Copy manually:', text)
    }
  }, [])

  const openGmail = useCallback((item: ApplyItem, body: string) => {
    const subject = encodeURIComponent(
      `Following up on my application for ${item.title}`
    )
    const encodedBody = encodeURIComponent(body)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${encodedBody}`

    window.open(gmailUrl, '_blank', 'noopener,noreferrer')
  }, [])

  useEffect(() => {
    const focusedItem = items[safeFocusedIndex]
    if (!focusedItem) return
    if (focusedItem.hasAssets) return
    if (generatingJobId) return
    if (autoGeneratedJobIdsRef.current.has(focusedItem.jobId)) return
    if ((focusedItem.latestScore ?? 0) < 70) return

    void generateAssets(focusedItem.jobId, 'auto')
  }, [items, safeFocusedIndex, generatingJobId, generateAssets])

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName.toLowerCase()
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target.isContentEditable
      )
    }

    function jumpToIndex(index: number) {
      const item = items[index]
      if (!item) return

      const el = document.getElementById(`apply-item-${item.id}`)
      if (!el) return

      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return
      if (items.length === 0) return

      const currentItem = items[safeFocusedIndex]
      if (!currentItem) return

      const container = document.getElementById(`apply-item-${currentItem.id}`)
      if (!container) return

      if (event.key === 'j') {
        event.preventDefault()
        setFocusedIndex((current) => {
          const next = Math.min(current + 1, items.length - 1)
          requestAnimationFrame(() => jumpToIndex(next))
          return next
        })
      }

      if (event.key === 'k') {
        event.preventDefault()
        setFocusedIndex((current) => {
          const next = Math.max(current - 1, 0)
          requestAnimationFrame(() => jumpToIndex(next))
          return next
        })
      }

      if (event.key === 'a') {
        event.preventDefault()
        void updateStatus(currentItem.jobId, 'applied')
      }

      if (event.key === 'r') {
        event.preventDefault()
        void updateStatus(currentItem.jobId, 'ready')
      }

      if (event.key === 'i') {
        event.preventDefault()
        void updateStatus(currentItem.jobId, 'interviewing')
      }

      if (event.key === 'g') {
        event.preventDefault()
        void generateAssets(currentItem.jobId, 'manual')
      }

      if (event.key === 'n') {
        event.preventDefault()
        const textarea = container.querySelector(
          'textarea'
        ) as HTMLTextAreaElement | null
        textarea?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [items, safeFocusedIndex, generateAssets, updateStatus])

  if (items.length === 0) {
    return (
      <>
        <KeyboardHelp />

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Queue is clear</h2>
          <p className="mt-2 text-sm text-zinc-600">
            No ready, applied, or interviewing items need attention right now.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/jobs" className="app-button">
              Browse jobs
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-4">
        <KeyboardHelp />

        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
          <span className="font-medium text-zinc-900">
            {safeFocusedIndex + 1}
          </span>{' '}
          of <span className="font-medium text-zinc-900">{items.length}</span>{' '}
          in queue
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-5">
        {items.map((item, index) => (
          <ApplyCard
            key={item.id}
            item={item}
            index={index}
            isFocused={index === safeFocusedIndex}
            onGenerate={generateAssets}
            onStatusChange={updateStatus}
            onSaveNotes={saveNotes}
            onMarkFollowUpSent={markFollowUpSent}
            onCopyFollowUp={copyFollowUp}
            onOpenGmail={openGmail}
            generating={generatingJobId === item.jobId}
            updatingStatus={updatingJobId === item.jobId}
            savingNotes={savingNotesJobId === item.jobId}
            markingFollowUp={markingFollowUpJobId === item.jobId}
          />
        ))}
      </div>
    </>
  )
}