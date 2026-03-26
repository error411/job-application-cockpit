import { NextRequest, NextResponse } from 'next/server'
import { enqueueAutomationJob } from '@/lib/automation/queue'
import { createJobWithApplication } from '@/lib/services/create-job'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      company,
      title,
      location,
      url,
      description,
      description_raw,
    } = body ?? {}

    if (!company || !title) {
      return NextResponse.json(
        { error: 'Company and title are required.' },
        { status: 400 }
      )
    }

    const descriptionValue =
      typeof description === 'string'
        ? description
        : typeof description_raw === 'string'
        ? description_raw
        : ''

    const descriptionText = descriptionValue.trim()

    const { job, application } = await createJobWithApplication({
      company: String(company),
      title: String(title),
      location: location ? String(location) : null,
      url: url ? String(url) : null,
      description: descriptionText,
    })

    console.log('Enqueuing score_job for job:', job.id)

    await enqueueAutomationJob({
      jobType: 'score_job',
      entityType: 'job',
      entityId: job.id,
    })

    console.log('Enqueued score_job for job:', job.id)

    return NextResponse.json(
      {
        job,
        application,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/jobs error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create job.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}