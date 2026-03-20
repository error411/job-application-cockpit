import type { Database } from './database.types'

export type Tables = Database['public']['Tables']

export type JobRow = Tables['jobs']['Row']
export type JobInsert = Tables['jobs']['Insert']
export type JobUpdate = Tables['jobs']['Update']

export type JobScoreRow = Tables['job_scores']['Row']
export type JobScoreInsert = Tables['job_scores']['Insert']
export type JobScoreUpdate = Tables['job_scores']['Update']

export type ApplicationRow = Tables['applications']['Row']
export type ApplicationInsert = Tables['applications']['Insert']
export type ApplicationUpdate = Tables['applications']['Update']

export type CandidateProfileRow = Tables['candidate_profile']['Row']
export type CandidateProfileInsert = Tables['candidate_profile']['Insert']
export type CandidateProfileUpdate = Tables['candidate_profile']['Update']

export type ApplicationAssetRow = Tables['application_assets']['Row']
export type ApplicationAssetInsert = Tables['application_assets']['Insert']
export type ApplicationAssetUpdate = Tables['application_assets']['Update']

export type CandidateExperienceRow = Tables['candidate_experience']['Row']
export type CandidateExperienceInsert = Tables['candidate_experience']['Insert']
export type CandidateExperienceUpdate = Tables['candidate_experience']['Update']