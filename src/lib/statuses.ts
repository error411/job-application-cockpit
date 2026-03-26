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
  'follow_up_due',
  'interviewing',
  'rejected',
  'closed',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = [
  'ready',
  'applied',
  'follow_up_due',
  'interviewing',
]

export const CLOSED_APPLICATION_STATUSES: ApplicationStatus[] = [
  'rejected',
  'closed',
]

export function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus)
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
}