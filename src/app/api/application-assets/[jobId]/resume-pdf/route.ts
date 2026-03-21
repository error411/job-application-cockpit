import { chromium, type Browser } from 'playwright'
import { NextResponse } from 'next/server'

import { buildResumeHtmlDocument } from '@/lib/resume/render-resume-html'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    jobId: string
  }>
}

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
    })
  }

  return browserPromise
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildFilename(company?: string | null, title?: string | null): string {
  const parts = ['resume', company ?? '', title ?? '']
    .map((part) => slugify(part))
    .filter(Boolean)

  return `${parts.join('-') || 'resume'}.pdf`
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
    return NextResponse.json({ error: assetError.message }, { status: 500 })
  }

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
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

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    })

    await page.emulateMedia({ media: 'print' })

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0.5in',
        right: '0.55in',
        bottom: '0.5in',
        left: '0.55in',
      },
    })

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${buildFilename(
          job?.company,
          job?.title,
        )}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate resume PDF.'

    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await page.close()
  }
}