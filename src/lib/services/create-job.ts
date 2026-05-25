import { createClient } from '@/lib/supabase/server'

export async function createJobWithApplication(input: {
  company: string
  title: string
  location?: string | null
  url?: string | null
  description: string
}) {
  // Service functions sit between API routes/pages and Supabase. They keep
  // database write rules in one reusable place.
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Jobs are owned by the authenticated Supabase user. Row-level security can
  // then keep each user's records separated at the database layer.
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      user_id: user.id,
      company: input.company.trim(),
      title: input.title.trim(),
      location: input.location?.trim() || null,
      url: input.url?.trim() || null,
      description_raw: input.description,
      description_clean: null,
      status: 'captured',
    })
    .select()
    .single()

  if (jobError) {
    throw new Error(jobError.message)
  }

  // Every captured job starts with a matching application row, which lets the
  // pipeline/status screens reason about applications instead of raw jobs alone.
  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      job_id: job.id,
      status: 'ready',
    })
    .select()
    .single()

  if (appError) {
    throw new Error(appError.message)
  }

  return { job, application }
}
