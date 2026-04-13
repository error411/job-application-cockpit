'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  isOnboardingStepComplete,
  type OnboardingStepKey,
} from '@/lib/onboarding/progress'

export type OnboardingChecklistStep = {
  key: OnboardingStepKey
  title: string
  description: string
  href: string
  cta: string
}

export function OnboardingChecklist({
  steps,
}: {
  steps: OnboardingChecklistStep[]
}) {
  const [completedSteps] = useState<Partial<Record<OnboardingStepKey, boolean>>>(
    () =>
      steps.reduce<
      Partial<Record<OnboardingStepKey, boolean>>
    >((accumulator, step) => {
      accumulator[step.key] = isOnboardingStepComplete(step.key)
      return accumulator
    }, {})
  )

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isComplete = completedSteps[step.key] === true

        return (
          <div
            key={step.key}
            className={[
              'flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between',
              isComplete
                ? 'border-emerald-200 bg-emerald-50/70'
                : 'border-slate-200 bg-white',
            ].join(' ')}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Step {index + 1}
                </p>
                {isComplete ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    Completed
                  </span>
                ) : null}
              </div>

              <h2 className="mt-1 text-base font-semibold text-slate-950">
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
            </div>

            <Button
              asChild
              variant={isComplete ? 'outline' : 'secondary'}
              className="sm:shrink-0"
            >
              <Link href={step.href}>{isComplete ? 'Review' : step.cta}</Link>
            </Button>
          </div>
        )
      })}
    </div>
  )
}
