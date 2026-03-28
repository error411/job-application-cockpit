import chromium from '@sparticuz/chromium'
import { chromium as playwright, type Browser, type Page } from 'playwright-core'
import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

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
  const parts = ['cover-letter', company ?? '', title ?? '']
    .map((part) => slugify(part))
    .filter(Boolean)

  return `${parts.join('-') || 'cover-letter'}.pdf`
}

export async function GET(request: Request, context: RouteContext) {
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

  const htmlUrl = new URL(
    `/api/application-assets/${jobId}/cover-letter-html`,
    request.url
  )

  const htmlResponse = await fetch(htmlUrl.toString(), {
    method: 'GET',
    cache: 'no-store',
  })

  if (!htmlResponse.ok) {
    const message = await htmlResponse.text()

    return NextResponse.json(
      {
        error: 'Failed to load cover letter HTML for PDF generation.',
        details: message,
      },
      { status: 500 }
    )
  }

  const html = await htmlResponse.text()

  let page: Page | null = null

  try {
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
        top: '0.65in',
        right: '0.7in',
        bottom: '0.65in',
        left: '0.7in',
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
    console.error('Cover letter PDF generation failed', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate cover letter PDF.'

    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (page) {
      await page.close()
    }
  }
}