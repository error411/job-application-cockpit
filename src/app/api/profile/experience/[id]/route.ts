import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CandidateExperienceInsert } from '@/lib/supabase/types'

type RequestBody = {
  candidate_profile_id?: string
  company?: string
  title?: string
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  is_current?: boolean
  summary?: string | null
  bullets?: string[]
  technologies?: string[]
  sort_order?: number
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await req.json()) as RequestBody

    const {
      candidate_profile_id,
      company,
      title,
      location,
      start_date,
      end_date,
      is_current,
      summary,
      bullets,
      technologies,
      sort_order,
    } = body

    if (!candidate_profile_id || !company || !title) {
      return NextResponse.json(
        { error: 'candidate_profile_id, company, and title are required.' },
        { status: 400 }
      )
    }

    const insertPayload: CandidateExperienceInsert = {
      candidate_profile_id,
      company: company.trim(),
      title: title.trim(),
      location: location?.trim() || null,
      start_date: start_date || null,
      end_date: end_date || null,
      is_current: Boolean(is_current),
      summary: summary?.trim() || null,
      bullets: toStringArray(bullets),
      technologies: toStringArray(technologies),
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
    }

    const { data, error } = await supabase
      .from('candidate_experience')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ experience: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/profile/experience error:', error)
    return NextResponse.json(
      { error: 'Failed to create experience row.' },
      { status: 500 }
    )
  }
}