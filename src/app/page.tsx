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
  title: 'AI Job Application Tracker, Resume Builder, and Job Scoring',
  description:
    'ApplyEngine is an AI job application cockpit for scoring jobs, creating tailored resumes and cover letters, managing follow-ups, and reporting on your search.',
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
    'ai resume builder',
    'ai cover letter generator',
    'job match scoring',
  ],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'ApplyEngine | AI Job Scoring, Resumes, Cover Letters, and Tracking',
    description:
      'Score opportunities, generate tailored resumes and cover letters, manage follow-ups, and understand job search performance with clearer reporting.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApplyEngine | AI Job Scoring, Resumes, Cover Letters, and Tracking',
    description:
      'Score opportunities, generate tailored resumes and cover letters, manage follow-ups, and understand job search performance with clearer reporting.',
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

function ScoreBreakdownVisual() {
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

function DocumentCreationVisual() {
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
      'An AI job application cockpit for scoring jobs, generating tailored resumes and cover letters, managing follow-ups, and reporting on search performance.',
    offers: {
      '@type': 'Offer',
      price: '19.99',
      priceCurrency: 'USD',
    },
    featureList: [
      'Job application tracking',
      'AI job match scoring',
      'Tailored resume generation',
      'AI cover letter generation',
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
              Score each role, create tailored application assets, and run the search from one cockpit.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              ApplyEngine helps you decide which jobs deserve your energy, then
              turns your profile and each job description into a focused resume and
              cover letter draft. Keep the pipeline organized, work the right next
              action, and see whether your search is actually moving.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login?plan=trial" className="app-button-primary">
              Start 7-Day Free Trial
            </Link>

            <a href="#pricing" className="app-button">
              View Plans
            </a>

            <a href="#ai-workflow" className="app-button">
              See AI Workflow
            </a>
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            <MetricTile
              label="Score"
              value="Job fit"
              tone="blue"
              compact
            />
            <MetricTile label="Create" value="Resume drafts" compact />
            <MetricTile
              label="Send"
              value="Cover letters"
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

      <section id="ai-workflow" className="space-y-8">
        <SectionIntro
          eyebrow="AI workflow"
          title="Know what to apply to, then create stronger application assets"
          description="ApplyEngine brings the judgment and the production work together: score a role against your profile, understand the reason behind the fit, and generate application materials that speak directly to the opportunity."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <FeatureCard
            eyebrow="Prioritize"
            title="Score jobs before they drain your time"
            description="Use match scoring to compare skills, seniority, evidence, and urgency so you can focus on roles where your profile has a credible path."
          />
          <FeatureCard
            eyebrow="Tailor"
            title="Turn profile data into a targeted resume"
            description="Generate a resume draft that emphasizes the projects, outcomes, and keywords that matter for the specific role."
          />
          <FeatureCard
            eyebrow="Personalize"
            title="Draft a cover letter with the right angle"
            description="Create a company-specific cover letter that connects your experience to the job without starting from a blank page."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <ScoreBreakdownVisual />
          <DocumentCreationVisual />
        </div>
      </section>

      <section id="pricing" className="space-y-8">
        <SectionIntro
          eyebrow="Pricing"
          title="Start with a free trial, then choose monthly or yearly Pro"
          description="Every plan gives you the same core ApplyEngine workflow, including job scoring, tailored application drafts, follow-ups, dashboards, and reporting. Start with a 7-day free trial, then continue monthly or save with yearly billing."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard
            title="Free Trial"
            price="7 days free"
            description="Create your account and start a 7-day Pro trial with scoring, resume drafts, cover letters, workflow, and reporting."
            note="No charge until the 7-day trial ends."
            href="/login?plan=trial"
            cta="Sign Up For Trial"
            accent="blue"
          />
          <PricingCard
            title="Pro Monthly"
            price="$19.99/month"
            description="Flexible monthly access to AI job scoring, tailored assets, your job search dashboard, follow-ups, workflow, and reporting."
            href="/login?plan=month"
            cta="Choose Monthly"
          />
          <PricingCard
            title="Pro Yearly"
            price="$99/year"
            description="Best value for long-term use. Keep scoring, asset generation, follow-ups, and reporting running for one lower yearly price."
            href="/login?plan=year"
            cta="Choose Yearly"
            accent="dark"
          />
        </div>
      </section>

      <section id="product" className="space-y-8">
        <SectionIntro
          eyebrow="Product"
          title="The whole search in one place, with sharper signals"
          description="ApplyEngine matches the workflow you are already managing: capture roles, score the opportunity, generate the right assets, move each job through the pipeline, and review what is converting."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            eyebrow="Track"
            title="Jobs keeps the record clean"
            description="Track every role with its company, title, score, application state, follow-up timing, and supporting notes in one place."
          />
          <FeatureCard
            eyebrow="Decide"
            title="Scoring shows where to spend energy"
            description="Compare each opportunity against your profile so you can separate promising roles from long-shot applications faster."
          />
          <FeatureCard
            eyebrow="Create"
            title="AI drafts application assets"
            description="Generate tailored resumes and cover letters directly from the job record, then refine from a strong first pass."
          />
          <FeatureCard
            eyebrow="Execute"
            title="Today reduces decision fatigue"
            description="The Today view turns the pipeline into an action queue so you can work what matters now instead of constantly re-orienting."
          />
          <FeatureCard
            eyebrow="Follow up"
            title="Follow-Ups stay visible"
            description="Due and overdue outreach is surfaced directly, with generated follow-up content and quick actions when it is time to move."
          />
          <FeatureCard
            eyebrow="Measure"
            title="Reports show whether the system is working"
            description="Track application rate, interview rate, offer rate, score distribution, and pipeline aging to see what is improving and what is stuck."
          />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="space-y-5">
          <SectionIntro
            eyebrow="Why it works"
            title="Built to make the search easier to judge, create for, and run"
            description="The interface is organized around the real decisions in a job search: which role is worth applying to, what story should the application tell, and what needs to move next."
          />

          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-zinc-950">You can qualify the opportunity first</p>
              <p className="mt-1 text-sm text-zinc-600">
                Scoring gives every role a clearer signal, so your effort goes into
                jobs where your experience, evidence, and target level line up.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-zinc-950">You can create from context</p>
              <p className="mt-1 text-sm text-zinc-600">
                Resume and cover letter drafts are generated from the job record and
                your profile, keeping the message specific instead of generic.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-zinc-950">You still get the operating system</p>
              <p className="mt-1 text-sm text-zinc-600">
                Follow-ups, daily actions, dashboard health, and reporting keep the
                search moving after the application is ready to send.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricTile label="Score" value="Fit and priority" />
            <MetricTile label="Create" value="Resume and letter" tone="blue" />
            <MetricTile label="Execute" value="Today queue" tone="amber" />
            <MetricTile label="Measure" value="Reports and funnel" tone="emerald" />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionIntro
          eyebrow="Workflow"
          title="A simple loop for higher-quality applications"
          description="Capture an opportunity, understand the fit, create the assets, then work the pipeline until you have signal."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <WorkflowStep
            step="1"
            title="Capture and score the role"
            description="Add the job description, generate a match score, and keep the record structured from the beginning."
          />
          <WorkflowStep
            step="2"
            title="Generate tailored assets"
            description="Create a resume and cover letter draft that pull the most relevant proof from your profile."
          />
          <WorkflowStep
            step="3"
            title="Send, follow up, and measure"
            description="Use Today, Follow-Ups, Dashboard, and Reports to keep momentum and learn what converts."
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-xl sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Start with a free trial, then send better-targeted applications.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-300">
            Create your account to score roles, generate tailored resumes and cover
            letters, and run your search like a system instead of a scramble.
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
