import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RequestBody = {
  company: string
  title: string
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
  if (value == null) return []

  return value.map((item) => item.trim()).filter(Boolean)
}

export async function POST(req: NextRequest) {
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

    if (!body.company?.trim()) {
      return NextResponse.json(
        { error: 'company is required' },
        { status: 400 }
      )
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    const insertPayload = {
      user_id: user.id,
      company: body.company.trim(),
      title: body.title.trim(),
      bullets: normalizeStringArray(body.bullets),
      technologies: normalizeStringArray(body.technologies),
      summary:
        typeof body.summary === 'string' && body.summary.trim()
          ? body.summary.trim()
          : null,
      location:
        typeof body.location === 'string' && body.location.trim()
          ? body.location.trim()
          : null,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      is_current: body.is_current ?? false,
      sort_order: body.sort_order ?? 0,
    }

    const { data, error } = await supabase
      .from('candidate_experience')
      .insert(insertPayload)
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