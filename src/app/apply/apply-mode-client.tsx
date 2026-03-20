'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { ApplyItem } from '@/lib/apply-mode/types'

type ApplyModeClientProps = {
  items?: ApplyItem[]
}

type ApplicationStatus = 'ready' | 'applied' | 'interviewing'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
      {status}
    </span>
  )
}

function QuickActionButtons({
  item,
  onGenerate,
  onStatusChange,
  generating,
  updatingStatus,
}: {
  item: ApplyItem
  onGenerate: (jobId: string, source: 'manual' | 'auto') => Promise<void>
  onStatusChange: (jobId: string, status: ApplicationStatus) => Promise<void>
  generating: boolean
  updatingStatus: boolean
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        href={`/jobs/${item.jobId}?from=apply`}
        className="rounded border px-3 py-2 text-sm"
      >
        View job
      </Link>

      <button
        type="button"
        onClick={() => void onGenerate(item.jobId, 'manual')}
        disabled={generating}
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
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
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      >
        Mark ready
      </button>

      <button
        type="button"
        onClick={() => void onStatusChange(item.jobId, 'applied')}
        disabled={updatingStatus}
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      >
        Mark applied
      </button>

      <button
        type="button"
        onClick={() => void onStatusChange(item.jobId, 'interviewing')}
        disabled={updatingStatus}
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      >
        Mark interviewing
      </button>
    </div>
  )
}

function NotesForm({ item }: { item: ApplyItem }) {
  return (
    <form
      action="/api/applications-form"
      method="post"
      className="mt-4 space-y-2"
    >
      <input type="hidden" name="jobId" defaultValue={item.jobId ?? ''} />
      <input type="hidden" name="status" defaultValue={item.status ?? 'ready'} />
      <input type="hidden" name="from" defaultValue="apply" />
      <div>
        <label className="mb-1 block text-sm font-medium">Quick notes</label>
        <textarea
          name="notes"
          defaultValue={item.notes ?? ''}
          className="min-h-[100px] w-full rounded border p-2 text-sm"
          placeholder="Add recruiter info, next steps, interview prep notes, etc."
        />
      </div>
      <button type="submit" className="rounded border px-3 py-2 text-sm">
        Save notes
      </button>
    </form>
  )
}

function FocusPanel({
  item,
  onGenerate,
  generating,
}: {
  item: ApplyItem
  onGenerate: (jobId: string, source: 'manual' | 'auto') => Promise<void>
  generating: boolean
}) {
  return (
    <section className="mt-8 rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
            Next action focus
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{item.title}</h2>
          <p className="mt-1 text-zinc-300">{item.company}</p>
          <p className="mt-1 text-sm text-zinc-400">{item.location}</p>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="mt-5 grid gap-2 text-sm text-zinc-200">
        <p>
          <span className="font-medium text-white">Why now:</span> {item.reason}
        </p>
        <p>
          <span className="font-medium text-white">Latest score:</span>{' '}
          {item.latestScore !== null ? `${item.latestScore}/100` : 'Not scored'}
        </p>
        <p>
          <span className="font-medium text-white">Assets:</span>{' '}
          {item.hasAssets ? 'Available' : 'Missing'}
        </p>
        <p>
          <span className="font-medium text-white">Applied:</span>{' '}
          {formatDate(item.appliedAt)}
        </p>
        <p>
          <span className="font-medium text-white">Follow-up 1:</span>{' '}
          {formatDate(item.followUp1Due)}
        </p>
        <p>
          <span className="font-medium text-white">Follow-up 2:</span>{' '}
          {formatDate(item.followUp2Due)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={`#apply-item-${item.id}`}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Jump to focused item
        </a>

        <Link
          href={`/jobs/${item.jobId}?from=apply`}
          className="rounded border border-zinc-600 px-4 py-2 text-sm font-medium text-white"
        >
          Open job detail
        </Link>

        <button
          type="button"
          onClick={() => void onGenerate(item.jobId, 'manual')}
          disabled={generating}
          className="rounded border border-zinc-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate assets'}
        </button>
      </div>
    </section>
  )
}

function KeyboardHelp() {
  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
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

function ApplyCard({
  item,
  index,
  isFocused,
  onGenerate,
  onStatusChange,
  generating,
  updatingStatus,
}: {
  item: ApplyItem
  index: number
  isFocused: boolean
  onGenerate: (jobId: string, source: 'manual' | 'auto') => Promise<void>
  onStatusChange: (jobId: string, status: ApplicationStatus) => Promise<void>
  generating: boolean
  updatingStatus: boolean
}) {
  return (
    <div
      id={`apply-item-${item.id}`}
      className={[
        'scroll-mt-24 rounded-xl p-5 transition-all duration-200 relative',
        isFocused
          ? 'bg-zinc-100 border border-zinc-900 shadow-lg ring-1 ring-zinc-300 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl before:bg-zinc-900'
          : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {isFocused ? 'Focused item' : `Queue item #${index + 1}`}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-500">{item.company}</p>
          <h2 className="text-xl font-semibold text-zinc-900">{item.title}</h2>
          <p className="mt-1 text-sm text-zinc-600">{item.location}</p>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-700">
        <p>
          <span className="font-medium text-zinc-900">Why now:</span> {item.reason}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Latest score:</span>{' '}
          {item.latestScore !== null ? `${item.latestScore}/100` : 'Not scored'}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Assets:</span>{' '}
          {item.hasAssets ? 'Available' : 'Missing'}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Applied:</span>{' '}
          {formatDate(item.appliedAt)}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Follow-up 1:</span>{' '}
          {formatDate(item.followUp1Due)}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Follow-up 2:</span>{' '}
          {formatDate(item.followUp2Due)}
        </p>
      </div>

      <QuickActionButtons
        item={item}
        onGenerate={onGenerate}
        onStatusChange={onStatusChange}
        generating={generating}
        updatingStatus={updatingStatus}
      />
      <NotesForm item={item} />
    </div>
  )
}

export default function ApplyModeClient({
  items: initialItems = [],
}: ApplyModeClientProps) {
  const [items, setItems] = useState<ApplyItem[]>(initialItems)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null)
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)

  const autoGeneratedJobIdsRef = useRef<Set<string>>(new Set())

  const safeFocusedIndex = useMemo(() => {
    if (items.length === 0) return 0
    return Math.min(focusedIndex, items.length - 1)
  }, [focusedIndex, items])

  const focusedItem = items[safeFocusedIndex] ?? null

  const refreshItems = useCallback(async () => {
  try {
    setRefreshing(true)
    setError(null)

    const res = await fetch('/api/apply-mode/queue', {
      method: 'GET',
      cache: 'no-store',
    })

    const payload = (await res.json().catch(() => null)) as
      | { items?: ApplyItem[]; error?: string }
      | null

    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to refresh apply queue.')
    }

    const nextItems = (payload?.items ?? []).filter(
      (item): item is ApplyItem =>
        Boolean(
          item &&
            typeof item.id === 'string' &&
            typeof item.jobId === 'string' &&
            typeof item.title === 'string'
        )
    )

    setItems(nextItems)
    setFocusedIndex((current) =>
      nextItems.length === 0 ? 0 : Math.min(current, nextItems.length - 1)
    )
  } catch (err) {
    console.error(err)
    setError(
      err instanceof Error ? err.message : 'Could not refresh apply queue.'
    )
  } finally {
    setRefreshing(false)
  }
}, [])

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

        await refreshItems()
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
    [items, refreshItems, updatingJobId]
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

      // optimistic local patch
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

      await refreshItems()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Failed to generate assets.'
      )
    } finally {
      setGeneratingJobId(null)
    }
  },
  [generatingJobId, refreshItems]
)

  useEffect(() => {
    if (!focusedItem) return
    if (focusedItem.hasAssets) return
    if (generatingJobId) return
    if (autoGeneratedJobIdsRef.current.has(focusedItem.jobId)) return
    if ((focusedItem.latestScore ?? 0) < 70) return

    void generateAssets(focusedItem.jobId, 'auto')
  }, [focusedItem, generatingJobId, generateAssets])

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
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Queue is clear</h2>
          <p className="mt-2 text-sm text-zinc-600">
            No ready, applied, or interviewing items need attention right now.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/jobs" className="rounded border px-4 py-2 text-sm">
              Browse jobs
            </Link>
            <button
              type="button"
              onClick={() => void refreshItems()}
              disabled={refreshing}
              className="rounded border px-4 py-2 text-sm disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {focusedItem ? (
        <FocusPanel
          item={focusedItem}
          onGenerate={generateAssets}
          generating={generatingJobId === focusedItem.jobId}
        />
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-4">
        <KeyboardHelp />
        <button
          type="button"
          onClick={() => void refreshItems()}
          disabled={refreshing}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            generating={generatingJobId === item.jobId}
            updatingStatus={updatingJobId === item.jobId}
          />
        ))}
      </div>
    </>
  )
}