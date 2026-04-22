import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth/require-user'
import { isAdminUser, requireAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminUserActions } from './admin-user-actions'

export const metadata: Metadata = {
  title: 'Admin',
}

type RecentUser = {
  account_status: string
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  suspended_at: string | null
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

type UserMetrics = {
  activeJobs: number
  applications: number
  totalJobs: number
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

function formatJobsPerUser(activeJobs: number, totalUsers: number): string {
  if (totalUsers === 0) return '0'

  const jobsPerUser = activeJobs / totalUsers
  return jobsPerUser.toFixed(jobsPerUser >= 10 ? 0 : 1)
}

function getDisplayName(user: RecentUser): string {
  const name = user.full_name?.trim()
  if (name) return name

  return user.email ?? 'Unknown user'
}

function getStatusClasses(status: string): string {
  return status === 'suspended'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-emerald-100 text-emerald-700'
}

function getEmptyUserMetrics(): UserMetrics {
  return {
    activeJobs: 0,
    applications: 0,
    totalJobs: 0,
  }
}

function UserMetric({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="min-w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950">
        {value}
      </p>
    </div>
  )
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
    activeJobsResult,
    recentJobsResult,
    totalApplicationsResult,
    recentApplicationsResult,
    activeSubscriptionsResult,
    suspendedUsersResult,
    recentBillingEventsResult,
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
    admin
      .from('profiles')
      .select(
        'id, email, full_name, account_status, suspended_at, created_at, updated_at'
      )
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('jobs').select('id', { count: 'exact', head: true }),
    admin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null),
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
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('account_status', 'suspended'),
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
    activeJobsResult,
    recentJobsResult,
    totalApplicationsResult,
    recentApplicationsResult,
    activeSubscriptionsResult,
    suspendedUsersResult,
    recentBillingEventsResult,
  ]

  const firstError = results.find((result) => result.error)?.error
  if (firstError) {
    throw new Error(firstError.message)
  }

  const recentUsers = (recentUsersResult.data ?? []) as RecentUser[]
  const recentBillingEvents =
    (recentBillingEventsResult.data ?? []) as RecentBillingEvent[]
  const recentUserIds = recentUsers.map((recentUser) => recentUser.id)
  const [recentUserJobsResult, recentUserApplicationsResult] =
    recentUserIds.length > 0
      ? await Promise.all([
          admin
            .from('jobs')
            .select('user_id, archived_at')
            .in('user_id', recentUserIds),
          admin.from('applications').select('user_id').in('user_id', recentUserIds),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ]

  const metricsError =
    recentUserJobsResult.error ?? recentUserApplicationsResult.error
  if (metricsError) {
    throw new Error(metricsError.message)
  }

  const userMetricsById = new Map<string, UserMetrics>(
    recentUserIds.map((recentUserId) => [recentUserId, getEmptyUserMetrics()])
  )

  for (const job of recentUserJobsResult.data ?? []) {
    if (!job.user_id) continue

    const metrics = userMetricsById.get(job.user_id) ?? getEmptyUserMetrics()
    metrics.totalJobs += 1
    if (job.archived_at == null) {
      metrics.activeJobs += 1
    }
    userMetricsById.set(job.user_id, metrics)
  }

  for (const application of recentUserApplicationsResult.data ?? []) {
    if (!application.user_id) continue

    const metrics =
      userMetricsById.get(application.user_id) ?? getEmptyUserMetrics()
    metrics.applications += 1
    userMetricsById.set(application.user_id, metrics)
  }

  const totalUsers = totalUsersResult.count ?? 0
  const newUsers = newUsersResult.count ?? 0
  const totalJobs = totalJobsResult.count ?? 0
  const activeJobs = activeJobsResult.count ?? 0
  const totalApplications = totalApplicationsResult.count ?? 0
  const activeSubscriptions = activeSubscriptionsResult.count ?? 0
  const suspendedUsers = suspendedUsersResult.count ?? 0

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
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
          label="Active Jobs/User"
          value={formatJobsPerUser(activeJobs, totalUsers)}
          hint={`${activeJobs} active ${activeJobs === 1 ? 'job' : 'jobs'} across all users.`}
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
        <AdminMetric
          label="Suspended"
          value={suspendedUsers}
          hint="Accounts currently blocked from app access."
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
              {recentUsers.map((recentUser) => {
                const userMetrics =
                  userMetricsById.get(recentUser.id) ?? getEmptyUserMetrics()

                return (
                  <div
                    key={recentUser.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {getDisplayName(recentUser)}
                        </p>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-medium capitalize ${getStatusClasses(
                            recentUser.account_status
                          )}`}
                        >
                          {recentUser.account_status}
                        </span>
                      </div>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {recentUser.email ?? recentUser.id}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                      <UserMetric label="Active" value={userMetrics.activeJobs} />
                      <UserMetric label="Jobs" value={userMetrics.totalJobs} />
                      <UserMetric
                        label="Apps"
                        value={userMetrics.applications}
                      />
                    </div>

                    <div className="shrink-0 text-left text-xs text-slate-500 lg:text-right">
                      <p>Joined {formatDateTime(recentUser.created_at)}</p>
                      <p>Updated {formatDateTime(recentUser.updated_at)}</p>
                      {recentUser.suspended_at ? (
                        <p>
                          Suspended {formatDateTime(recentUser.suspended_at)}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0">
                      <AdminUserActions
                        userId={recentUser.id}
                        isSuspended={recentUser.account_status === 'suspended'}
                        isProtected={
                          recentUser.id === user.id || isAdminUser(recentUser)
                        }
                        label={getDisplayName(recentUser)}
                      />
                    </div>
                  </div>
                )
              })}
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
