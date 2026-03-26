export type ActiveFollowUpStage = 1 | 2 | null

type FollowUpTimingFields = {
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  follow_up_1_sent_at: string | null
  follow_up_2_sent_at: string | null
}

function isPastDue(value: string | null, now: Date): boolean {
  if (!value) return false

  const dueAt = new Date(value)
  if (Number.isNaN(dueAt.getTime())) return false

  return dueAt.getTime() <= now.getTime()
}

export function getActiveFollowUpStage(
  application: FollowUpTimingFields,
  now: Date = new Date()
): ActiveFollowUpStage {
  if (
    isPastDue(application.follow_up_1_due, now) &&
    application.follow_up_1_sent_at === null
  ) {
    return 1
  }

  if (
    isPastDue(application.follow_up_2_due, now) &&
    application.follow_up_2_sent_at === null
  ) {
    return 2
  }

  return null
}