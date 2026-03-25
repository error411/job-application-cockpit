import { chromium, type Browser } from 'playwright'
import { NextResponse } from 'next/server'

import { buildCoverLetterHtmlDocument } from '@/lib/cover-letter/render-cover-letter-html'
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
  const parts = ['cover-letter', company ?? '', title ?? '']
    .map((part) => slugify(part))
    .filter(Boolean)

  return `${parts.join('-') || 'cover-letter'}.pdf`
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

type CandidateProfileForCoverLetter = {
  full_name: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
}

function normalizeProfile(profile: Record<string, unknown>): CandidateProfileForCoverLetter {
  return {
    full_name: toNullableString(profile.full_name),
    city: toNullableString(profile.city),
    state: toNullableString(profile.state),
    phone: toNullableString(profile.phone),
    email: toNullableString(profile.email),
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params
  const supabase = await createClient()

  const [
    { data: asset, error: assetError },
    { data: job, error: jobError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from('application_assets')
      .select('job_id, cover_letter_markdown')
      .eq('job_id', jobId)
      .maybeSingle(),
    supabase
      .from('jobs')
      .select('id, company, title')
      .eq('id', jobId)
      .maybeSingle(),
    supabase
      .from('candidate_profile')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  if (assetError) {
    return NextResponse.json({ error: assetError.message }, { status: 500 })
  }

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
  }

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!asset?.cover_letter_markdown) {
    return NextResponse.json(
      { error: 'Cover letter markdown not found for this job.' },
      { status: 404 }
    )
  }

  const normalizedProfile = profile
    ? normalizeProfile(profile as Record<string, unknown>)
    : null

  const html = buildCoverLetterHtmlDocument({
    markdown: asset.cover_letter_markdown,
    candidateName: normalizedProfile?.full_name ?? null,
    targetCompany: job?.company ?? null,
    targetRole: job?.title ?? null,
    city: normalizedProfile?.city ?? null,
    state: normalizedProfile?.state ?? null,
    phone: normalizedProfile?.phone ?? null,
    email: normalizedProfile?.email ?? null,
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
        top: '0.7in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
    })

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${buildFilename(
          job?.company,
          job?.title
        )}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate cover letter PDF.'

    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await page.close()
  }
}