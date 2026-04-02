export const JOB_STATUSES = [
  'captured',
  'scored',
  'assets_generated',
  'ready_to_apply',
  'archived',
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export const APPLICATION_STATUSES = [
  'ready',
  'applied',
  'interviewing',
  'closed',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const APPLICATION_DISPOSITIONS = [
  'landed_interview',
  'rejected',
  'offer',
  'withdrawn',
  'ghosted',
  'accepted',
] as const

export type ApplicationDisposition = (typeof APPLICATION_DISPOSITIONS)[number]

export const ACTIVE_APPLICATION_STATUSES = [
  'ready',
  'applied',
  'interviewing',
] as const satisfies readonly ApplicationStatus[]

export const CLOSED_APPLICATION_STATUSES = [
  'closed',
] as const satisfies readonly ApplicationStatus[]

export function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus)
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
}

export function isApplicationDisposition(
  value: string
): value is ApplicationDisposition {
  return APPLICATION_DISPOSITIONS.includes(value as ApplicationDisposition)
}