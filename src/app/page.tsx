import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type HomePageProps = {
  searchParams: Promise<{ error?: string; message?: string }>
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-slate-600">{description}</p>
    </div>
  )
}

function ValueCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'cyan' | 'violet' | 'emerald' | 'rose'
}) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50'
      : tone === 'violet'
        ? 'border-violet-200 bg-violet-50'
        : tone === 'emerald'
          ? 'border-emerald-200 bg-emerald-50'
          : tone === 'rose'
            ? 'border-rose-200 bg-rose-50'
            : 'border-slate-200 bg-white'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  )
}

function PreviewShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function AppPreview() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-4 shadow-2xl sm:p-6">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3 backdrop-blur sm:p-4">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <PreviewShell
            title="Today"
            subtitle="Work the next best actions across your search"
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">
                      Recruiter follow-up due
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Northstar Labs · Web Developer
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700">
                    Overdue
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">
                      Resume and application ready
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Studio Eight · Frontend Engineer
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-medium text-cyan-700">
                    Ready
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">
                      Interview prep and notes
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Harbor Health · Full-Stack Engineer
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    Interviewing
                  </span>
                </div>
              </div>
            </div>
          </PreviewShell>

          <div className="grid gap-4">
            <PreviewShell
              title="Dashboard"
              subtitle="See the state of your pipeline at a glance"
            >
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg bg-slate-200">
                  <div className="flex h-4 w-full">
                    <div className="w-[30%] bg-cyan-500" />
                    <div className="w-[48%] bg-violet-500" />
                    <div className="w-[22%] bg-amber-400" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <StatTile label="Ready" value="12" tone="cyan" />
                  <StatTile label="Applied" value="28" tone="violet" />
                  <StatTile label="Interviewing" value="7" tone="emerald" />
                  <StatTile label="Overdue" value="4" tone="rose" />
                </div>
              </div>
            </PreviewShell>

            <PreviewShell
              title="Jobs"
              subtitle="Track each opportunity without losing the thread"
            >
              <div className="space-y-2">
                {[
                  ['Salk Institute', 'Web Developer', 'Applied'],
                  ['Cobalt Health', 'WordPress Developer', 'Interviewing'],
                  ['Acme Labs', 'Frontend Engineer', 'Ready'],
                ].map(([company, title, status]) => (
                  <div
                    key={`${company}-${title}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">
                        {company}
                      </p>
                      <p className="truncate text-sm text-slate-600">{title}</p>
                    </div>
                    <span className="ml-3 text-xs text-slate-500">{status}</span>
                  </div>
                ))}
              </div>
            </PreviewShell>
          </div>
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
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
      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-6">
          <Pill>Track jobs. Work Today. See your pipeline.</Pill>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              ApplyEngine gives your job search a real operating system.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Keep jobs organized, work your next best actions from Today, stay
              on top of follow-ups, and use Dashboard to understand where your
              search stands.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Log in
            </Link>

            <a
              href="#what-you-get"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              See what you get
            </a>
          </div>

          <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Dashboard" value="Pipeline state" />
            <StatTile label="Today" value="Action queue" tone="cyan" />
            <StatTile label="Follow-ups" value="No loose ends" tone="violet" />
          </div>

          {(params.error || params.message) && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              {params.error ?? params.message}
            </div>
          )}
        </div>

        <AppPreview />
      </section>

      <section id="what-you-get" className="space-y-8">
        <SectionIntro
          eyebrow="What you get"
          title="A job search workspace built around the way the process actually works"
          description="ApplyEngine helps you manage jobs, daily execution, and follow-through in one system instead of scattering the process across tabs, notes, and memory."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <ValueCard
            title="Dashboard shows the state of the search"
            description="See how many roles are Ready, Applied, Interviewing, or slipping into overdue follow-up so you can understand the pipeline fast."
          />
          <ValueCard
            title="Today tells you what to work next"
            description="Use the Today view to focus on the next best actions instead of wasting energy deciding where to start."
          />
          <ValueCard
            title="Jobs keeps each opportunity organized"
            description="Track roles, company details, statuses, notes, and application progress so each opportunity stays usable over time."
          />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-5">
          <SectionIntro
            eyebrow="Why it helps"
            title="This is what changes when your search runs from a system"
            description="You spend less time re-orienting yourself and more time actually moving applications forward."
          />

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-slate-950">
                You know what deserves attention now
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Overdue follow-ups, Ready applications, and active interview work
                are visible instead of getting buried.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-slate-950">
                You stop dropping opportunities
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Each role has a place, a status, and a history, so momentum does
                not depend on memory.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="font-medium text-slate-950">
                You can see the health of the pipeline
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Dashboard makes it easier to spot whether the search is moving,
                stalled, or leaking follow-through.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile label="Track" value="Jobs and status" />
            <StatTile label="Work" value="Today actions" tone="cyan" />
            <StatTile label="Monitor" value="Dashboard" tone="violet" />
            <StatTile label="Follow through" value="Follow-ups" tone="emerald" />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionIntro
          eyebrow="How it works"
          title="Simple workflow, clearer execution"
          description="Capture opportunities, work the right next step, and keep the search current."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <WorkflowStep
            step="1"
            title="Add the job"
            description="Capture new opportunities in Jobs so everything starts from one reliable place."
          />
          <WorkflowStep
            step="2"
            title="Work Today"
            description="Use Today to handle applications, follow-ups, and interview tasks based on what matters most."
          />
          <WorkflowStep
            step="3"
            title="Review Dashboard"
            description="Step back and see the state of the pipeline so you know where to push next."
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 px-6 py-10 text-white shadow-xl sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Get started
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            See your search the way ApplyEngine sees it
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-200">
            Log in to manage Jobs, work Today, stay on top of Follow-ups, and
            keep Dashboard honest.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Log in
            </Link>

            <a
              href="#what-you-get"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Review features
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}