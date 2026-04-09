'use client'

import Link from 'next/link'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReportsSummary } from '@/lib/reports/get-report-summary'

const FUNNEL_COLORS = ['#0f172a', '#1d4ed8', '#0ea5e9', '#10b981', '#f59e0b', '#71717a']

const OUTCOME_COLORS: Record<string, string> = {
  landed_interview: '#3b82f6',
  offer: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#8b5cf6',
  ghosted: '#6b7280',
}

const STATUS_COLORS: Record<string, string> = {
  ready: '#3b82f6',
  applied: '#0ea5e9',
  interviewing: '#10b981',
  closed: '#71717a',
}

const SCORE_BUCKET_COLORS: Record<string, string> = {
  '85-100': '#10b981',
  '70-84': '#3b82f6',
  '55-69': '#f59e0b',
  '0-54': '#ef4444',
}

const AGING_BUCKET_COLORS: Record<string, string> = {
  '0-3d': '#10b981',
  '4-7d': '#3b82f6',
  '8-14d': '#f59e0b',
  '15d+': '#ef4444',
}

const TREND_COLORS = {
  jobsCaptured: '#1d4ed8',
  applied: '#0ea5e9',
  interviews: '#10b981',
  offers: '#f59e0b',
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
      </div>
      {children}
    </section>
  )
}

function niceLabel(value: string) {
  return value.replaceAll('_', ' ')
}

type ReportsDashboardProps = {
  summary: ReportsSummary
  rangeLabel: string
}

export function ReportsDashboard({
  summary,
  rangeLabel,
}: ReportsDashboardProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
            ApplyEngine Reports
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Pipeline performance at a glance
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Showing {rangeLabel.toLowerCase()} performance so you can see what is
            moving, what is stuck, and whether the search system is producing
            interviews and offers.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Active jobs"
            value={summary.totals.activeJobs}
            hint={`${summary.totals.totalJobs} total tracked`}
          />
          <MetricCard
            label="Application rate"
            value={`${summary.kpis.applicationRate}%`}
            hint="Applied relative to active captured jobs"
          />
          <MetricCard
            label="Interview rate"
            value={`${summary.kpis.interviewRate}%`}
            hint="How many applications convert into interview motion"
          />
          <MetricCard
            label="Offer rate"
            value={`${summary.kpis.offerRate}%`}
            hint="How often interviews turn into offers"
          />
          <MetricCard
            label="Median days to apply"
            value={summary.kpis.medianDaysToApply ?? '—'}
            hint="Time from capture to application"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Pipeline funnel"
          description="The shape of your pipeline from captured opportunities through closed outcomes."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={summary.funnel} isAnimationActive>
                  <LabelList
                    position="right"
                    fill="#18181b"
                    stroke="none"
                    dataKey="label"
                  />
                  {summary.funnel.map((entry, index) => (
                    <Cell
                      key={`funnel-cell-${entry.label}`}
                      fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
                    />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Outcome mix"
          description="Closed-out signal across interviews, offers, acceptance, rejection, withdrawal, and ghosting."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value, name) => [value, niceLabel(String(name))]}
                />
                <Legend formatter={(value) => niceLabel(String(value))} />
                <Pie
                  data={summary.outcomeBreakdown}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={2}
                >
                  {summary.outcomeBreakdown.map((entry) => (
                    <Cell
                      key={`outcome-cell-${entry.label}`}
                      fill={OUTCOME_COLORS[entry.label] ?? '#94a3b8'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Status load"
          description="What is currently sitting in Ready, Applied, Interviewing, and Closed."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.statusBreakdown}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickFormatter={niceLabel} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [value, niceLabel(String(name))]}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {summary.statusBreakdown.map((entry) => (
                    <Cell
                      key={`status-cell-${entry.label}`}
                      fill={STATUS_COLORS[entry.label] ?? '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard
          title="Weekly momentum"
          description="Are you capturing enough opportunities and converting them into applications, interviews, and offers?"
        >
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.weeklyActivity}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="jobsCaptured"
                  name="Jobs captured"
                  stroke={TREND_COLORS.jobsCaptured}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="applied"
                  name="Applied"
                  stroke={TREND_COLORS.applied}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="interviews"
                  name="Interviews"
                  stroke={TREND_COLORS.interviews}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="offers"
                  name="Offers"
                  stroke={TREND_COLORS.offers}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard
            title="Score distribution"
            description="How your fit scoring is distributed right now."
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.scoreBuckets}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {summary.scoreBuckets.map((entry) => (
                      <Cell
                        key={`score-cell-${entry.label}`}
                        fill={SCORE_BUCKET_COLORS[entry.label] ?? '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Pipeline aging"
            description="Open work aging across the pipeline."
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.agingBuckets}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {summary.agingBuckets.map((entry) => (
                      <Cell
                        key={`aging-cell-${entry.label}`}
                        fill={AGING_BUCKET_COLORS[entry.label] ?? '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-950">
            Stuck opportunities
          </h2>
          <p className="text-sm text-zinc-600">
            Older items and high-score ready jobs that probably need attention now.
          </p>
        </div>

        {summary.stuckOpportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-600">
            Nothing looks materially stuck right now.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Company</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Score</th>
                  <th className="px-3 py-3 font-medium">Days Open</th>
                  <th className="px-3 py-3 font-medium">Days Since Apply</th>
                </tr>
              </thead>
              <tbody>
                {summary.stuckOpportunities.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-zinc-900">
                      <Link
                        href={`/jobs/${item.jobId}`}
                        className="transition hover:text-zinc-600 hover:underline"
                      >
                        {item.company}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">
                      <Link
                        href={`/jobs/${item.jobId}`}
                        className="block transition hover:text-zinc-600"
                      >
                        <div>{item.title}</div>
                        <div className="text-xs text-zinc-500">
                          {item.location ?? '—'}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">
                      {niceLabel(item.status)}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">
                      {item.score ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{item.daysOpen}</td>
                    <td className="px-3 py-3 text-zinc-700">
                      {item.daysSinceApply ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}