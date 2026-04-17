'use client'

import Link from 'next/link'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const PIPELINE_STAGE_STYLES = [
  {
    marker: 'bg-zinc-950',
    bar: 'bg-zinc-950',
    surface: 'from-zinc-50 to-white',
  },
  {
    marker: 'bg-blue-700',
    bar: 'bg-blue-700',
    surface: 'from-blue-50 to-white',
  },
  {
    marker: 'bg-sky-500',
    bar: 'bg-sky-500',
    surface: 'from-sky-50 to-white',
  },
  {
    marker: 'bg-cyan-500',
    bar: 'bg-cyan-500',
    surface: 'from-cyan-50 to-white',
  },
  {
    marker: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    surface: 'from-emerald-50 to-white',
  },
  {
    marker: 'bg-amber-500',
    bar: 'bg-amber-500',
    surface: 'from-amber-50 to-white',
  },
]

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

function compactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

type FlowNode = {
  id: string
  label: string
  value: number
  x: number
  y: number
  width: number
  height: number
  color: string
  labelSide?: 'left' | 'right' | 'box'
}

type FlowLink = {
  source: string
  target: string
  value: number
  color: string
  opacity?: number
}

function getStageValue(summary: ReportsSummary, label: string) {
  return summary.pipelineStages.find((stage) => stage.label === label)?.value ?? 0
}

function getOutcomeValue(summary: ReportsSummary, label: string) {
  return (
    summary.outcomeBreakdown.find((outcome) => outcome.label === label)?.value ??
    0
  )
}

function clampNonNegative(value: number) {
  return Math.max(value, 0)
}

function buildPresentationSankey(summary: ReportsSummary) {
  const captured = getStageValue(summary, 'Captured')
  const scored = getStageValue(summary, 'Scored')
  const ready = getStageValue(summary, 'Ready')
  const applied = getStageValue(summary, 'Applied')
  const interviewing = getStageValue(summary, 'Interviewing')
  const offers = getStageValue(summary, 'Offers')
  const accepted = getOutcomeValue(summary, 'accepted')
  const rejected = getOutcomeValue(summary, 'rejected')
  const ghosted = getOutcomeValue(summary, 'ghosted')
  const withdrawn = getOutcomeValue(summary, 'withdrawn')
  const closedNoInterview = rejected + ghosted + withdrawn

  const unscored = clampNonNegative(captured - scored)
  const notReady = clampNonNegative(scored - ready)
  const notApplied = clampNonNegative(ready - applied)
  const noInterviewYet = clampNonNegative(
    applied - interviewing - closedNoInterview
  )
  const noOfferYet = clampNonNegative(interviewing - offers)
  const offerPending = clampNonNegative(offers - accepted)
  const maxValue = Math.max(captured, 1)
  const nodeHeight = (value: number, max = 146) =>
    value > 0 ? Math.max(30, Math.round((value / maxValue) * max)) : 0

  const nodes: FlowNode[] = [
    {
      id: 'captured',
      label: 'Captured',
      value: captured,
      x: 76,
      y: 134,
      width: 34,
      height: nodeHeight(captured),
      color: '#059669',
      labelSide: 'left',
    },
    {
      id: 'scored',
      label: 'Scored',
      value: scored,
      x: 258,
      y: 136,
      width: 34,
      height: nodeHeight(scored),
      color: '#059669',
      labelSide: 'box',
    },
    {
      id: 'unscored',
      label: 'Unscored',
      value: unscored,
      x: 258,
      y: 44,
      width: 34,
      height: nodeHeight(unscored, 82),
      color: '#94a3b8',
      labelSide: 'right',
    },
    {
      id: 'ready',
      label: 'Ready',
      value: ready,
      x: 442,
      y: 136,
      width: 34,
      height: nodeHeight(ready),
      color: '#0ea5e9',
      labelSide: 'box',
    },
    {
      id: 'not-ready',
      label: 'Needs prep',
      value: notReady,
      x: 442,
      y: 48,
      width: 34,
      height: nodeHeight(notReady, 82),
      color: '#eab308',
      labelSide: 'right',
    },
    {
      id: 'applied',
      label: 'Applied',
      value: applied,
      x: 626,
      y: 154,
      width: 34,
      height: nodeHeight(applied),
      color: '#0284c7',
      labelSide: 'box',
    },
    {
      id: 'not-applied',
      label: 'Waiting to apply',
      value: notApplied,
      x: 626,
      y: 54,
      width: 34,
      height: nodeHeight(notApplied, 88),
      color: '#7dd3fc',
      labelSide: 'right',
    },
    {
      id: 'interviewing',
      label: 'Interviewing',
      value: interviewing,
      x: 812,
      y: 114,
      width: 34,
      height: nodeHeight(interviewing, 118),
      color: '#10b981',
      labelSide: 'box',
    },
    {
      id: 'no-interview',
      label: 'No interview yet',
      value: noInterviewYet,
      x: 812,
      y: 248,
      width: 34,
      height: nodeHeight(noInterviewYet, 116),
      color: '#bae6fd',
      labelSide: 'right',
    },
    {
      id: 'closed-no-interview',
      label: 'Closed without interview',
      value: closedNoInterview,
      x: 1000,
      y: 258,
      width: 34,
      height: nodeHeight(closedNoInterview, 96),
      color: '#fb7185',
      labelSide: 'right',
    },
    {
      id: 'offers',
      label: 'Offers',
      value: offers,
      x: 1000,
      y: 72,
      width: 34,
      height: nodeHeight(offers, 96),
      color: '#f59e0b',
      labelSide: 'box',
    },
    {
      id: 'no-offer',
      label: 'No offer yet',
      value: noOfferYet,
      x: 1000,
      y: 156,
      width: 34,
      height: nodeHeight(noOfferYet, 96),
      color: '#a7f3d0',
      labelSide: 'right',
    },
    {
      id: 'accepted',
      label: 'Accepted',
      value: accepted,
      x: 1124,
      y: 54,
      width: 34,
      height: nodeHeight(accepted, 88),
      color: '#16a34a',
      labelSide: 'right',
    },
    {
      id: 'offer-pending',
      label: 'Offer pending',
      value: offerPending,
      x: 1124,
      y: 132,
      width: 34,
      height: nodeHeight(offerPending, 88),
      color: '#fbbf24',
      labelSide: 'right',
    },
  ]

  const links: FlowLink[] = [
    {
      source: 'captured',
      target: 'scored',
      value: scored,
      color: '#86efac',
      opacity: 0.75,
    },
    {
      source: 'captured',
      target: 'unscored',
      value: unscored,
      color: '#cbd5e1',
      opacity: 0.75,
    },
    {
      source: 'scored',
      target: 'ready',
      value: ready,
      color: '#7dd3fc',
      opacity: 0.75,
    },
    {
      source: 'scored',
      target: 'not-ready',
      value: notReady,
      color: '#fde68a',
      opacity: 0.85,
    },
    {
      source: 'ready',
      target: 'applied',
      value: applied,
      color: '#7dd3fc',
      opacity: 0.8,
    },
    {
      source: 'ready',
      target: 'not-applied',
      value: notApplied,
      color: '#bae6fd',
      opacity: 0.8,
    },
    {
      source: 'applied',
      target: 'interviewing',
      value: interviewing,
      color: '#6ee7b7',
      opacity: 0.82,
    },
    {
      source: 'applied',
      target: 'no-interview',
      value: noInterviewYet,
      color: '#bae6fd',
      opacity: 0.85,
    },
    {
      source: 'applied',
      target: 'closed-no-interview',
      value: closedNoInterview,
      color: '#fecdd3',
      opacity: 0.9,
    },
    {
      source: 'interviewing',
      target: 'offers',
      value: offers,
      color: '#fcd34d',
      opacity: 0.85,
    },
    {
      source: 'interviewing',
      target: 'no-offer',
      value: noOfferYet,
      color: '#a7f3d0',
      opacity: 0.85,
    },
    {
      source: 'offers',
      target: 'accepted',
      value: accepted,
      color: '#86efac',
      opacity: 0.9,
    },
    {
      source: 'offers',
      target: 'offer-pending',
      value: offerPending,
      color: '#fde68a',
      opacity: 0.9,
    },
  ].filter((link) => link.value > 0)

  return { nodes, links, maxValue }
}

function nodeCenter(node: FlowNode) {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  }
}

function flowPath(source: FlowNode, target: FlowNode) {
  const sourcePoint = {
    x: source.x + source.width,
    y: source.y + source.height / 2,
  }
  const targetPoint = {
    x: target.x,
    y: target.y + target.height / 2,
  }
  const curve = Math.max((targetPoint.x - sourcePoint.x) * 0.55, 80)

  return [
    `M ${sourcePoint.x} ${sourcePoint.y}`,
    `C ${sourcePoint.x + curve} ${sourcePoint.y}`,
    `${targetPoint.x - curve} ${targetPoint.y}`,
    `${targetPoint.x} ${targetPoint.y}`,
  ].join(' ')
}

function PipelineFlowLabel({ node }: { node: FlowNode }) {
  const center = nodeCenter(node)
  const value = compactNumber(node.value)

  if (node.labelSide === 'box') {
    return (
      <g>
        <rect
          x={center.x - 48}
          y={center.y - 22}
          width={96}
          height={44}
          rx={7}
          fill="rgba(255,255,255,0.82)"
        />
        <text
          x={center.x}
          y={center.y - 4}
          fill="#18181b"
          fontSize={13}
          fontWeight={800}
          textAnchor="middle"
        >
          {node.label}
        </text>
        <text
          x={center.x}
          y={center.y + 13}
          fill="#18181b"
          fontSize={12}
          textAnchor="middle"
        >
          {value}
        </text>
      </g>
    )
  }

  const isLeft = node.labelSide === 'left'
  const x = isLeft ? node.x - 12 : node.x + node.width + 12
  const anchor = isLeft ? 'end' : 'start'

  return (
    <g>
      <text
        x={x}
        y={center.y - 5}
        fill="#18181b"
        fontSize={13}
        fontWeight={800}
        textAnchor={anchor}
      >
        {node.label}
      </text>
      <text
        x={x}
        y={center.y + 14}
        fill="#18181b"
        fontSize={12}
        textAnchor={anchor}
      >
        {value}
      </text>
    </g>
  )
}

function PipelineSankeyChart({ summary }: { summary: ReportsSummary }) {
  const { nodes, links, maxValue } = buildPresentationSankey(summary)
  const nodesById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-zinc-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Job pipeline report
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
            Pipeline Flow
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-600 sm:text-right">
          Captured jobs flowing into applications, interviews, offers, and
          visible stall points.
        </p>
      </div>

      {links.length === 0 ? (
        <div className="m-6 flex h-80 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-600">
          Add jobs and applications to populate the pipeline flow.
        </div>
      ) : (
        <div className="bg-white px-4 py-5">
          <svg
            viewBox="0 0 1180 360"
            role="img"
            aria-label="Job pipeline Sankey flow"
            className="block h-auto w-full"
          >
            <rect width="1180" height="360" fill="#ffffff" rx="24" />

            {links.map((link) => {
              const source = nodesById.get(link.source)
              const target = nodesById.get(link.target)
              if (!source || !target) return null

              return (
                <path
                  key={`${link.source}-${link.target}`}
                  d={flowPath(source, target)}
                  fill="none"
                  stroke={link.color}
                  strokeLinecap="butt"
                  strokeWidth={Math.max(7, (link.value / maxValue) * 118)}
                  opacity={link.opacity ?? 0.78}
                />
              )
            })}

            {nodes.map((node) =>
              node.value > 0 ? (
                <rect
                  key={node.id}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={node.color}
                />
              ) : null
            )}

            {nodes.map((node) =>
              node.value > 0 ? (
                <PipelineFlowLabel key={`${node.id}-label`} node={node} />
              ) : null
            )}
          </svg>
        </div>
      )}
    </section>
  )
}

function PipelineStageRow({
  label,
  value,
  conversionRate,
  dropOff,
  maxValue,
  index,
}: ReportsSummary['pipelineStages'][number] & {
  maxValue: number
  index: number
}) {
  const width = maxValue ? Math.max(6, Math.round((value / maxValue) * 100)) : 0
  const style = PIPELINE_STAGE_STYLES[index % PIPELINE_STAGE_STYLES.length]

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${style.surface} p-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${style.marker}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-950">{label}</p>
            <p className="text-xs text-zinc-500">
              {index === 0
                ? 'Starting volume'
                : `${conversionRate}% from previous stage`}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-3 sm:text-right">
          <p className="text-3xl font-semibold tracking-tight text-zinc-950">
            {compactNumber(value)}
          </p>
          {index > 0 ? (
            <p className="text-xs font-medium text-zinc-500">
              {dropOff} drop-off
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-zinc-200/70">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function ConversionStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'blue' | 'emerald' | 'amber'
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-200/70',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  }[tone]

  return (
    <div className={`rounded-2xl px-4 py-3 ring-1 ring-inset ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}%</p>
    </div>
  )
}

function PipelineConversionReport({ summary }: { summary: ReportsSummary }) {
  const maxValue = Math.max(
    ...summary.pipelineStages.map((stage) => stage.value),
    0
  )
  const applied =
    summary.pipelineStages.find((stage) => stage.label === 'Applied')?.value ?? 0
  const interviews =
    summary.pipelineStages.find((stage) => stage.label === 'Interviewing')
      ?.value ?? 0

  return (
    <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Job pipeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Applied to interview movement
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            A cumulative view of how many opportunities make it from capture into
            applications, interviews, and offers.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ConversionStat
              label="Captured to applied"
              value={summary.pipelineConversions.capturedToApplied}
              tone="blue"
            />
            <ConversionStat
              label="Applied to interview"
              value={summary.pipelineConversions.appliedToInterview}
              tone="emerald"
            />
            <ConversionStat
              label="Interview to offer"
              value={summary.pipelineConversions.interviewToOffer}
              tone="amber"
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Applications sent
              </p>
              <p className="mt-2 text-6xl font-semibold tracking-tight text-zinc-950">
                {compactNumber(applied)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Interviews reached
              </p>
              <p className="mt-2 text-6xl font-semibold tracking-tight text-emerald-600">
                {compactNumber(interviews)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {summary.pipelineStages.map((stage, index) => (
            <PipelineStageRow
              key={stage.label}
              {...stage}
              maxValue={maxValue}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
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
            value={summary.kpis.medianDaysToApply ?? 'n/a'}
            hint="Time from capture to application"
          />
        </div>
      </section>

      <PipelineSankeyChart summary={summary} />

      <PipelineConversionReport summary={summary} />

      <section className="grid gap-6 xl:grid-cols-2">
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
                          {item.location ?? 'n/a'}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">
                      {niceLabel(item.status)}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">
                      {item.score ?? 'n/a'}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{item.daysOpen}</td>
                    <td className="px-3 py-3 text-zinc-700">
                      {item.daysSinceApply ?? 'n/a'}
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
