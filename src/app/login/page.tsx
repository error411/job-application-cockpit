import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AuthPanel } from '@/components/auth/auth-panel'
import { createClient } from '@/lib/supabase/server'

function LoginPlanCard({
  title,
  price,
  detail,
  href,
  accent = 'default',
  selected = false,
}: {
  title: string
  price: string
  detail: string
  href: string
  accent?: 'default' | 'blue' | 'dark'
  selected?: boolean
}) {
  const classes =
    accent === 'blue'
      ? 'border-blue-200 bg-blue-50'
      : accent === 'dark'
        ? 'border-slate-950 bg-slate-950 text-white'
        : 'border-slate-200 bg-white'

  const selectedClasses =
    accent === 'dark'
      ? 'ring-2 ring-offset-2 ring-slate-950'
      : accent === 'blue'
        ? 'ring-2 ring-offset-2 ring-blue-500'
        : 'ring-2 ring-offset-2 ring-slate-900'

  const detailClass = accent === 'dark' ? 'text-slate-300' : 'text-slate-600'
  const linkClass =
    accent === 'dark'
      ? 'text-white'
      : accent === 'blue'
        ? 'text-blue-700'
        : 'text-slate-900'

  return (
    <Link
      href={href}
      className={`rounded-3xl border p-4 shadow-sm transition hover:-translate-y-0.5 ${classes} ${selected ? selectedClasses : ''}`}
    >
      <p className="text-sm font-semibold tracking-tight">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{price}</p>
      <p className={`mt-2 text-sm leading-6 ${detailClass}`}>{detail}</p>
      <p className={`mt-4 text-sm font-semibold ${linkClass}`}>Choose plan</p>
    </Link>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    message?: string
    plan?: 'trial' | 'month' | 'year'
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/today')
  }

  const planCopy =
    params.plan === 'trial'
      ? {
          title: 'Start your 7-day free trial',
          description:
            'Create your account to start a 7-day Pro trial, then manage your search from one system.',
        }
      : params.plan === 'month'
        ? {
            title: 'Choose Pro monthly',
            description:
              'Create your account to continue with the monthly ApplyEngine Pro plan.',
          }
        : params.plan === 'year'
          ? {
              title: 'Choose Pro yearly',
              description:
                'Create your account to continue with the yearly ApplyEngine Pro plan.',
            }
          : {
              title: 'Welcome back',
              description:
                'Log in to continue managing your job search, or create an account to get started.',
            }

  const showPlanChooser = !params.plan

  return (
    <div className="mx-auto max-w-5xl py-10 sm:py-16">
      {showPlanChooser ? (
        <div className="mb-8 space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Pricing
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Start free, then choose the plan that fits your search
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">
              Create your account for a 7-day free trial, or jump straight into
              monthly or yearly Pro.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <LoginPlanCard
              title="Free Trial"
              price="7 days free"
              detail="No charge until the 7-day trial ends."
              href="/login?plan=trial"
              accent="blue"
              selected={params.plan === 'trial'}
            />
            <LoginPlanCard
              title="Pro Monthly"
              price="$19.99/month"
              detail="Flexible monthly billing for the full ApplyEngine workflow."
              href="/login?plan=month"
              selected={params.plan === 'month'}
            />
            <LoginPlanCard
              title="Pro Yearly"
              price="$99/year"
              detail="Best value for keeping your job search system running all year."
              href="/login?plan=year"
              accent="dark"
              selected={params.plan === 'year'}
            />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-md">
      <AuthPanel
        error={params.error}
        message={params.message}
        plan={params.plan ?? null}
        title={planCopy.title}
        description={planCopy.description}
      />
      </div>
    </div>
  )
}
