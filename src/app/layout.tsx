import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AppHeader } from '@/components/app-header'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://apply-engine.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'ApplyEngine',
  title: {
    default: 'ApplyEngine',
    template: '%s | ApplyEngine',
  },
  description:
    'ApplyEngine helps you track job applications, manage follow-ups, work the right next actions, and understand pipeline performance.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'ApplyEngine',
    title: 'ApplyEngine',
    description:
      'Track jobs, manage follow-ups, and understand your application pipeline with clearer workflow and reporting.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApplyEngine',
    description:
      'Track jobs, manage follow-ups, and understand your application pipeline with clearer workflow and reporting.',
  },
  robots: {
    index: false,
    follow: false,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="min-h-screen">
          <AppHeader showAddJobCta />

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
