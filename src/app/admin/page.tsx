import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth/require-user'
import { requireAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Admin',
}

type RecentUser = {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

type RecentBillingEvent = {
  id: string
  event_type: string
  created_at: string
  processed_at: string | null
  processing_error: string | null
  livemode: boolean
}

const ACTIVE_SUBSCRIPTION_STATUSES = [
  'active',
  'trialing',
  'past_due',
  'paused',
  'incomplete',
]

function toIsoDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Never'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getDisplayName(user: RecentUser): string {
  const name = user.full_name?.trim()
  if (name) return name

  return user.email ?? 'Unknown user'
}

function AdminMetric({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  )
}

export default async function AdminPage() {
  const { user } = await requireUser()
  requireAdminUser(user)

  const admin = createAdminClient()
  const sevenDaysAgo = toIsoDaysAgo(7)
  const thirtyDaysAgo = toIsoDaysAgo(30)

  const [
    totalUsersResult,
    newUsersResult,
    recentUsersResult,
    totalJobsResult,
    recentJobsResult,
    totalApplicationsResult,
    recentApplicationsResult,
    activeSubscriptionsResult,
    recentBillingEventsResult,
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
    admin
      .from('profiles')
      .select('id, email, full_name, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('jobs').select('id', { count: 'exact', head: true }),
    admin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo),
    admin.from('applications').select('id', { count: 'exact', head: true }),
    admin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo),
    admin
      .from('billing_subscriptions')
      .select('id', { count: 'exact', head: true })
      .in('status', ACTIVE_SUBSCRIPTION_STATUSES),
    admin
      .from('billing_events')
      .select('id, event_type, created_at, processed_at, processing_error, livemode')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const results = [
    totalUsersResult,
    newUsersResult,
    recentUsersResult,
    totalJobsResult,
    recentJobsResult,
    totalApplicationsResult,
    recentApplicationsResult,
    activeSubscriptionsResult,
    recentBillingEventsResult,
  ]

  const firstError = results.find((result) => result.error)?.error
  if (firstError) {
    throw new Error(firstError.message)
  }

  const recentUsers = (recentUsersResult.data ?? []) as RecentUser[]
  const recentBillingEvents =
    (recentBillingEventsResult.data ?? []) as RecentBillingEvent[]

  const totalUsers = totalUsersResult.count ?? 0
  const newUsers = newUsersResult.count ?? 0
  const totalJobs = totalJobsResult.count ?? 0
  const totalApplications = totalApplicationsResult.count ?? 0
  const activeSubscriptions = activeSubscriptionsResult.count ?? 0

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Usage and user pulse
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            A private readout for signups, activation, application activity,
            and billing events.
          </p>
        </div>

        {newUsers > 0 ? (
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">
            {newUsers} new {newUsers === 1 ? 'user' : 'users'} in the last 7
            days
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMetric
          label="Users"
          value={totalUsers}
          hint="Total profile records created from signup."
        />
        <AdminMetric
          label="New Users"
          value={newUsers}
          hint="Profiles created in the last 7 days."
        />
        <AdminMetric
          label="Jobs"
          value={totalJobs}
          hint={`${recentJobsResult.count ?? 0} created in the last 30 days.`}
        />
        <AdminMetric
          label="Applications"
          value={totalApplications}
          hint={`${
            recentApplicationsResult.count ?? 0
          } created in the last 30 days.`}
        />
        <AdminMetric
          label="Subscriptions"
          value={activeSubscriptions}
          hint="Active, trialing, past due, paused, or incomplete."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section
          title="New User Radar"
          description="Most recent accounts, with profile updates as a quick activation signal."
        >
          {recentUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              No users yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentUsers.map((recentUser) => (
                <div
                  key={recentUser.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {getDisplayName(recentUser)}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {recentUser.email ?? recentUser.id}
                    </p>
                  </div>
                  <div className="shrink-0 text-left text-xs text-slate-500 sm:text-right">
                    <p>Joined {formatDateTime(recentUser.created_at)}</p>
                    <p>Updated {formatDateTime(recentUser.updated_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Billing Events"
          description="Latest Stripe webhook records and processing health."
        >
          {recentBillingEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              No billing events recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {recentBillingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="break-all text-sm font-medium text-slate-950">
                      {event.event_type}
                    </p>
                    <span
                      className={
                        event.processing_error
                          ? 'rounded-full bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700'
                          : 'rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700'
                      }
                    >
                      {event.processing_error ? 'Error' : 'OK'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {event.livemode ? 'Live' : 'Test'} - Created{' '}
                    {formatDateTime(event.created_at)} - Processed{' '}
                    {formatDateTime(event.processed_at)}
                  </p>
                  {event.processing_error ? (
                    <p className="mt-2 line-clamp-2 text-xs text-rose-700">
                      {event.processing_error}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Section>
      </section>
    </div>
  )
}
