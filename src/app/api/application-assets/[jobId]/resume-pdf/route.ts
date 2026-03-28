import chromium from '@sparticuz/chromium'
import { chromium as playwright, type Browser, type Page } from 'playwright-core'
import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getResumeHtml } from '@/lib/resume/get-resume-html'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    jobId: string
  }>
}

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = playwright
      .launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
      .then((browser) => {
        browser.on('disconnected', () => {
          browserPromise = null
        })
        return browser
      })
      .catch((error) => {
        browserPromise = null
        throw error
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

  let page: Page | null = null

  try {
    const html = await getResumeHtml(jobId)

    const browser = await getBrowser()
    page = await browser.newPage()

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
          job.company,
          job.title
        )}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Resume PDF generation failed', error)

    const message =
      error instanceof Error ? error.message : 'Failed to generate resume PDF.'

    const status =
      message === 'Resume markdown not found for this job.' ||
      message === 'Job not found.'
        ? 404
        : 500

    return NextResponse.json({ error: message }, { status })
  } finally {
    if (page) {
      await page.close()
    }
  }
}