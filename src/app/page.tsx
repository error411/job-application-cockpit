import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Footer } from '@/components/landing/footer'
import {
  SectionIntro,
  FeatureCard,
  PricingCard,
  MetricTile,
  ProductPreview,
  ScoreBreakdownVisual,
  DocumentCreationVisual,
  WorkflowStep,
  Eyebrow,
} from '@/components/landing/landing-components'

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
      <Footer />
    </div>
  )
}
