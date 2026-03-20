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
      return NextResponse.redirect(new URL('/jobs', req.url))
    }

    const { error } = await supabase.from('jobs').delete().eq('id', id)

    if (error) {
      console.error('POST /api/jobs/[id]/delete-form error:', error)
      return NextResponse.redirect(new URL(`/jobs/${id}`, req.url))
    }

    const redirectPath = from === 'apply' ? '/apply' : '/jobs'
    return NextResponse.redirect(new URL(redirectPath, req.url))
  } catch (error) {
    console.error('POST /api/jobs/[id]/delete-form unexpected error:', error)
    return NextResponse.redirect(new URL('/jobs', req.url))
  }
}