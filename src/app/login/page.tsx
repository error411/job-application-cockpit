import { redirect } from 'next/navigation'
import { AuthPanel } from '@/components/auth/auth-panel'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/today')
  }

  return (
    <div className="mx-auto max-w-md py-10 sm:py-16">
      <AuthPanel
        error={params.error}
        message={params.message}
        title="Welcome back"
        description="Log in to continue managing your job search, or create an account to get started."
      />
    </div>
  )
}