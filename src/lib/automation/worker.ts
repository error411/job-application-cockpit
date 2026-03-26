import { enqueueAutomationJob } from '@/lib/automation/queue'
import { generateAssetsForJob } from '@/lib/services/generate-assets'
import { scoreJobService } from '@/lib/services/score-job'
import {
  getDueAutomationJobs,
  markAutomationJobCompleted,
  markAutomationJobFailed,
  markAutomationJobProcessing,
} from '@/lib/automation/queue'
import type { QueuedAutomationJob } from '@/lib/automation/queue'

async function processAutomationJob(job: QueuedAutomationJob) {
  if (job.job_type === 'score_job') {
    const result = await scoreJobService(job.entity_id)
    const scoreRecord = result.score as { score?: number } | null
    const scoreValue =
      typeof scoreRecord?.score === 'number' ? scoreRecord.score : null

    if (typeof scoreValue === 'number' && scoreValue >= 75) {
      await enqueueAutomationJob({
        jobType: 'generate_assets',
        entityType: 'job',
        entityId: job.entity_id,
      })
    }

    return
  }

  if (job.job_type === 'generate_assets') {
    await generateAssetsForJob(job.entity_id)
    return
  }

  if (job.job_type === 'schedule_followups') {
    return
  }

  if (job.job_type === 'generate_followup_assets') {
    return
  }

  throw new Error(`Unsupported automation job type: ${job.job_type}`)
}

export async function runAutomationWorker(limit = 10) {
  const jobs = await getDueAutomationJobs(limit)

  const results: Array<{
    jobId: string
    jobType: string
    status: 'completed' | 'failed'
    error?: string
  }> = []

  for (const queuedJob of jobs) {
    try {
      const lockedJob = await markAutomationJobProcessing(queuedJob.id)
      await processAutomationJob(lockedJob)
      await markAutomationJobCompleted(queuedJob.id)

      results.push({
        jobId: queuedJob.id,
        jobType: queuedJob.job_type,
        status: 'completed',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown automation error'

      await markAutomationJobFailed(queuedJob, message)

      results.push({
        jobId: queuedJob.id,
        jobType: queuedJob.job_type,
        status: 'failed',
        error: message,
      })
    }
  }

  return {
    processed: results.length,
    results,
  }
}