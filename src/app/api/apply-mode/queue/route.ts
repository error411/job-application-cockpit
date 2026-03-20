import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApplyItems } from '@/lib/apply-mode/get-apply-items'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const items = await getApplyItems(supabase)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('GET /api/apply-mode/queue error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load apply queue.',
      },
      { status: 500 }
    )
  }
}