import { getFollowUpState, type FollowUpTimingFields } from './get-follow-up-state'

export type ActiveFollowUpStage = 1 | 2 | null

export type { FollowUpTimingFields }

export function getActiveFollowUpStage(
  application: FollowUpTimingFields,
  now: Date = new Date()
): ActiveFollowUpStage {
  return getFollowUpState(application, now).activeStage
}