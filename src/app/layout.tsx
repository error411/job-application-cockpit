import './globals.css'
import Link from 'next/link'
import { AppNav } from './app-nav'
import Image from 'next/image'

// function ApplyEngineMark() {
//   return (
//     <div className="relative h-10 w-10 shrink-0">
//       <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400" />
//       <div className="absolute inset-[4px] rounded-full bg-white" />
//       <div className="absolute left-[6px] top-[7px] h-[23px] w-[23px] rounded-full border-[6px] border-blue-600 border-r-cyan-400 border-b-cyan-400" />
//       <div className="absolute left-[14px] top-[12px] h-0 w-0 border-b-[7px] border-l-[12px] border-t-[7px] border-b-transparent border-l-cyan-400 border-t-transparent" />
//     </div>
//   )
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex min-h-16 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/applyengine-mark.png"
                    alt="ApplyEngine"
                    width={44}
                    height={44}
                    className="h-11 w-11"
                  />

                  <div className="leading-tight">
                    <div className="text-base font-semibold text-slate-950">
                      ApplyEngine
                    </div>
                    <div className="text-xs text-slate-500">
                      Run your job search like a system.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                  <AppNav />

                  <Link
                    href="/jobs/new"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-cyan-500"
                  >
                    Add Job
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}