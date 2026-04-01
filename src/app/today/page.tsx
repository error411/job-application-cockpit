import Link from 'next/link'
import { getActiveWorkflowApplications } from '@/lib/workflow/get-active-workflow-applications'
import {
  buildActionItems,
  rankActionItems,
  groupTodayActionItems,
} from '@/lib/applications/build-action-items'
import type { ActionQueueItem } from '@/lib/workflow/types'

function formatShortDate(value: string | null | undefined) {
  if (!value) return 'No date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getUrgencyLabel(item: ActionQueueItem) {
  switch (item.bucket) {
    case 'overdue':
      return 'Overdue'
    case 'today':
      return 'Due today'
    case 'apply_now':
      return 'Ready'
    case 'needs_attention':
      return 'Needs attention'
    case 'waiting':
      return 'Waiting'
    case 'snoozed':
      return 'Snoozed'
    default:
      return 'Queued'
  }
}

function getUrgencyTone(item: ActionQueueItem) {
  switch (item.bucket) {
    case 'overdue':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    case 'today':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
    case 'apply_now':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
    case 'needs_attention':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
    case 'waiting':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'snoozed':
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
    default:
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200'
  }
}

function getKindLabel(item: ActionQueueItem) {
  switch (item.kind) {
    case 'follow_up':
      return 'Follow-up'
    case 'apply':
      return 'Apply'
    case 'needs_tailoring':
      return 'Tailor + Apply'
    case 'waiting':
      return 'Waiting'
    case 'interview':
      return 'Interview'
    case 'stale_ready':
      return 'Stale Ready'
    default:
      return 'Action'
  }
}

function SummaryCard({
  label,
  value,
  hint,
  tone = 'zinc',
}: {
  label: string
  value: string | number
  hint: string
  tone?: 'red' | 'orange' | 'blue' | 'zinc'
}) {
  const toneClasses =
    tone === 'red'
      ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white'
      : tone === 'orange'
        ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'
        : tone === 'blue'
          ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-white'
          : 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100'

  return (
    <div className={`app-panel rounded-2xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function ActionCard({ item }: { item: ActionQueueItem }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getUrgencyTone(
                item
              )}`}
            >
              {getUrgencyLabel(item)}
            </span>

            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 ring-1 ring-zinc-200">
              {getKindLabel(item)}
            </span>

            {item.score !== null ? (
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200">
                Score {item.score}/100
              </span>
            ) : null}

            {item.dueDate ? (
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200">
                Due {formatShortDate(item.dueDate)}
              </span>
            ) : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-500">{item.company}</p>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
              {item.title}
            </h3>
            <p className="text-sm text-zinc-600">{item.location || 'No location'}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-3">
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Reason
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">{item.reason}</p>
          </div>

          {item.snoozedUntil ? (
            <p className="text-xs text-zinc-500">
              Snoozed until {formatShortDate(item.snoozedUntil)}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:w-[220px] lg:justify-end">
          <Link
            href={item.href}
            className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Open Job
          </Link>
        </div>
      </div>
    </article>
  )
}

function EmptyQueue() {
  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Today
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
          No active queue items
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Nothing urgent is currently surfaced. Add jobs, review ready items, or
          check Dashboard for overall pipeline state.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs/new"
            className="app-button-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            Add Job
          </Link>
          <Link
            href="/jobs"
            className="app-button inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
          >
            View Jobs
          </Link>
        </div>
      </div>
    </section>
  )
}

export default async function TodayPage() {
  const applications = await getActiveWorkflowApplications()
  const items = rankActionItems(buildActionItems(applications))
  const groups = groupTodayActionItems(items)

  const overdueCount = items.filter((item) => item.bucket === 'overdue').length
  const todayCount = items.filter((item) => item.bucket === 'today').length
  const readyCount = items.filter((item) => item.bucket === 'apply_now').length
  const snoozedCount = items.filter((item) => item.bucket === 'snoozed').length

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Today
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Daily queue
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Work the most useful items first: overdue follow-ups, due-today actions,
            ready applications, and deferred items that still need visibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/jobs/new" className="app-button-primary">
            Add Job
          </Link>
          <Link href="/" className="app-button">
            Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Overdue"
          value={overdueCount}
          hint="Follow-ups already past due."
          tone="red"
        />
        <SummaryCard
          label="Due Today"
          value={todayCount}
          hint="Follow-ups due today."
          tone="orange"
        />
        <SummaryCard
          label="Ready"
          value={readyCount}
          hint="Ready-to-apply items."
          tone="blue"
        />
        <SummaryCard
          label="Snoozed"
          value={snoozedCount}
          hint="Deferred items still visible for context."
          tone="zinc"
        />
      </section>

      {groups.length === 0 ? (
        <EmptyQueue />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section
              key={group.key}
              className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                    {group.label}
                  </h2>
                  <p className="text-sm text-zinc-600">
                    {group.items.length} item{group.items.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-5">
                {group.items.map((item) => (
                  <ActionCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Daily rhythm
          </h2>
          <p className="text-sm text-zinc-600">
            Keep Today focused on moving the pipeline, not browsing it.
          </p>
        </div>

        <div className="grid gap-3 pt-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <p className="text-sm font-medium text-zinc-900">Add 5 jobs</p>
            <p className="mt-1 text-sm text-zinc-600">
              Keep top-of-funnel input steady.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <p className="text-sm font-medium text-zinc-900">Review ready items</p>
            <p className="mt-1 text-sm text-zinc-600">
              Convert prepared opportunities into submissions.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <p className="text-sm font-medium text-zinc-900">Clear follow-ups</p>
            <p className="mt-1 text-sm text-zinc-600">
              Don’t let overdue outreach pile up.
            </p>
          </div>
          </div>
        </section>
      </main>
    )
  }