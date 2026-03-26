import type { ApplicationStatus } from '@/lib/statuses'

export type ApplyItem = {
  id: string
  jobId: string
  status: ApplicationStatus
  company: string
  title: string
  location: string
  notes: string | null
  appliedAt: string | null

  followUp1Due: string | null
  followUp2Due: string | null
  followUp1SentAt: string | null
  followUp2SentAt: string | null

  followUp1EmailMarkdown: string | null
  followUp2EmailMarkdown: string | null

  hasAssets: boolean
  latestScore: number | null
  priorityScore: number
  reason: string
}