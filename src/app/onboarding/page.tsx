import Link from 'next/link'
import { requireUser } from '@/lib/auth/require-user'
import { Button } from '@/components/ui/button'
import { PageHeader, PageShell } from '@/components/ui/page-shell'
import {
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from '@/components/ui/section-card'
import { OnboardingTourPopup } from '@/components/onboarding-tour-popup'
import { type OnboardingStepKey } from '@/lib/onboarding/progress'
import { OnboardingChecklist } from './onboarding-checklist'
import { ResumeImportCard } from './resume-import-card'

type OnboardingStep = {
  key: OnboardingStepKey
  title: string
  description: string
  href: string
  cta: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: 'import_resume',
    title: 'Import your resume',
    description:
      'Start here. Import your resume so ApplyEngine can prefill your profile, title, location, and experience.',
    href: '#resume-import',
    cta: 'Import Resume',
  },
  {
    key: 'review_profile',
    title: 'Review your imported profile',
    description:
      'Check the parsed resume details, tighten your summary, and fill any gaps before generating assets.',
    href: '/profile',
    cta: 'Open Profile',
  },
  {
    key: 'add_job',
    title: 'Add your first job',
    description:
      'Create an opportunity record with company, role, and link so it enters your application pipeline.',
    href: '/jobs/new',
    cta: 'Add Job',
  },
  {
    key: 'generate_assets',
    title: 'Generate draft assets',
    description:
      'Use AI to create a tailored resume and cover letter draft from your profile and target job.',
    href: '/jobs',
    cta: 'Open Jobs',
  },
  {
    key: 'work_queue',
    title: 'Work your daily queue',
    description:
      'Use Today to execute next actions, keep momentum, and avoid missing follow-ups.',
    href: '/today',
    cta: 'Open Today',
  },
]

export default async function OnboardingPage() {
  await requireUser()

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

      <OnboardingTourPopup
        stageKey="onboarding-import-resume"
        stepLabel="Product Tour"
        title="Start by importing your resume"
        description="This pulls your title, location, summary, and experience into ApplyEngine so the next steps can be personalized automatically."
        targetSelector='[data-tour-target="onboarding-import-resume-button"]'
        placement="bottom"
      />

      <ResumeImportCard />

      <SectionCard>
        <SectionCardHeader
          title="Quick-start checklist"
          description="After import, these are the next steps to get your workflow running."
        />
        <SectionCardBody className="space-y-4">
          <OnboardingChecklist steps={ONBOARDING_STEPS} />
        </SectionCardBody>
      </SectionCard>
    </PageShell>
  )
}
