import { NextResponse } from 'next/server'
import { getCoverLetterHtml } from '@/lib/cover-letter/get-cover-letter-html'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ jobId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { jobId } = await context.params
    const html = await getCoverLetterHtml(jobId)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate cover letter HTML.'

    const status =
      message === 'Cover letter markdown not found for this job.' ||
      message === 'Job not found.'
        ? 404
        : 500

    return NextResponse.json({ error: message }, { status })
  }
}