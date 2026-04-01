import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getApplyItems } from '@/lib/apply-mode/get-apply-items'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()
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