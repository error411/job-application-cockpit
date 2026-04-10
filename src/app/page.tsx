import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type HomePageProps = {
  searchParams: Promise<{ error?: string; message?: string }>
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </p>
  )
}

function HeroPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
      {children}
    </span>
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

function MetricTile({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'blue' | 'emerald' | 'amber' | 'rose'
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
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
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
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
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
                  Apply Now
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

        <div className="grid gap-4">
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

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricTile label="Ready" value="12" tone="blue" />
                <MetricTile label="Applied" value="24" tone="default" />
                <MetricTile label="Interviewing" value="7" tone="emerald" />
                <MetricTile label="Overdue" value="4" tone="rose" />
              </div>
            </div>
          </WindowCard>

          <WindowCard
            title="Reports"
            subtitle="Track conversion and pipeline quality over time"
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricTile label="Application Rate" value="62%" tone="blue" />
                <MetricTile label="Interview Rate" value="21%" tone="emerald" />
                <MetricTile label="Offer Rate" value="8%" tone="amber" />
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-end gap-2">
                  <div className="h-12 w-6 rounded-t bg-zinc-300" />
                  <div className="h-20 w-6 rounded-t bg-blue-500" />
                  <div className="h-16 w-6 rounded-t bg-sky-500" />
                  <div className="h-10 w-6 rounded-t bg-emerald-500" />
                  <div className="h-8 w-6 rounded-t bg-amber-400" />
                </div>
                <p className="mt-3 text-sm text-zinc-600">
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-20 py-6 sm:py-10">
      <section className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="space-y-6">
          <HeroPill>Jobs, Today, Follow-Ups, Dashboard, and Reports</HeroPill>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              A cleaner operating system for a serious job search.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              ApplyEngine keeps your opportunities organized, tells you what to work
              next, and shows whether the pipeline is actually moving. It is built
              for execution, follow-through, and better visibility across the whole
              search.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="app-button-primary">
              Log in
            </Link>

            <a href="#product" className="app-button">
              Explore the workflow
            </a>
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            <MetricTile label="Today" value="Action queue" tone="blue" />
            <MetricTile label="Dashboard" value="Pipeline view" />
            <MetricTile label="Reports" value="Performance trends" tone="emerald" />
          </div>

          {(params.error || params.message) && (
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
              {params.error ?? params.message}
            </div>
          )}
        </div>

        <ProductPreview />
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
            Run the search like a system, not a scramble.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-300">
            Log in to manage Jobs, work Today, keep up with Follow-Ups, and use
            Reports to see what is actually converting.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
            >
              Log in
            </Link>

            <a
              href="#product"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Review features
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
