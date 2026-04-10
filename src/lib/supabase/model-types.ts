import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/schema'

export type JobRow = Tables<'jobs'>
export type JobInsert = TablesInsert<'jobs'>
export type JobUpdate = TablesUpdate<'jobs'>

export type ApplicationRow = Tables<'applications'>
export type ApplicationInsert = TablesInsert<'applications'>
export type ApplicationUpdate = TablesUpdate<'applications'>

export type ApplicationAssetRow = Tables<'application_assets'>
export type ApplicationAssetInsert = TablesInsert<'application_assets'>
export type ApplicationAssetUpdate = TablesUpdate<'application_assets'>

export type CandidateProfileRow = Tables<'candidate_profile'>
export type CandidateProfileInsert = TablesInsert<'candidate_profile'>
export type CandidateProfileUpdate = TablesUpdate<'candidate_profile'>

export type CandidateExperienceRow = Tables<'candidate_experience'>
export type CandidateExperienceInsert = TablesInsert<'candidate_experience'>
export type CandidateExperienceUpdate = TablesUpdate<'candidate_experience'>

export type JobScoreRow = Tables<'job_scores'>
export type JobScoreInsert = TablesInsert<'job_scores'>
export type JobScoreUpdate = TablesUpdate<'job_scores'>

export type AutomationJobRow = Tables<'automation_jobs'>
export type AutomationJobInsert = TablesInsert<'automation_jobs'>
export type AutomationJobUpdate = TablesUpdate<'automation_jobs'>

export type BillingCustomerRow = Tables<'billing_customers'>
export type BillingCustomerInsert = TablesInsert<'billing_customers'>
export type BillingCustomerUpdate = TablesUpdate<'billing_customers'>

export type BillingSubscriptionRow = Tables<'billing_subscriptions'>
export type BillingSubscriptionInsert = TablesInsert<'billing_subscriptions'>
export type BillingSubscriptionUpdate = TablesUpdate<'billing_subscriptions'>

export type BillingEventRow = Tables<'billing_events'>
export type BillingEventInsert = TablesInsert<'billing_events'>
export type BillingEventUpdate = TablesUpdate<'billing_events'>
