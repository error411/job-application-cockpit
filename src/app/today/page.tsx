import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

type DbApplicationRow = Tables<'applications'>
type JobRow = Tables<'jobs'>
type DbJobScoreRow = Tables<'job_scores'>

type TodayJob = Pick<JobRow, 'id' | 'company' | 'title' | 'location'>

type RawApplicationRow = Pick<
  DbApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'notes'
  | 'updated_at'
> & {
  jobs: TodayJob | TodayJob[] | null
}

type TodayApplicationRow = Pick<
  DbApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'applied_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'notes'
  | 'updated_at'
> & {
  job: TodayJob | null
}

type TodayJobScoreRow = Pick<DbJobScoreRow, 'job_id' | 'score' | 'created_at'>

type TodayItem = {
  kind: 'follow_up' | 'application'
  id: string
  jobId: string
  company: string
  title: string
  location: string
  status: string
  score: number | null
  reason: string
  priorityScore: number
  href: string
  dueDate?: string | null
}

function startOfTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function endOfTodayLocal(): Date {
  const start = startOfTodayLocal()
  return new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    23,
    59,
    59,
    999
  )
}

function isDateToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const start = startOfTodayLocal()
  const end = endOfTodayLocal()
  return date >= start && date <= end
}

function isDatePast(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return date < startOfTodayLocal()
}

function daysSince(dateString: string | null | undefined): number | null {
  if (!dateString) return null
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString()
}

function normalizeJob(value: TodayJob | TodayJob[] | null): TodayJob | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function toTodayApplicationRow(row: RawApplicationRow): TodayApplicationRow {
  return {
    id: row.id,
    job_id: row.job_id,
    status: row.status,
    applied_at: row.applied_at,
    follow_up_1_due: row.follow_up_1_due,
    follow_up_2_due: row.follow_up_2_due,
    notes: row.notes,
    updated_at: row.updated_at,
    job: normalizeJob(row.jobs),
  }
}

function buildLatestScoresMap(scores: TodayJobScoreRow[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const row of scores) {
    if (!map.has(row.job_id)) {
      map.set(row.job_id, row.score)
    }
  }

  return map
}

function buildTodayItems(
  applications: TodayApplicationRow[],
  latestScoresByJobId: Map<string, number>
): TodayItem[] {
  const items: TodayItem[] = []

  for (const row of applications) {
    const job = row.job
    const score = latestScoresByJobId.get(row.job_id) ?? null
    const scoreBoost = score ?? 0
    const age = daysSince(row.applied_at)

    const company = job?.company ?? 'Unknown company'
    const title = job?.title ?? 'Untitled role'
    const location = job?.location ?? '—'

    if (
      row.follow_up_1_due &&
      (isDateToday(row.follow_up_1_due) || isDatePast(row.follow_up_1_due))
    ) {
      const overdue = isDatePast(row.follow_up_1_due)

      items.push({
        kind: 'follow_up',
        id: `${row.id}-fu1`,
        jobId: row.job_id,
        company,
        title,
        location,
        status: row.status ?? 'unknown',
        score,
        reason: overdue ? 'Follow-up 1 overdue' : 'Follow-up 1 due today',
        priorityScore: overdue ? 100 + scoreBoost : 85 + scoreBoost,
        href: '/follow-ups',
        dueDate: row.follow_up_1_due,
      })
    }

    if (
      row.follow_up_2_due &&
      (isDateToday(row.follow_up_2_due) || isDatePast(row.follow_up_2_due))
    ) {
      const overdue = isDatePast(row.follow_up_2_due)

      items.push({
        kind: 'follow_up',
        id: `${row.id}-fu2`,
        jobId: row.job_id,
        company,
        title,
        location,
        status: row.status ?? 'unknown',
        score,
        reason: overdue ? 'Follow-up 2 overdue' : 'Follow-up 2 due today',
        priorityScore: overdue ? 95 + scoreBoost : 80 + scoreBoost,
        href: '/follow-ups',
        dueDate: row.follow_up_2_due,
      })
    }

    if (row.status === 'ready') {
      items.push({
        kind: 'application',
        id: row.id,
        jobId: row.job_id,
        company,
        title,
        location,
        status: row.status ?? 'unknown',
        score,
        reason: 'Ready to apply',
        priorityScore: 60 + scoreBoost,
        href: '/applications',
      })
    }

    if (row.status === 'applied' && age !== null && age >= 5 && age <= 10) {
      items.push({
        kind: 'application',
        id: `${row.id}-applied-window`,
        jobId: row.job_id,
        company,
        title,
        location,
        status: row.status ?? 'unknown',
        score,
        reason: `Applied ${age} days ago — follow-up window active`,
        priorityScore: 50 + scoreBoost,
        href: '/follow-ups',
      })
    }
  }

  return items.sort((a, b) => b.priorityScore - a.priorityScore)
}

function PriorityCard({ item }: { item: TodayItem }) {
  return (
    <Link
      href={item.href}
      className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{item.company}</p>
          <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
          <p className="mt-1 text-sm text-zinc-600">{item.location}</p>
        </div>

        <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {item.kind === 'follow_up' ? 'Follow-up' : 'Application'}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-700">
        <p>
          <span className="font-medium text-zinc-900">Reason:</span> {item.reason}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Status:</span> {item.status}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Latest Score:</span>{' '}
          {item.score !== null ? `${item.score}/100` : 'Not scored'}
        </p>
        {item.dueDate ? (
          <p>
            <span className="font-medium text-zinc-900">Due:</span>{' '}
            {formatDate(item.dueDate)}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export default async function TodayPage() {
  const supabase = await createClient()

  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select(`
      id,
      job_id,
      status,
      applied_at,
      follow_up_1_due,
      follow_up_2_due,
      notes,
      updated_at,
      jobs:jobs!applications_job_id_fkey (
        id,
        company,
        title,
        location
      )
    `)
    .order('updated_at', { ascending: false })

  if (applicationsError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Today</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Failed to load today priorities.</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm">
            {applicationsError.message}
          </pre>
        </div>
      </main>
    )
  }

  const typedApplications = ((applications ?? []) as RawApplicationRow[]).map(
    toTodayApplicationRow
  )

  const jobIds = typedApplications.map((row) => row.job_id)

  let latestScoresByJobId = new Map<string, number>()

  if (jobIds.length > 0) {
    const { data: scores, error: scoresError } = await supabase
      .from('job_scores')
      .select('job_id, score, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      return (
        <main className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Today</h1>
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Failed to load today priorities.</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm">
              {scoresError.message}
            </pre>
          </div>
        </main>
      )
    }

    const typedScores: TodayJobScoreRow[] = scores ?? []
    latestScoresByJobId = buildLatestScoresMap(typedScores)
  }

  const items = buildTodayItems(typedApplications, latestScoresByJobId)

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Today</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Highest-priority actions based on application status, follow-up due dates,
            and job score.
          </p>
        </div>

        <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {items.length} priority {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Nothing urgent today</h2>
          <p className="mt-2 text-sm text-zinc-600">
            No due follow-ups and no applications currently match the priority rules.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/applications"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              View applications
            </Link>

            <Link
              href="/follow-ups"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              View follow-ups
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <PriorityCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  )
}