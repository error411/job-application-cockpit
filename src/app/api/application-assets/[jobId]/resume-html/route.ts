import { NextResponse } from 'next/server'

import { buildResumeHtmlDocument } from '@/lib/resume/render-resume-html'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    jobId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params
  const supabase = await createClient()

  const [{ data: asset, error: assetError }, { data: job, error: jobError }] =
    await Promise.all([
      supabase
        .from('application_assets')
        .select('job_id, resume_markdown')
        .eq('job_id', jobId)
        .maybeSingle(),
      supabase
        .from('jobs')
        .select('id, company, title')
        .eq('id', jobId)
        .maybeSingle(),
    ])

  if (assetError) {
    return NextResponse.json(
      { error: assetError.message },
      { status: 500 },
    )
  }

  if (jobError) {
    return NextResponse.json(
      { error: jobError.message },
      { status: 500 },
    )
  }

  if (!asset?.resume_markdown) {
    return NextResponse.json(
      { error: 'Resume markdown not found for this job.' },
      { status: 404 },
    )
  }

  const html = buildResumeHtmlDocument({
    markdown: asset.resume_markdown,
    targetCompany: job?.company ?? null,
    targetRole: job?.title ?? null,
  })

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}