import './globals.css'
import Image from 'next/image'
import { AppNav } from './app-nav'
import { HeaderAuthActions } from '@/components/auth/header-auth-actions'

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
                  <HeaderAuthActions />
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