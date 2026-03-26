import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/lib/supabase/types'

type CandidateExperienceInsert = TablesInsert<'candidate_experience'>

type RequestBody = {
  candidate_profile_id?: string
  company?: string
  title?: string
  bullets?: string[]
  technologies?: string[]
  summary?: string | null
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  is_current?: boolean | null
  sort_order?: number | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await req.json()) as RequestBody

    if (!body.candidate_profile_id) {
      return NextResponse.json(
        { error: 'candidate_profile_id is required' },
        { status: 400 }
      )
    }

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

    const insertPayload: CandidateExperienceInsert = {
      candidate_profile_id: body.candidate_profile_id,
      company: body.company.trim(),
      title: body.title.trim(),
      bullets: body.bullets ?? [],
      technologies: body.technologies ?? [],
      summary: body.summary ?? null,
      location: body.location ?? null,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      is_current: body.is_current ?? null,
      sort_order: body.sort_order ?? null,
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