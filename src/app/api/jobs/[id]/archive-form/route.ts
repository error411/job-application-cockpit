import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const supabase = createAdminClient()
    const { id } = await context.params
    const formData = await req.formData()
    const from = formData.get('from')
    const reason = formData.get('reason')

    if (!id) {
      return NextResponse.redirect(new URL('/jobs?error=missing-job-id', req.url))
    }

    const { error } = await supabase
      .from('jobs')
      .update({
        archived_at: new Date().toISOString(),
        archived_reason:
          typeof reason === 'string' && reason.trim().length > 0
            ? reason.trim()
            : null,
      })
      .eq('id', id)

    if (error) {
      console.error('POST /api/jobs/[id]/archive-form error:', error)

      const redirectUrl = new URL(`/jobs/${id}`, req.url)
      redirectUrl.searchParams.set('error', error.message)
      return NextResponse.redirect(redirectUrl)
    }

    const redirectPath = from === 'apply' ? '/apply' : '/jobs'
    return NextResponse.redirect(new URL(redirectPath, req.url))
  } catch (error) {
    console.error('POST /api/jobs/[id]/archive-form unexpected error:', error)

    const redirectUrl = new URL('/jobs', req.url)
    redirectUrl.searchParams.set('error', 'Failed to archive job.')
    return NextResponse.redirect(redirectUrl)
  }
}