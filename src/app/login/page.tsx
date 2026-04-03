import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">ApplyEngine</h1>
      <p className="mt-2 text-sm text-slate-600">
        Log in or create your account.
      </p>

      {params.error ? (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      {params.message ? (
        <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      ) : null}

      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            formAction={login}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Log in
          </button>

          <button
            formAction={signup}
            className="rounded border px-4 py-2"
          >
            Sign up
          </button>
        </div>
      </form>
    </main>
  )
}