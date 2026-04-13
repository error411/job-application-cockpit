export const ONBOARDING_STEP_KEYS = [
  'import_resume',
  'review_profile',
  'add_job',
  'generate_assets',
  'work_queue',
] as const

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number]

const STORAGE_PREFIX = 'applyengine-onboarding-step:'

function getStorageKey(step: OnboardingStepKey) {
  return `${STORAGE_PREFIX}${step}`
}

export function markOnboardingStepComplete(step: OnboardingStepKey) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(step), 'true')
}

export function isOnboardingStepComplete(step: OnboardingStepKey) {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getStorageKey(step)) === 'true'
}
