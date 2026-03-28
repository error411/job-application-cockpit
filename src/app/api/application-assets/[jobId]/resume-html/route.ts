import { NextResponse } from 'next/server'
import { getResumeHtml } from '@/lib/resume/get-resume-html'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ jobId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { jobId } = await context.params
    const html = await getResumeHtml(jobId)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate resume HTML.'

    const status =
      message === 'Resume markdown not found for this job.' ? 404 : 500

    return NextResponse.json({ error: message }, { status })
  }
}