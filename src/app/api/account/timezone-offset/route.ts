import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MIN_TIMEZONE_OFFSET_MINUTES = -840
const MAX_TIMEZONE_OFFSET_MINUTES = 840

function parseTimezoneOffsetMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return null
  }

  if (
    value < MIN_TIMEZONE_OFFSET_MINUTES ||
    value > MAX_TIMEZONE_OFFSET_MINUTES
  ) {
    return null
  }

  return value
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const timezoneOffsetMinutes = parseTimezoneOffsetMinutes(
    body?.timezone_offset_minutes
  )

  if (timezoneOffsetMinutes == null) {
    return NextResponse.json(
      { error: 'Enter a valid UTC offset.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ timezone_offset_minutes: timezoneOffsetMinutes })
    .eq('id', user.id)
    .select('timezone_offset_minutes')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
