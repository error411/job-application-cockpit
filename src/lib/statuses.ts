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
  'rejected',
  'closed',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const ACTIVE_APPLICATION_STATUSES = [
  'ready',
  'applied',
  'interviewing',
] as const satisfies readonly ApplicationStatus[]

export const CLOSED_APPLICATION_STATUSES = [
  'rejected',
  'closed',
] as const satisfies readonly ApplicationStatus[]

export function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus)
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
}