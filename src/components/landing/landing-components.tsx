import Link from 'next/link'

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </p>
  )
}

export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-zinc-600">{description}</p>
    </div>
  )
}

export function FeatureCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  )
}

export function PricingCard({
  title,
  price,
  description,
  note,
  href,
  cta,
  accent = 'default',
}: {
  title: string
  price: string
  description: string
  note?: string
  href: string
  cta: string
  accent?: 'default' | 'dark' | 'blue'
}) {
  const classes =
    accent === 'dark'
      ? 'border-zinc-950 bg-zinc-950 text-white shadow-xl'
      : accent === 'blue'
        ? 'border-blue-200 bg-blue-50 shadow-sm'
        : 'border-zinc-200 bg-white shadow-sm'

  const textClass =
    accent === 'dark' ? 'text-zinc-300' : 'text-zinc-600'

  const buttonClass =
    accent === 'dark'
      ? 'inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100'
      : accent === 'blue'
        ? 'inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700'
        : 'inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50'

  return (
    <div className={`rounded-[1.75rem] border p-6 ${classes}`}>
      <p className="text-sm font-semibold tracking-tight">{title}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{price}</p>
      <div className="mt-3 min-h-[7.5rem]">
        <p className={`text-sm leading-6 ${textClass}`}>{description}</p>
        {note ? (
          <p className={`mt-2 text-xs font-medium ${textClass}`}>{note}</p>
        ) : null}
      </div>
      <Link href={href} className={`mt-4 ${buttonClass}`}>
        {cta}
      </Link>
    </div>
  )
}

export function MetricTile({
  label,
  value,
  tone = 'default',
  compact = false,
  previewCompact = false,
}: {
  label: string
  value: string
  tone?: 'default' | 'blue' | 'emerald' | 'amber' | 'rose'
  compact?: boolean
  previewCompact?: boolean
}) {
  const toneClass =
    tone === 'blue'
      ? 'border-blue-200 bg-blue-50'
      : tone === 'emerald'
        ? 'border-emerald-200 bg-emerald-50'
        : tone === 'amber'
          ? 'border-amber-200 bg-amber-50'
          : tone === 'rose'
            ? 'border-rose-200 bg-rose-50'
            : 'border-zinc-200 bg-white'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-2 font-semibold tracking-tight text-zinc-950 ${
          compact
            ? 'text-[1.05rem] leading-[1.2] sm:text-[1.15rem]'
            : previewCompact
              ? 'text-xl leading-[1.05] sm:text-[1.35rem]'
            : 'text-2xl'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function WindowCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {title}
          </p>
          <p className="mt-0.5 text-sm text-zinc-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function ProductPreview() {
  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 p-4 shadow-xl sm:p-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <WindowCard
          title="Today"
          subtitle="The next best actions across your search"
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-zinc-950">Recruiter follow-up due</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Northstar Labs · Frontend Engineer
                  </p>
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700">
                  Overdue
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-zinc-950">Application ready to submit</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Studio Eight · Web Developer
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                  Ready
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-zinc-950">Interview follow-through</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Harbor Health · Full-Stack Engineer
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  Interviewing
                </span>
              </div>
            </div>
          </div>
        </WindowCard>

        <WindowCard
          title="Dashboard"
          subtitle="A fast read on pipeline health"
        >
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg bg-zinc-200">
              <div className="flex h-4 w-full">
                <div className="w-[28%] bg-blue-500" />
                <div className="w-[42%] bg-sky-500" />
                <div className="w-[18%] bg-emerald-500" />
                <div className="w-[12%] bg-amber-400" />
              </div>
            </div>

            <div className="space-y-3">
              <MetricTile label="Ready" value="12" tone="blue" previewCompact />
              <MetricTile
                label="Applied"
                value="24"
                tone="default"
                previewCompact
              />
              <MetricTile
                label="Interviewing"
                value="7"
                tone="emerald"
                previewCompact
              />
              <MetricTile label="Overdue" value="4" tone="rose" previewCompact />
            </div>
          </div>
        </WindowCard>

        <div className="xl:col-span-2">
          <WindowCard
            title="Reports"
            subtitle="Track conversion and pipeline quality over time"
          >
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3">
                <MetricTile
                  label="Application Rate"
                  value="62%"
                  tone="blue"
                  previewCompact
                />
                <MetricTile
                  label="Interview Rate"
                  value="21%"
                  tone="emerald"
                  previewCompact
                />
                <MetricTile
                  label="Offer Rate"
                  value="8%"
                  tone="amber"
                  previewCompact
                />
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Weekly Snapshot
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">
                      Conversion is trending in the right direction.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    +12%
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-5 items-end gap-2">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-14 w-8 rounded-t-xl bg-zinc-300" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Mon
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-24 w-8 rounded-t-xl bg-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Tue
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-20 w-8 rounded-t-xl bg-sky-500" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Wed
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-[3.25rem] w-8 rounded-t-xl bg-emerald-500" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Thu
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-10 w-8 rounded-t-xl bg-amber-400" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Fri
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                      Volume
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">34 apps</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      Interviews
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">7 moving</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                      Offers
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">2 active</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-600">
                  Weekly activity, funnel shape, and score distribution in one place.
                </p>
              </div>
            </div>
          </WindowCard>
        </div>
      </div>
    </div>
  )
}

export function ScoreBreakdownVisual() {
  const rows = [
    { label: 'Skill match', value: '91%', width: '91%', tone: 'bg-blue-500' },
    { label: 'Seniority fit', value: '84%', width: '84%', tone: 'bg-emerald-500' },
    { label: 'Resume evidence', value: '77%', width: '77%', tone: 'bg-sky-500' },
    { label: 'Apply priority', value: 'High', width: '88%', tone: 'bg-amber-400' },
  ]

  return (
    <WindowCard
      title="Scoring"
      subtitle="A fit read before you spend the application energy"
    >
      <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Match Score
          </p>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-6xl font-semibold tracking-tight text-zinc-950">86</p>
            <p className="pb-2 text-sm font-medium text-zinc-500">/100</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-700">
            Strong frontend platform fit with a clear story for product velocity,
            systems thinking, and customer-facing polish.
          </p>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-zinc-950">{row.label}</p>
                <p className="text-sm font-semibold text-zinc-700">{row.value}</p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100">
                <div className={`h-full rounded-full ${row.tone}`} style={{ width: row.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </WindowCard>
  )
}

export function DocumentCreationVisual() {
  return (
    <WindowCard
      title="AI Draft Studio"
      subtitle="Tailored resume and cover letter drafts from one job record"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Resume
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                Product Frontend Resume
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              Ready
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-2 rounded-full bg-zinc-200" />
            <div className="h-2 w-10/12 rounded-full bg-zinc-200" />
            <div className="h-2 w-8/12 rounded-full bg-zinc-200" />
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs font-medium leading-5 text-blue-800">
                Highlights React, dashboard UX, automation, and reporting outcomes
                that map to the job description.
              </p>
            </div>
            <div className="h-2 w-11/12 rounded-full bg-zinc-200" />
            <div className="h-2 w-9/12 rounded-full bg-zinc-200" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Cover Letter
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                Company-specific draft
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
              Drafted
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm leading-6 text-zinc-700">
              I am excited by Studio Eight&apos;s focus on workflow tools because my
              recent work connects complex product logic with calm, efficient UI.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Tone
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">Confident</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Evidence
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">4 proof points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowCard>
  )
}

export function WorkflowStep({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  )
}
