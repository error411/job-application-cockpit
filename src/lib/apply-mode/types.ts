export type ApplyItem = {
  id: string
  jobId: string
  status: string
  company: string
  title: string
  location: string
  notes: string | null
  appliedAt: string | null
  followUp1Due: string | null
  followUp2Due: string | null
  hasAssets: boolean
  latestScore: number | null
  priorityScore: number
  reason: string
}