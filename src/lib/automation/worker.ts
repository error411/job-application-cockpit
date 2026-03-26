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

type RunAutomationWorkerOptions = {
  limit?: number
}

type AutomationJobResult = {
  jobId: string
  jobType: string
  status: 'completed' | 'failed' | 'skipped'
  error?: string
}

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

export async function runAutomationWorker(
  options: RunAutomationWorkerOptions = {},
) {
  const limit = options.limit ?? 5
  const jobs = await getDueAutomationJobs(limit)

  const results: AutomationJobResult[] = []

  console.info('automation worker start', {
    limit,
    fetched: jobs.length,
  })

  for (const queuedJob of jobs) {
    const startedAt = Date.now()
    let lockedJob: QueuedAutomationJob | null = null

    try {
      console.info('automation job claim attempt', {
        jobId: queuedJob.id,
        jobType: queuedJob.job_type,
        entityId: queuedJob.entity_id,
      })

      lockedJob = await markAutomationJobProcessing(queuedJob.id)

      if (!lockedJob) {
        results.push({
          jobId: queuedJob.id,
          jobType: queuedJob.job_type,
          status: 'skipped',
          error: 'Job could not be claimed for processing',
        })

        console.warn('automation job skipped', {
          jobId: queuedJob.id,
          jobType: queuedJob.job_type,
          reason: 'claim_failed',
        })

        continue
      }

      console.info('automation job processing', {
        jobId: lockedJob.id,
        jobType: lockedJob.job_type,
        entityType: lockedJob.entity_type,
        entityId: lockedJob.entity_id,
        attempts: lockedJob.attempts,
      })

      await processAutomationJob(lockedJob)
      await markAutomationJobCompleted(lockedJob.id)

      results.push({
        jobId: lockedJob.id,
        jobType: lockedJob.job_type,
        status: 'completed',
      })

      console.info('automation job completed', {
        jobId: lockedJob.id,
        jobType: lockedJob.job_type,
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown automation error'

      if (lockedJob) {
        try {
          await markAutomationJobFailed(lockedJob, message)
        } catch (markFailedError) {
          const markFailedMessage =
            markFailedError instanceof Error
              ? markFailedError.message
              : 'Unknown mark-failed error'

          console.error('automation job failure state update failed', {
            jobId: lockedJob.id,
            jobType: lockedJob.job_type,
            error: markFailedMessage,
          })
        }
      }

      results.push({
        jobId: lockedJob?.id ?? queuedJob.id,
        jobType: lockedJob?.job_type ?? queuedJob.job_type,
        status: 'failed',
        error: message,
      })

      console.error('automation job failed', {
        jobId: lockedJob?.id ?? queuedJob.id,
        jobType: lockedJob?.job_type ?? queuedJob.job_type,
        durationMs: Date.now() - startedAt,
        error: message,
      })
    }
  }

  const summary = {
    processed: results.length,
    completed: results.filter((result) => result.status === 'completed').length,
    failed: results.filter((result) => result.status === 'failed').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    results,
  }

  console.info('automation worker done', summary)

  return summary
}