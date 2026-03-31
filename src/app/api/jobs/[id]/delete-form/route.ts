import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    const formData = await req.formData()
    const from = formData.get('from')

    if (!id) {
      return NextResponse.redirect(new URL('/jobs?error=missing-job-id', req.url))
    }

    const { error } = await supabase.from('jobs').delete().eq('id', id)

    if (error) {
      console.error('POST /api/jobs/[id]/delete-form error:', error)

      const redirectUrl = new URL(`/jobs/${id}`, req.url)
      redirectUrl.searchParams.set('error', error.message)

      return NextResponse.redirect(redirectUrl)
    }

    const redirectPath = from === 'apply' ? '/apply' : '/jobs'
    return NextResponse.redirect(new URL(redirectPath, req.url))
  } catch (error) {
    console.error('POST /api/jobs/[id]/delete-form unexpected error:', error)

    const redirectUrl = new URL('/jobs', req.url)
    redirectUrl.searchParams.set('error', 'Failed to delete job.')

    return NextResponse.redirect(redirectUrl)
  }
}