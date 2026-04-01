import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enqueueAutomationJob } from '@/lib/automation/queue'
import { runAutomationWorker } from '@/lib/automation/worker'

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim())
}

type ApplicationRow = {
  id: string
  job_id: string
  status: string | null
  follow_up_1_due: string | null
  follow_up_2_due: string | null
  follow_up_1_sent_at: string | null
  follow_up_2_sent_at: string | null
}

type AssetRow = {
  job_id: string
  follow_up_1_email_markdown: string | null
  follow_up_2_email_markdown: string | null
  created_at: string
}

function needsFollowUpContent(
  application: ApplicationRow,
  asset: AssetRow | null
) {
  const needsStage1 =
    Boolean(application.follow_up_1_due) &&
    !application.follow_up_1_sent_at &&
    !hasText(asset?.follow_up_1_email_markdown)

  const needsStage2 =
    Boolean(application.follow_up_2_due) &&
    !application.follow_up_2_sent_at &&
    !hasText(asset?.follow_up_2_email_markdown)

  return needsStage1 || needsStage2
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const from = formData.get('from')
  const limitValue = formData.get('limit')

  const redirectPath =
    typeof from === 'string' && from.length > 0 ? from : '/follow-ups'

  const requestedLimit =
    typeof limitValue === 'string' && limitValue.length > 0
      ? Number(limitValue)
      : 10

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 25)
    : 10

  try {
    const supabase = createAdminClient()

    const { data: applicationData, error: applicationError } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        status,
        follow_up_1_due,
        follow_up_2_due,
        follow_up_1_sent_at,
        follow_up_2_sent_at
      `)
      .in('status', ['applied', 'interviewing'])

    if (applicationError) {
      throw new Error(applicationError.message)
    }

    const applications = (applicationData ?? []) as ApplicationRow[]
    const jobIds = Array.from(new Set(applications.map((row) => row.job_id)))

    const assetByJobId = new Map<string, AssetRow>()

    if (jobIds.length > 0) {
      const { data: assetData, error: assetError } = await supabase
        .from('application_assets')
        .select(`
          job_id,
          follow_up_1_email_markdown,
          follow_up_2_email_markdown,
          created_at
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })

      if (assetError) {
        throw new Error(assetError.message)
      }

      for (const row of (assetData ?? []) as AssetRow[]) {
        if (!assetByJobId.has(row.job_id)) {
          assetByJobId.set(row.job_id, row)
        }
      }
    }

    const jobIdsNeedingGeneration = applications
      .filter((application) =>
        needsFollowUpContent(
          application,
          assetByJobId.get(application.job_id) ?? null
        )
      )
      .slice(0, limit)
      .map((application) => application.job_id)

    for (const jobId of jobIdsNeedingGeneration) {
      await enqueueAutomationJob({
        jobType: 'generate_followup_assets',
        entityType: 'job',
        entityId: jobId,
      })
    }

    const workerResult =
      jobIdsNeedingGeneration.length > 0
        ? await runAutomationWorker({
            limit: Math.min(jobIdsNeedingGeneration.length, 10),
            maxCycles: 3,
          })
        : { processed: 0, completed: 0, failed: 0, skipped: 0 }

    const url = new URL(redirectPath, req.url)
    url.searchParams.set('generated', String(workerResult.completed ?? 0))
    url.searchParams.set('failed', String(workerResult.failed ?? 0))
    url.searchParams.set('queued', String(jobIdsNeedingGeneration.length))

    return NextResponse.redirect(url)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate follow-up content'

    console.error('generate missing follow-up content failed:', error)

    const url = new URL(redirectPath, req.url)
    url.searchParams.set('error', message)

    return NextResponse.redirect(url)
  }
}