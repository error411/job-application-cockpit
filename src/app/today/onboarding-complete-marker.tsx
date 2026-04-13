'use client'

import { useEffect } from 'react'
import { markOnboardingStepComplete } from '@/lib/onboarding/progress'

export function OnboardingCompleteMarker() {
  useEffect(() => {
    markOnboardingStepComplete('work_queue')
  }, [])

  return null
}
