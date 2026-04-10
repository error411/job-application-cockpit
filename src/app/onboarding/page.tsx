import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-user'
import { Button } from '@/components/ui/button'
import { PageHeader, PageShell } from '@/components/ui/page-shell'
import {
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from '@/components/ui/section-card'

type OnboardingStep = {
  title: string
  description: string
  href: string
  cta: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Complete your profile',
    description:
      'Add your background and experience so generated resumes and cover letters can be personalized.',
    href: '/profile',
    cta: 'Open Profile',
  },
  {
    title: 'Add your first job',
    description:
      'Create an opportunity record with company, role, and link so it enters your application pipeline.',
    href: '/jobs/new',
    cta: 'Add Job',
  },
  {
    title: 'Generate draft assets',
    description:
      'Use AI to create a tailored resume and cover letter draft from your profile and target job.',
    href: '/jobs',
    cta: 'Open Jobs',
  },
  {
    title: 'Work your daily queue',
    description:
      'Use Today to execute next actions, keep momentum, and avoid missing follow-ups.',
    href: '/today',
    cta: 'Open Today',
  },
]

export default async function OnboardingPage() {
  const { supabase } = await requireUser()

  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })

  if ((count ?? 0) > 0) {
    redirect('/dashboard')
  }

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="New User Onboarding"
        description="Use this quick-start checklist to set up your workspace and begin applying with confidence."
        actions={
          <Button asChild variant="brand">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        }
      />

      <SectionCard>
        <SectionCardHeader
          title="Quick-start checklist"
          description="Most users can complete these steps in under 15 minutes."
        />
        <SectionCardBody className="space-y-4">
          {ONBOARDING_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Step {index + 1}
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-950">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </div>

              <Button asChild variant="secondary" className="sm:shrink-0">
                <Link href={step.href}>{step.cta}</Link>
              </Button>
            </div>
          ))}
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  )
}
