import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

type HomePageProps = {
  searchParams: Promise<{ error?: string; message?: string }>
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://apply-engine.com'

export const metadata: Metadata = {
  title: 'Job Application Tracker, Follow-Ups, and Search Reporting',
  description:
    'ApplyEngine is a job application tracker and workflow system for managing jobs, follow-ups, daily actions, and pipeline reporting.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'job application tracker',
    'job search tracker',
    'job application dashboard',
    'follow up tracker',
    'job search crm',
    'job application reporting',
  ],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'ApplyEngine | Job Application Tracker, Follow-Ups, and Reporting',
    description:
      'Track jobs, manage follow-ups, work your next actions, and understand job search performance with clearer reporting.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApplyEngine | Job Application Tracker, Follow-Ups, and Reporting',
    description:
      'Track jobs, manage follow-ups, work your next actions, and understand job search performance with clearer reporting.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </p>
  )
}

function SectionIntro({
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

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  )
}

function PricingCard({
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

function MetricTile({
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

function WindowCard({
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

function ProductPreview() {
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

function WorkflowStep({
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ApplyEngine',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description:
      'A job application tracker and workflow system for jobs, follow-ups, daily execution, dashboard visibility, and reporting.',
    offers: {
      '@type': 'Offer',
      price: '19.99',
      priceCurrency: 'USD',
    },
    featureList: [
      'Job application tracking',
      'Daily action queue',
      'Follow-up management',
      'Pipeline dashboard',
      'Job search reporting',
    ],
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-20 py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Run your job search on a real system, then choose the plan that fits.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              ApplyEngine keeps your opportunities organized, tells you what to work
              next, and shows whether the pipeline is actually moving. It is built
              for execution, follow-through, and better visibility across the whole
              search, with a 7-day free trial and simple Pro plans when you are ready.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login?plan=trial" className="app-button-primary">
              Start 7-Day Free Trial
            </Link>

            <a href="#pricing" className="app-button">
              View Plans
            </a>
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            <MetricTile
              label="Today"
              value="Action queue"
              tone="blue"
              compact
            />
            <MetricTile label="Dashboard" value="Pipeline view" compact />
            <MetricTile
              label="Reports"
              value="Performance trends"
              tone="emerald"
              compact
            />
          </div>

          {(params.error || params.message) && (
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
              {params.error ?? params.message}
            </div>
          )}
        </div>

        <ProductPreview />
      </section>

      <section id="pricing" className="space-y-8">
        <SectionIntro
          eyebrow="Pricing"
          title="Start with a free trial, then choose monthly or yearly Pro"
          description="Every plan gives you the same core ApplyEngine workflow. Start with a 7-day free trial, then continue monthly or save with yearly billing."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard
            title="Free Trial"
            price="7 days free"
            description="Create your account and start a 7-day Pro trial on the monthly plan. Cancel before renewal if it is not a fit."
            note="No charge until the 7-day trial ends."
            href="/login?plan=trial"
            cta="Sign Up For Trial"
            accent="blue"
          />
          <PricingCard
            title="Pro Monthly"
            price="$19.99/month"
            description="Flexible monthly access to your job search dashboard, follow-ups, workflow, and reporting."
            href="/login?plan=month"
            cta="Choose Monthly"
          />
          <PricingCard
            title="Pro Yearly"
            price="$99/year"
            description="Best value for long-term use. Keep the whole search system running for one lower yearly price."
            href="/login?plan=year"
            cta="Choose Yearly"
            accent="dark"
          />
        </div>
      </section>

      <section id="product" className="space-y-8">
        <SectionIntro
          eyebrow="Product"
          title="The whole search in one place, with clearer signals"
          description="ApplyEngine matches the workflow you are already managing: capture roles, move them through the pipeline, work the right next actions, and review what is converting."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            title="Jobs keeps the record clean"
            description="Track every role with its company, title, score, application state, follow-up timing, and supporting notes in one place."
          />
          <FeatureCard
            title="Today reduces decision fatigue"
            description="The Today view turns the pipeline into an action queue so you can work what matters now instead of constantly re-orienting."
          />
          <FeatureCard
            title="Follow-Ups stay visible"
            description="Due and overdue outreach is surfaced directly, with generated follow-up content and quick actions when it is time to move."
          />
          <FeatureCard
            title="Reports show whether the system is working"
            description="Track application rate, interview rate, offer rate, score distribution, and pipeline aging to see what is improving and what is stuck."
          />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="space-y-5">
          <SectionIntro
            eyebrow="Why it works"
            title="Built to make the search easier to run, not just easier to store"
            description="The interface is organized around movement through the pipeline, which means less context switching and fewer dropped opportunities."
          />

          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-zinc-950">You can see what needs attention now</p>
              <p className="mt-1 text-sm text-zinc-600">
                Overdue follow-ups, ready applications, and interview-stage work are
                surfaced before they disappear into the background.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-zinc-950">You can review the health of the search</p>
              <p className="mt-1 text-sm text-zinc-600">
                Dashboard and Reports make it easier to understand whether the
                pipeline is growing, converting, or stalling.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-zinc-950">You stop relying on memory</p>
              <p className="mt-1 text-sm text-zinc-600">
                Every role has a place, a status, and a trail of work, so progress
                does not depend on scattered tabs or mental overhead.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricTile label="Track" value="Jobs and scores" />
            <MetricTile label="Execute" value="Today queue" tone="blue" />
            <MetricTile label="Follow Through" value="Follow-up timing" tone="amber" />
            <MetricTile label="Measure" value="Reports and funnel" tone="emerald" />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionIntro
          eyebrow="Workflow"
          title="A simple loop for running the search"
          description="Capture opportunities, work the highest-value next step, and use the metrics to keep improving the pipeline."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <WorkflowStep
            step="1"
            title="Capture the opportunity"
            description="Add the job, generate a score, and keep the record structured from the beginning."
          />
          <WorkflowStep
            step="2"
            title="Work the next best action"
            description="Use Today and Follow-Ups to move applications forward without losing momentum."
          />
          <WorkflowStep
            step="3"
            title="Review the signal"
            description="Use Dashboard and Reports to understand conversion, urgency, and where to push next."
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-xl sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Start with a free trial, then keep the search moving.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-300">
            Create your account to start a 7-day trial, or choose monthly or yearly
            Pro and run your search like a system instead of a scramble.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?plan=trial"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
            >
              Start Free Trial
            </Link>

            <Link
              href="/login?plan=year"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Choose Yearly
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
