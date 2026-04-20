export const ONBOARDING_STEP_KEYS = [
  'import_resume',
  'review_profile',
  'add_job',
  'generate_assets',
  'work_queue',
] as const

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number]

const STORAGE_PREFIX = 'applyengine-onboarding-step:'
const ONBOARDING_PROGRESS_EVENT = 'applyengine:onboarding-progress'

function getStorageKey(step: OnboardingStepKey) {
  return `${STORAGE_PREFIX}${step}`
}

function notifyOnboardingProgressChange() {
  window.dispatchEvent(new Event(ONBOARDING_PROGRESS_EVENT))
}

export function markOnboardingStepComplete(step: OnboardingStepKey) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(step), 'true')
  notifyOnboardingProgressChange()
}

export function clearOnboardingStepComplete(step: OnboardingStepKey) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(getStorageKey(step))
  notifyOnboardingProgressChange()
}

export function isOnboardingStepComplete(step: OnboardingStepKey) {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getStorageKey(step)) === 'true'
}

export function subscribeToOnboardingProgress(
  callback: () => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener(ONBOARDING_PROGRESS_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(ONBOARDING_PROGRESS_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
