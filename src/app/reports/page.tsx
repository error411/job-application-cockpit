import { requireUser } from '@/lib/auth/require-user'
import {
  getReportSummary,
  type ReportRange,
} from '@/lib/reports/get-report-summary'
import { ReportRangeFilter } from './_components/report-range-filter'
import { ReportsDashboard } from './_components/reports-dashboard'

function normalizeRange(value: string | undefined): ReportRange {
  if (value === '7d' || value === '30d' || value === '90d' || value === 'all') {
    return value
  }
  return '90d'
}

function getRangeLabel(range: ReportRange): string {
  if (range === '7d') return 'Last 7 days'
  if (range === '30d') return 'Last 30 days'
  if (range === '90d') return 'Last 90 days'
  return 'All time'
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const range = normalizeRange(params?.range)
  const rangeLabel = getRangeLabel(range)

  const { supabase } = await requireUser()
  const summary = await getReportSummary(supabase, range)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(244,244,245,1)_55%,_rgba(228,228,231,1))] px-6 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Reporting
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Reports
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              Review pipeline performance, application outcomes, and activity trends across{' '}
              {rangeLabel.toLowerCase()}.
            </p>
          </div>
          <ReportRangeFilter currentRange={range} />
        </div>

        <ReportsDashboard
          summary={summary}
          rangeLabel={rangeLabel}
        />
      </div>
    </main>
  )
}
