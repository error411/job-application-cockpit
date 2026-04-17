import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/lib/supabase/schema'
import {
  isApplicationDisposition,
  isApplicationStatus,
  type ApplicationDisposition,
  type ApplicationStatus,
} from '@/lib/statuses'

type JobRow = Tables<'jobs'>
type ApplicationRow = Tables<'applications'>
type JobScoreRow = Tables<'job_scores'>

type ReportJob = Pick<
  JobRow,
  'id' | 'company' | 'title' | 'location' | 'status' | 'created_at' | 'updated_at' | 'archived_at'
>

type ReportApplication = Pick<
  ApplicationRow,
  | 'id'
  | 'job_id'
  | 'status'
  | 'disposition'
  | 'applied_at'
  | 'created_at'
  | 'updated_at'
  | 'disposition_at'
  | 'follow_up_1_due'
  | 'follow_up_2_due'
  | 'follow_up_1_sent_at'
  | 'follow_up_2_sent_at'
> & {
  jobs: ReportJob | ReportJob[] | null
}

type NormalizedReportApplication = Omit<ReportApplication, 'status' | 'disposition'> & {
  status: ApplicationStatus
  disposition: ApplicationDisposition | null
  job: ReportJob | null
}

type ReportJobScore = Pick<JobScoreRow, 'id' | 'job_id' | 'score' | 'created_at'>

export type ReportRange = '7d' | '30d' | '90d' | 'all'

export type ReportsSummary = {
  generatedAt: string
  totals: {
    totalJobs: number
    activeJobs: number
    archivedJobs: number
    totalApplications: number
    activeApplications: number
    closedApplications: number
    overdueFollowUps: number
    dueThisWeek: number
  }
  kpis: {
    applicationRate: number
    interviewRate: number
    offerRate: number
    acceptanceRate: number
    medianDaysToApply: number | null
  }
  pipelineStages: Array<{
    label: string
    value: number
    conversionRate: number
    dropOff: number
  }>
  pipelineConversions: {
    capturedToApplied: number
    appliedToInterview: number
    interviewToOffer: number
  }
  funnel: Array<{ label: string; value: number }>
  outcomeBreakdown: Array<{ label: string; value: number }>
  statusBreakdown: Array<{ label: string; value: number }>
  weeklyActivity: Array<{
    week: string
    jobsCaptured: number
    applied: number
    interviews: number
    offers: number
  }>
  scoreBuckets: Array<{ label: string; value: number }>
  agingBuckets: Array<{ label: string; value: number }>
  stuckOpportunities: Array<{
    id: string
    jobId: string
    company: string
    title: string
    location: string | null
    status: ApplicationStatus
    daysOpen: number
    daysSinceApply: number | null
    score: number | null
  }>
}

const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = ['ready', 'applied', 'interviewing']
const CLOSED_APPLICATION_STATUS: ApplicationStatus = 'closed'
const INTERVIEW_DISPOSITION: ApplicationDisposition = 'landed_interview'
const OFFER_DISPOSITION: ApplicationDisposition = 'offer'
const ACCEPTED_DISPOSITION: ApplicationDisposition = 'accepted'

function normalizeJob(value: ReportJob | ReportJob[] | null): ReportJob | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function normalizeApplicationStatus(value: string | null): ApplicationStatus {
  if (value && isApplicationStatus(value)) return value
  return 'ready'
}

function normalizeDisposition(value: string | null): ApplicationDisposition | null {
  if (value && isApplicationDisposition(value)) return value
  return null
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(start: string | null | undefined, end: string | null | undefined): number | null {
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  if (!startDate || !endDate) return null
  const diffMs = endDate.getTime() - startDate.getTime()
  return diffMs >= 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : null
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    const left = sorted[mid - 1]
    const right = sorted[mid]
    if (left == null || right == null) return null
    return Math.round((left + right) / 2)
  }

  return sorted[mid] ?? null
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 100)
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function endOfWeek(from = new Date()): Date {
  const d = new Date(from)
  const day = d.getDay()
  const diff = 6 - day
  d.setDate(d.getDate() + diff)
  d.setHours(23, 59, 59, 999)
  return d
}

function isPast(dateLike: string | null | undefined): boolean {
  const date = parseDate(dateLike)
  if (!date) return false
  return date < startOfToday()
}

function isThisWeek(dateLike: string | null | undefined): boolean {
  const date = parseDate(dateLike)
  if (!date) return false
  const start = startOfToday()
  const end = endOfWeek(start)
  return date >= start && date <= end
}

function weekKey(dateLike: string | null | undefined): string | null {
  const date = parseDate(dateLike)
  if (!date) return null

  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)

  return d.toISOString().slice(0, 10)
}

function scoreBucket(score: number): '85-100' | '70-84' | '55-69' | '0-54' {
  if (score >= 85) return '85-100'
  if (score >= 70) return '70-84'
  if (score >= 55) return '55-69'
  return '0-54'
}

function agingBucket(days: number): '0-3d' | '4-7d' | '8-14d' | '15d+' {
  if (days <= 3) return '0-3d'
  if (days <= 7) return '4-7d'
  if (days <= 14) return '8-14d'
  return '15d+'
}

function getRangeDays(range: Exclude<ReportRange, 'all'>): number {
  if (range === '7d') return 7
  if (range === '30d') return 30
  return 90
}

function isWithinRange(dateLike: string | null | undefined, range: ReportRange): boolean {
  if (range === 'all') return true

  const date = parseDate(dateLike)
  if (!date) return false

  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - getRangeDays(range))

  return date >= cutoff
}

function isJobConsideredScored(
  job: ReportJob,
  scoreByJobId: Map<string, number>
): boolean {
  return (
    scoreByJobId.has(job.id) ||
    job.status === 'scored' ||
    job.status === 'assets_generated' ||
    job.status === 'ready_to_apply'
  )
}

export async function getReportSummary(
  supabase: SupabaseClient<Database>,
  range: ReportRange = '90d'
): Promise<ReportsSummary> {
  const [jobsResult, applicationsResult, scoresResult] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, company, title, location, status, created_at, updated_at, archived_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('applications')
      .select(`
        id,
        job_id,
        status,
        disposition,
        applied_at,
        created_at,
        updated_at,
        disposition_at,
        follow_up_1_due,
        follow_up_2_due,
        follow_up_1_sent_at,
        follow_up_2_sent_at,
        jobs:jobs!applications_job_id_fkey (
          id,
          company,
          title,
          location,
          status,
          created_at,
          updated_at,
          archived_at
        )
      `)
      .order('created_at', { ascending: true }),
    supabase
      .from('job_scores')
      .select('id, job_id, score, created_at')
      .order('created_at', { ascending: true }),
  ])

  if (jobsResult.error) throw new Error(jobsResult.error.message)
  if (applicationsResult.error) throw new Error(applicationsResult.error.message)
  if (scoresResult.error) throw new Error(scoresResult.error.message)

  const allJobs = ((jobsResult.data ?? []) as ReportJob[]).filter(Boolean)

  type NormalizedReportApplicationWithJob = NormalizedReportApplication & {
  job: ReportJob
}

const allApplications: NormalizedReportApplicationWithJob[] = (
  (applicationsResult.data ?? []) as ReportApplication[]
)
  .map((app): NormalizedReportApplication => {
    const job = normalizeJob(app.jobs)

    return {
      ...app,
      status: normalizeApplicationStatus(app.status),
      disposition: normalizeDisposition(app.disposition),
      job,
    }
  })
  .filter(
    (app): app is NormalizedReportApplicationWithJob =>
      app.job != null && app.job.archived_at == null
  )

  const allScores = (scoresResult.data ?? []) as ReportJobScore[]

  const jobs =
    range === 'all'
      ? allJobs
      : allJobs.filter((job) => isWithinRange(job.created_at, range))

  const jobIdsInRange = new Set(jobs.map((job) => job.id))

  const applications =
    range === 'all'
      ? allApplications
      : allApplications.filter((app) => {
          if (jobIdsInRange.has(app.job_id)) return true

          return (
            isWithinRange(app.created_at, range) ||
            isWithinRange(app.applied_at, range) ||
            isWithinRange(app.disposition_at, range) ||
            isWithinRange(app.updated_at, range)
          )
        })

  const scores =
    range === 'all'
      ? allScores
      : allScores.filter(
          (score) => jobIdsInRange.has(score.job_id) || isWithinRange(score.created_at, range)
        )

  const scoreByJobId = new Map<string, number>()
  for (const score of scores) {
    scoreByJobId.set(score.job_id, score.score)
  }

  const totalJobs = jobs.length
  const activeJobs = jobs.filter((job) => job.archived_at == null).length
  const archivedJobs = jobs.filter((job) => job.archived_at != null).length

  const activeApplications = applications.filter((app) =>
    ACTIVE_APPLICATION_STATUSES.includes(app.status)
  )

  const closedApplications = applications.filter(
    (app) => app.status === CLOSED_APPLICATION_STATUS
  )

  const overdueFollowUps = activeApplications.filter(
    (app) => isPast(app.follow_up_1_due) || isPast(app.follow_up_2_due)
  ).length

  const dueThisWeek = activeApplications.filter(
    (app) => isThisWeek(app.follow_up_1_due) || isThisWeek(app.follow_up_2_due)
  ).length

  const interviewedCount = applications.filter(
    (app) => app.status === 'interviewing' || app.disposition === INTERVIEW_DISPOSITION
  ).length

  const offerCount = applications.filter(
    (app) => app.disposition === OFFER_DISPOSITION
  ).length

  const acceptedCount = applications.filter(
    (app) => app.disposition === ACCEPTED_DISPOSITION
  ).length

  const appliedCount = applications.filter(
    (app) =>
      app.applied_at != null ||
      app.status === 'applied' ||
      app.status === 'interviewing' ||
      app.status === 'closed'
  ).length

  const scoredCount = jobs.filter(
    (job) => job.archived_at == null && isJobConsideredScored(job, scoreByJobId)
  ).length

  const readyOrLaterCount = applications.length

  const medianApplyDays = median(
    applications
      .map((app) => daysBetween(app.job.created_at, app.applied_at))
      .filter((value): value is number => value != null)
  )

  const funnel: Array<{ label: string; value: number }> = [
    { label: 'Captured', value: activeJobs },
    { label: 'Scored', value: scoredCount },
    {
      label: 'Ready',
      value: activeApplications.filter((app) => app.status === 'ready').length,
    },
    {
      label: 'Applied',
      value: activeApplications.filter((app) => app.status === 'applied').length,
    },
    {
      label: 'Interviewing',
      value: activeApplications.filter((app) => app.status === 'interviewing').length,
    },
    { label: 'Closed', value: closedApplications.length },
  ]

  const pipelineStageCounts = [
    { label: 'Captured', value: activeJobs },
    { label: 'Scored', value: scoredCount },
    { label: 'Ready', value: readyOrLaterCount },
    { label: 'Applied', value: appliedCount },
    { label: 'Interviewing', value: interviewedCount },
    { label: 'Offers', value: offerCount },
  ]

  const pipelineStages = pipelineStageCounts.map((stage, index) => {
    const previousValue = index === 0 ? stage.value : pipelineStageCounts[index - 1]?.value ?? 0

    return {
      ...stage,
      conversionRate: index === 0 ? 100 : pct(stage.value, previousValue),
      dropOff: Math.max(previousValue - stage.value, 0),
    }
  })

  const outcomeLabels: ApplicationDisposition[] = [
    'landed_interview',
    'offer',
    'accepted',
    'rejected',
    'withdrawn',
    'ghosted',
  ]

  const outcomeBreakdown = outcomeLabels.map((label) => ({
    label,
    value: applications.filter((app) => app.disposition === label).length,
  }))

  const statusBreakdown: Array<{ label: string; value: number }> = [
    { label: 'ready', value: applications.filter((app) => app.status === 'ready').length },
    { label: 'applied', value: applications.filter((app) => app.status === 'applied').length },
    {
      label: 'interviewing',
      value: applications.filter((app) => app.status === 'interviewing').length,
    },
    { label: 'closed', value: applications.filter((app) => app.status === 'closed').length },
  ]

  const weeklyMap = new Map<
    string,
    { week: string; jobsCaptured: number; applied: number; interviews: number; offers: number }
  >()

  function bump(
    week: string | null,
    field: 'jobsCaptured' | 'applied' | 'interviews' | 'offers'
  ) {
    if (!week) return

    const existing = weeklyMap.get(week) ?? {
      week,
      jobsCaptured: 0,
      applied: 0,
      interviews: 0,
      offers: 0,
    }

    existing[field] += 1
    weeklyMap.set(week, existing)
  }

  for (const job of jobs.filter((job) => job.archived_at == null)) {
    bump(weekKey(job.created_at), 'jobsCaptured')
  }

  for (const app of applications) {
    if (app.applied_at) bump(weekKey(app.applied_at), 'applied')

    if (app.disposition === INTERVIEW_DISPOSITION || app.status === 'interviewing') {
      bump(weekKey(app.disposition_at ?? app.updated_at), 'interviews')
    }

    if (app.disposition === OFFER_DISPOSITION) {
      bump(weekKey(app.disposition_at ?? app.updated_at), 'offers')
    }
  }

  const weeklyActivity = [...weeklyMap.values()]
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-10)

  const scoreBuckets: Array<{ label: '85-100' | '70-84' | '55-69' | '0-54'; value: number }> = [
    { label: '85-100', value: 0 },
    { label: '70-84', value: 0 },
    { label: '55-69', value: 0 },
    { label: '0-54', value: 0 },
  ]

  for (const score of scores) {
    const bucket = scoreBucket(score.score)
    const target = scoreBuckets.find((item) => item.label === bucket)
    if (target) target.value += 1
  }

  const now = new Date()

  const agingBuckets: Array<{ label: '0-3d' | '4-7d' | '8-14d' | '15d+'; value: number }> = [
    { label: '0-3d', value: 0 },
    { label: '4-7d', value: 0 },
    { label: '8-14d', value: 0 },
    { label: '15d+', value: 0 },
  ]

  const stuckOpportunities = activeApplications
    .map((app) => {
      const baseDate =
        parseDate(app.applied_at) ??
        parseDate(app.job.updated_at) ??
        parseDate(app.created_at) ??
        now

      const daysOpen = Math.max(
        0,
        Math.round((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
      )

      const bucket = agingBucket(daysOpen)
      const agingTarget = agingBuckets.find((item) => item.label === bucket)
      if (agingTarget) agingTarget.value += 1

      return {
        id: app.id,
        jobId: app.job.id,
        company: app.job.company ?? 'Unknown company',
        title: app.job.title ?? 'Unknown title',
        location: app.job.location ?? null,
        status: app.status,
        daysOpen,
        daysSinceApply: daysBetween(app.applied_at, now.toISOString()),
        score: scoreByJobId.get(app.job.id) ?? null,
      }
    })
    .filter((app) => app.daysOpen >= 7 || (app.status === 'ready' && (app.score ?? 0) >= 70))
    .sort((a, b) => {
      const scoreA = a.score ?? -1
      const scoreB = b.score ?? -1

      if (b.daysOpen !== a.daysOpen) return b.daysOpen - a.daysOpen
      return scoreB - scoreA
    })
    .slice(0, 8)

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      totalJobs,
      activeJobs,
      archivedJobs,
      totalApplications: applications.length,
      activeApplications: activeApplications.length,
      closedApplications: closedApplications.length,
      overdueFollowUps,
      dueThisWeek,
    },
    kpis: {
      applicationRate: pct(
        applications.filter((app) => app.applied_at != null).length,
        activeJobs
      ),
      interviewRate: pct(
        interviewedCount,
        applications.filter((app) => app.applied_at != null).length
      ),
      offerRate: pct(
        offerCount,
        interviewedCount || applications.filter((app) => app.applied_at != null).length
      ),
      acceptanceRate: pct(acceptedCount, offerCount),
      medianDaysToApply: medianApplyDays,
    },
    pipelineStages,
    pipelineConversions: {
      capturedToApplied: pct(appliedCount, activeJobs),
      appliedToInterview: pct(interviewedCount, appliedCount),
      interviewToOffer: pct(offerCount, interviewedCount),
    },
    funnel,
    outcomeBreakdown,
    statusBreakdown,
    weeklyActivity,
    scoreBuckets,
    agingBuckets,
    stuckOpportunities,
  }
}
