export const AUTOMATION_JOB_TYPES = [
  'score_job',
  'generate_assets',
  'schedule_followups',
  'generate_followup_assets',
] as const

export type AutomationJobType = (typeof AUTOMATION_JOB_TYPES)[number]

export const AUTOMATION_ENTITY_TYPES = [
  'job',
  'application',
] as const

export type AutomationEntityType = (typeof AUTOMATION_ENTITY_TYPES)[number]

export const AUTOMATION_JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const

export type AutomationJobStatus = (typeof AUTOMATION_JOB_STATUSES)[number]

export function isAutomationJobType(value: string): value is AutomationJobType {
  return (AUTOMATION_JOB_TYPES as readonly string[]).includes(value)
}

export function isAutomationEntityType(value: string): value is AutomationEntityType {
  return (AUTOMATION_ENTITY_TYPES as readonly string[]).includes(value)
}

export function isAutomationJobStatus(value: string): value is AutomationJobStatus {
  return (AUTOMATION_JOB_STATUSES as readonly string[]).includes(value)
}