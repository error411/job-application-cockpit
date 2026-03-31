export type FollowUpTimingFields = {
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  follow_up_1_sent_at: string | null
  follow_up_2_sent_at: string | null
}

export type FollowUpStageState = {
  stage: 1 | 2
  dueAt: string
  sentAt: string | null
  isDueNow: boolean
  isOverdue: boolean
  isUpcoming: boolean
  isComplete: boolean
}

export type FollowUpState = {
  activeStage: 1 | 2 | null
  nextDueAt: string | null
  dueNowCount: number
  hasDueNow: boolean
  hasOverdue: boolean
  hasUpcoming: boolean
  stage1: FollowUpStageState | null
  stage2: FollowUpStageState | null
}

function toValidDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildStageState(
  stage: 1 | 2,
  dueAtValue: string | null,
  sentAt: string | null,
  now: Date
): FollowUpStageState | null {
  const dueAt = toValidDate(dueAtValue)

  if (!dueAt || !dueAtValue) {
    return null
  }

  const isComplete = sentAt !== null
  const isDueNow = !isComplete && dueAt.getTime() <= now.getTime()
  const isOverdue = isDueNow && dueAt.getTime() < now.getTime()
  const isUpcoming = !isComplete && dueAt.getTime() > now.getTime()

  return {
    stage,
    dueAt: dueAtValue,
    sentAt,
    isDueNow,
    isOverdue,
    isUpcoming,
    isComplete,
  }
}

export function getFollowUpState(
  application: FollowUpTimingFields,
  now: Date = new Date()
): FollowUpState {
  const stage1 = buildStageState(
    1,
    application.follow_up_1_due,
    application.follow_up_1_sent_at,
    now
  )

  const stage2 = buildStageState(
    2,
    application.follow_up_2_due,
    application.follow_up_2_sent_at,
    now
  )

  const activeStage = stage1?.isDueNow
    ? 1
    : stage2?.isDueNow
      ? 2
      : null

  const nextDueAt =
    stage1 && !stage1.isComplete
      ? stage1.dueAt
      : stage2 && !stage2.isComplete
        ? stage2.dueAt
        : null

  const dueNowCount = [stage1, stage2].filter((stage) => stage?.isDueNow).length

  return {
    activeStage,
    nextDueAt,
    dueNowCount,
    hasDueNow: dueNowCount > 0,
    hasOverdue: Boolean(stage1?.isOverdue || stage2?.isOverdue),
    hasUpcoming: Boolean(stage1?.isUpcoming || stage2?.isUpcoming),
    stage1,
    stage2,
  }
}