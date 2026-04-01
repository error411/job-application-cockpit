import { createAdminClient } from '@/lib/supabase/admin'

export async function createJobWithApplication(input: {
  company: string
  title: string
  location?: string | null
  url?: string | null
  description: string
}) {
  const supabase = createAdminClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
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

  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
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