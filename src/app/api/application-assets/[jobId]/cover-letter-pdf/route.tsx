import { Readable } from 'node:stream'
import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'

import { createClient } from '@/lib/supabase/server'
import { getCoverLetterPayload } from '@/lib/cover-letter/get-cover-letter-payload'
import { CoverLetterPdfDocument } from '@/lib/cover-letter/render-cover-letter-pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    jobId: string
  }>
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildFilename(company?: string | null, title?: string | null): string {
  const parts = ['cover-letter', company ?? '', title ?? '']
    .map((part) => slugify(part))
    .filter(Boolean)

  return `${parts.join('-') || 'cover-letter'}.pdf`
}

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params
  const supabase = await createClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, company, title')
    .eq('id', jobId)
    .maybeSingle()

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
  }

  if (!job) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
  }

  try {
    const payload = await getCoverLetterPayload(jobId)

    const nodeStream = await renderToStream(
      <CoverLetterPdfDocument
        markdown={payload.markdown}
        candidateName={payload.candidateName}
        location={payload.location}
        phone={payload.phone}
        email={payload.email}
        targetCompany={payload.targetCompany}
        targetRole={payload.targetRole}
      />
    )

    const webStream = Readable.toWeb(nodeStream as Readable)

    return new NextResponse(webStream as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${buildFilename(
          job.company,
          job.title
        )}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Cover letter PDF generation failed', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate cover letter PDF.'

    const status =
      message === 'Cover letter markdown not found for this job.' ||
      message === 'Job not found.'
        ? 404
        : 500

    return NextResponse.json({ error: message }, { status })
  }
}