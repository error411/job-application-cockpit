//before refactoring
import Link from 'next/link'
//note
export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Application Cockpit</h1>

      <div className="flex gap-4 flex-wrap">
        <Link href="/today" className="underline">
  Today
</Link>
<Link href="/apply" className="underline">
          Apply Hub
        </Link>
        <Link href="/jobs" className="underline">
          View Jobs
        </Link>
        <Link href="/jobs/new" className="underline">
          Add Job
        </Link>
        <Link href="/profile" className="underline">
          Profile
        </Link>
        <Link href="/applications" className="underline">
          Applications
        </Link>
        <Link href="/follow-ups" className="underline">
          Follow-Ups
        </Link>
      </div>
    </main>
  )
}