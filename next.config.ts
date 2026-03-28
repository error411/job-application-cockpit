import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core'],

  outputFileTracingIncludes: {
    '/api/application-assets/[jobId]/resume-pdf': [
      './node_modules/@sparticuz/chromium/bin/**/*',
    ],
    '/api/application-assets/[jobId]/cover-letter-pdf': [
      './node_modules/@sparticuz/chromium/bin/**/*',
    ],
  },
}

export default nextConfig