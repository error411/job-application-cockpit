import { requireUser } from '@/lib/auth/require-user'
import { isAdminUser } from '@/lib/admin'
import { getBillingStatusForUser } from '@/lib/billing/get-billing-status'
import { formatDate } from '@/lib/dates'
import BillingPortalButton from './billing-portal-button'
import { TimezoneOffsetForm } from './timezone-offset-form'
import UpgradeButton from './upgrade-button'

type AccountPageProps = {
  searchParams?: Promise<{ billing?: string }>
}

type PlanOption = {
  label: string
  priceLabel: string
  detail: string
  cta: string
  billingInterval: 'month' | 'year'
  trialDays?: number
}

function isMissingTimezoneOffsetColumn(error: { message?: string } | null) {
  return (
    typeof error?.message === 'string' &&
    error.message.includes('profiles.timezone_offset_minutes')
  )
}

function buildPlans(): Partial<Record<'trial' | 'month' | 'year', PlanOption>> {
  const plans: Partial<Record<'trial' | 'month' | 'year', PlanOption>> = {}

  if (process.env.STRIPE_PRICE_PRO_MONTHLY_ID) {
    plans.trial = {
      label: 'Free Trial',
      priceLabel: '7 days free',
      detail:
        'Start with a 7-day trial on Pro, then continue on the monthly plan unless cancelled.',
      cta: 'Start Free Trial',
      billingInterval: 'month',
      trialDays: 7,
    }
    plans.month = {
      label: 'Monthly',
      priceLabel:
        process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_DISPLAY ?? '$19.99/month',
      detail: 'Flexible access to ApplyEngine Pro billed monthly.',
      cta: 'Choose Monthly',
      billingInterval: 'month',
    }
  }

  if (process.env.STRIPE_PRICE_PRO_YEARLY_ID) {
    plans.year = {
      label: 'Yearly',
      priceLabel:
        process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_DISPLAY ?? '$99/year',
      detail: 'Best value for long-term use with yearly billing.',
      cta: 'Choose Yearly',
      billingInterval: 'year',
    }
  }

  if (Object.keys(plans).length > 0) return plans

  return {
    trial: {
      label: 'Free Trial',
      priceLabel: '7 days free',
      detail:
        'Start with a 7-day trial on Pro, then continue on the monthly plan unless cancelled.',
      cta: 'Start Free Trial',
      billingInterval: 'month',
      trialDays: 7,
    },
    month: {
      label: 'Monthly',
      priceLabel: '$19.99/month',
      detail: 'Flexible access to ApplyEngine Pro billed monthly.',
      cta: 'Choose Monthly',
      billingInterval: 'month',
    },
  }
}

function AccountInfoCard({
  email,
  userId,
  createdAt,
  lastSignInAt,
}: {
  email: string | undefined
  userId: string
  createdAt: string
  lastSignInAt?: string | null
}) {
  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-zinc-100 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Account
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
          User Profile
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Sign-in identity and account metadata for this ApplyEngine user.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            Email
          </p>
          <p className="mt-2 break-words text-sm font-semibold text-zinc-950">
            {email ?? 'No email on account'}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            User ID
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-zinc-950">
            {userId}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            Created
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-950">
            {formatDate(createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            Last Sign-In
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-950">
            {lastSignInAt ? formatDate(lastSignInAt) : 'Not available'}
          </p>
        </div>
      </div>
    </section>
  )
}

function BillingCard({
  billingState,
  plans,
  isPro,
  billingInterval,
  currentPeriodEnd,
}: {
  billingState?: string
  plans: Partial<Record<'trial' | 'month' | 'year', PlanOption>>
  isPro: boolean
  billingInterval: 'month' | 'year' | null
  currentPeriodEnd: string | null
}) {
  const statusMessage =
    billingState === 'success'
      ? 'Checkout completed. If the subscription is still settling, refresh in a few seconds.'
      : billingState === 'cancelled'
        ? 'Checkout was cancelled. You can start again any time.'
        : billingState === 'portal'
          ? 'Returned from the Stripe billing portal.'
          : billingState === 'trial'
            ? 'Account ready. Starting your 7-day trial checkout now.'
            : billingState === 'month'
              ? 'Account ready. Starting monthly checkout now.'
              : billingState === 'year'
                ? 'Account ready. Starting yearly checkout now.'
                : null

  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-zinc-100 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Billing
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
          Subscription
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your ApplyEngine plan and Stripe billing portal.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {statusMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {statusMessage}
          </div>
        ) : null}

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            Current Plan
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
            {isPro ? 'Pro active' : 'Free'}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {isPro
              ? `Interval: ${billingInterval ?? 'unknown'}`
              : 'No active subscription synced yet.'}
          </p>
          {currentPeriodEnd ? (
            <p className="mt-1 text-sm text-zinc-500">
              Current period ends {formatDate(currentPeriodEnd)}
            </p>
          ) : null}
        </div>

        {isPro ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Your active subscription is synced. Use Stripe to change payment
              method, view invoices, or manage cancellation.
            </p>
            <BillingPortalButton />
          </div>
        ) : (
          <UpgradeButton
            plans={plans}
            autoStartIntent={
              billingState === 'trial' ||
              billingState === 'month' ||
              billingState === 'year'
                ? billingState
                : null
            }
          />
        )}
      </div>
    </section>
  )
}

function AdminTimezoneCard({
  timezoneOffsetMinutes,
}: {
  timezoneOffsetMinutes: number | null
}) {
  return (
    <section className="app-panel rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-zinc-100 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Admin
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
          Timezone Offset
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Used for admin dashboard timestamps rendered on the server.
        </p>
      </div>

      <div className="mt-5">
        <TimezoneOffsetForm initialOffsetMinutes={timezoneOffsetMinutes} />
      </div>
    </section>
  )
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = searchParams ? await searchParams : undefined
  const { supabase, user } = await requireUser()
  const [billingStatus, profileResult] = await Promise.all([
    getBillingStatusForUser(supabase, user.id),
    supabase
      .from('profiles')
      .select('timezone_offset_minutes')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  if (
    profileResult.error &&
    !isMissingTimezoneOffsetColumn(profileResult.error)
  ) {
    throw new Error(profileResult.error.message)
  }

  const isAdmin = isAdminUser(user)
  const hasTimezoneOffsetColumn =
    !isMissingTimezoneOffsetColumn(profileResult.error)
  const timezoneOffsetMinutes =
    profileResult.data?.timezone_offset_minutes ?? null

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Account settings
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            Manage your sign-in profile and billing. Candidate resume/profile
            details stay on the Profile page.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AccountInfoCard
          email={user.email}
          userId={user.id}
          createdAt={user.created_at}
          lastSignInAt={user.last_sign_in_at}
        />

        <BillingCard
          billingState={params?.billing}
          plans={buildPlans()}
          isPro={billingStatus.isPro}
          billingInterval={billingStatus.subscription?.billingInterval ?? null}
          currentPeriodEnd={billingStatus.subscription?.currentPeriodEnd ?? null}
        />
      </section>

      {isAdmin && hasTimezoneOffsetColumn ? (
        <AdminTimezoneCard timezoneOffsetMinutes={timezoneOffsetMinutes} />
      ) : null}
    </div>
  )
}
