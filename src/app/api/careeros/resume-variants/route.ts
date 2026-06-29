import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json, TablesInsert } from '@/lib/supabase/schema'

type ResumeVariantInsert = TablesInsert<'resume_variants'>

type CompositionInput = {
  role_ids?: string[]
  project_ids?: string[]
  accomplishment_ids?: string[]
  skill_ids?: string[]
  technology_ids?: string[]
  education_ids?: string[]
  certification_ids?: string[]
  section_order?: string[]
}

type RequestBody = {
  career_profile_id?: string | null
  job_id?: string | null
  name?: string
  target_company?: string | null
  target_title?: string | null
  target_description?: string | null
  variant_type?: string | null
  composition?: CompositionInput
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function normalizeIdList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : []
}

function normalizeComposition(value: CompositionInput | undefined): Json {
  return {
    role_ids: normalizeIdList(value?.role_ids),
    project_ids: normalizeIdList(value?.project_ids),
    accomplishment_ids: normalizeIdList(value?.accomplishment_ids),
    skill_ids: normalizeIdList(value?.skill_ids),
    technology_ids: normalizeIdList(value?.technology_ids),
    education_ids: normalizeIdList(value?.education_ids),
    certification_ids: normalizeIdList(value?.certification_ids),
    section_order: normalizeIdList(value?.section_order),
  }
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
    const name = toNullableString(body.name)

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const careerProfileId = toNullableString(body.career_profile_id)

    if (careerProfileId) {
      const { data: profile, error: profileError } = await supabase
        .from('career_profiles')
        .select('id')
        .eq('id', careerProfileId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      if (!profile) {
        return NextResponse.json(
          { error: 'Career profile not found.' },
          { status: 404 }
        )
      }
    }

    const payload: ResumeVariantInsert = {
      user_id: user.id,
      career_profile_id: careerProfileId,
      job_id: toNullableString(body.job_id),
      name,
      target_company: toNullableString(body.target_company),
      target_title: toNullableString(body.target_title),
      target_description: toNullableString(body.target_description),
      variant_type: toNullableString(body.variant_type) ?? 'targeted_resume',
      composition: normalizeComposition(body.composition),
    }

    const { data, error } = await supabase
      .from('resume_variants')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ resumeVariant: data })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
