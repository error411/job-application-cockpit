import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json, TablesUpdate } from '@/lib/supabase/schema'

type ResumeVariantUpdate = TablesUpdate<'resume_variants'>

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
    const updatePayload: ResumeVariantUpdate = {}

    if (body.career_profile_id !== undefined) {
      const careerProfileId = toNullableString(body.career_profile_id)

      if (careerProfileId) {
        const { data: profile, error: profileError } = await supabase
          .from('career_profiles')
          .select('id')
          .eq('id', careerProfileId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) {
          return NextResponse.json(
            { error: profileError.message },
            { status: 500 }
          )
        }

        if (!profile) {
          return NextResponse.json(
            { error: 'Career profile not found.' },
            { status: 404 }
          )
        }
      }

      updatePayload.career_profile_id = careerProfileId
    }

    if (body.job_id !== undefined) {
      updatePayload.job_id = toNullableString(body.job_id)
    }

    if (body.name !== undefined) {
      const name = toNullableString(body.name)
      if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 })
      }

      updatePayload.name = name
    }

    if (body.target_company !== undefined) {
      updatePayload.target_company = toNullableString(body.target_company)
    }

    if (body.target_title !== undefined) {
      updatePayload.target_title = toNullableString(body.target_title)
    }

    if (body.target_description !== undefined) {
      updatePayload.target_description = toNullableString(
        body.target_description
      )
    }

    if (body.variant_type !== undefined) {
      updatePayload.variant_type =
        toNullableString(body.variant_type) ?? 'targeted_resume'
    }

    if (body.composition !== undefined) {
      updatePayload.composition = normalizeComposition(body.composition)
    }

    const { data, error } = await supabase
      .from('resume_variants')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
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
      .from('resume_variants')
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
