import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      company,
      title,
      location,
      url,
      description,
      description_raw,
    } = body ?? {}

    if (!company || !title) {
      return NextResponse.json(
        { error: 'Company and title are required.' },
        { status: 400 }
      )
    }

    const descriptionValue =
      typeof description === 'string'
        ? description
        : typeof description_raw === 'string'
          ? description_raw
          : ''

    const descriptionText = descriptionValue.trim()

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company: String(company).trim(),
        title: String(title).trim(),
        location: location ? String(location).trim() : null,
        url: url ? String(url).trim() : null,
        description_raw: descriptionText,
        description_clean: null,
      })
      .select()
      .single()

    if (jobError || !job) {
      console.error('Error inserting job:', jobError)
      return NextResponse.json(
        { error: jobError?.message ?? 'Failed to create job.' },
        { status: 500 }
      )
    }

    const { error: applicationError } = await supabase
      .from('applications')
      .insert({
        job_id: job.id,
        status: 'ready',
        notes: null,
      })

    if (applicationError) {
      console.error('Error inserting application:', applicationError)
      return NextResponse.json(
        {
          error: applicationError.message,
          warning: 'Job created, but application row failed.',
          job,
        },
        { status: 500 }
      )
    }

    fetch(new URL('/api/score', req.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: job.id }),
    }).catch((error) => {
      console.error('Background scoring failed:', error)
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('POST /api/jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to create job.' },
      { status: 500 }
    )
  }
}