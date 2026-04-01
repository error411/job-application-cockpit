import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('candidate_profile')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Profile not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ profile: data })
}