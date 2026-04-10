import { login, signup } from '@/app/login/actions'

type Plan = 'trial' | 'month' | 'year'

type AuthPanelProps = {
  error?: string
  message?: string
  title?: string
  description?: string
  plan?: Plan | null
}

const PLAN_SUMMARY: Record<
  Plan,
  {
    eyebrow: string
    price: string
    detail: string
    note?: string
  }
> = {
  trial: {
    eyebrow: 'Free Trial',
    price: '7 days free',
    detail:
      'Start on the monthly Pro plan with a 7-day trial before billing begins.',
    note: 'No charge until the 7-day trial ends.',
  },
  month: {
    eyebrow: 'Pro Monthly',
    price: '$19.99/month',
    detail: 'Flexible monthly billing for the full ApplyEngine workflow.',
  },
  year: {
    eyebrow: 'Pro Yearly',
    price: '$99/year',
    detail: 'Best value for keeping your job search system running all year.',
  },
}

export function AuthPanel({
  error,
  message,
  title = 'Log in to ApplyEngine',
  description = 'Track jobs, stay on top of follow-ups, and run your search like a system.',
  plan = null,
}: AuthPanelProps) {
  const selectedPlan = plan ? PLAN_SUMMARY[plan] : null

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {selectedPlan ? (
        <div className="mt-5 rounded-3xl border border-blue-200 bg-blue-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            {selectedPlan.eyebrow}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {selectedPlan.price}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {selectedPlan.detail}
          </p>
          {selectedPlan.note ? (
            <p className="mt-2 text-xs font-medium text-blue-700">
              {selectedPlan.note}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <form className="mt-6 space-y-4">
        <input type="hidden" name="plan" value={plan ?? ''} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            formAction={login}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Log in
          </button>

          <button
            formAction={signup}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Create account
          </button>
        </div>
      </form>
    </section>
  )
}
