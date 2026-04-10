import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesUpdate } from '@/lib/supabase/schema'

type CandidateExperienceUpdate = TablesUpdate<'candidate_experience'>

type CandidateExperienceRouteUpdate = Omit<
  CandidateExperienceUpdate,
  'bullets' | 'technologies'
> & {
  bullets?: string[]
  technologies?: string[]
}

type RequestBody = {
  candidate_profile_id?: string
  company?: string
  title?: string
  bullets?: string[] | null
  technologies?: string[] | null
  summary?: string | null
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  is_current?: boolean | null
  sort_order?: number | null
}

function normalizeStringArray(value: string[] | null | undefined) {
  if (value == null) return undefined

  return value
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as RequestBody
    const { id } = await params

    const updatePayload: CandidateExperienceRouteUpdate = {}

    if (body.company !== undefined) {
      updatePayload.company = body.company.trim()
    }

    if (body.title !== undefined) {
      updatePayload.title = body.title.trim()
    }

    if (body.bullets !== undefined) {
      updatePayload.bullets = normalizeStringArray(body.bullets)
    }

    if (body.technologies !== undefined) {
      updatePayload.technologies = normalizeStringArray(body.technologies)
    }

    if (body.summary !== undefined) {
      updatePayload.summary = body.summary
    }

    if (body.location !== undefined) {
      updatePayload.location = body.location
    }

    if (body.start_date !== undefined) {
      updatePayload.start_date = body.start_date
    }

    if (body.end_date !== undefined) {
      updatePayload.end_date = body.end_date
    }

    if (body.is_current !== undefined) {
      updatePayload.is_current = body.is_current
    }

    if (body.sort_order !== undefined) {
      updatePayload.sort_order = body.sort_order
    }

    const { data, error } = await supabase
      .from('candidate_experience')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('candidate_experience')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
