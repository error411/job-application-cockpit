import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: 'Job id is required.' }, { status: 400 })
    }

    const { error } = await supabase.from('jobs').delete().eq('id', id)

    if (error) {
      console.error('DELETE /api/jobs/[id] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/jobs/[id] unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to delete job.' },
      { status: 500 }
    )
  }
}