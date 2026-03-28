import UnlockForm from './unlock-form'

type UnlockPageProps = {
  searchParams: Promise<{
    next?: string
  }>
}

export default async function UnlockPage({ searchParams }: UnlockPageProps) {
  const params = await searchParams
  const nextPath = params.next || '/'

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Private Site</h1>
        <p className="text-sm text-white/70 mb-6">
          Enter the shared password to continue.
        </p>

        <UnlockForm nextPath={nextPath} />
      </div>
    </main>
  )
}