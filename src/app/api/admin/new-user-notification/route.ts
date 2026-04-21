import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const profileRecordSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
})

const webhookPayloadSchema = z.object({
  type: z.string().optional(),
  table: z.string().optional(),
  schema: z.string().optional(),
  record: profileRecordSchema,
})

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

function getNotificationEmail(): string {
  const explicitEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim()
  if (explicitEmail) return explicitEmail

  const firstAdminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim()
  if (firstAdminEmail) return firstAdminEmail

  throw new Error('Missing ADMIN_NOTIFICATION_EMAIL or ADMIN_EMAILS')
}

function buildTextEmail(user: z.infer<typeof profileRecordSchema>): string {
  return [
    'A new ApplyEngine user signed up.',
    '',
    `Name: ${user.full_name?.trim() || 'Unknown'}`,
    `Email: ${user.email?.trim() || 'Unknown'}`,
    `User ID: ${user.id}`,
    `Created: ${user.created_at || 'Unknown'}`,
    '',
    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin`,
  ].join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildHtmlEmail(user: z.infer<typeof profileRecordSchema>): string {
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
    : 'http://localhost:3000/admin'
  const name = escapeHtml(user.full_name?.trim() || 'Unknown')
  const email = escapeHtml(user.email?.trim() || 'Unknown')
  const userId = escapeHtml(user.id)
  const createdAt = escapeHtml(user.created_at || 'Unknown')

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">New ApplyEngine signup</h1>
      <p style="margin: 0 0 16px;">A new user signed up.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 560px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Name</td>
          <td style="padding: 8px 0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Email</td>
          <td style="padding: 8px 0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">User ID</td>
          <td style="padding: 8px 0;">${userId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Created</td>
          <td style="padding: 8px 0;">${createdAt}</td>
        </tr>
      </table>
      <p style="margin: 20px 0 0;">
        <a href="${adminUrl}" style="color: #2563eb;">Open admin dashboard</a>
      </p>
    </div>
  `
}

async function sendSignupEmail(user: z.infer<typeof profileRecordSchema>) {
  const resendApiKey = getRequiredEnv('RESEND_API_KEY')
  const to = getNotificationEmail()
  const from =
    process.env.ADMIN_NOTIFICATION_FROM?.trim() ||
    'ApplyEngine <notifications@apply-engine.com>'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'New ApplyEngine signup',
      text: buildTextEmail(user),
      html: buildHtmlEmail(user),
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Resend email failed: ${details}`)
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-admin-webhook-secret')

  if (!secret || secret !== process.env.ADMIN_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized.' },
      { status: 401 }
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON payload.' },
      { status: 400 }
    )
  }

  const parsedPayload = webhookPayloadSchema.safeParse(body)

  if (!parsedPayload.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid webhook payload.' },
      { status: 400 }
    )
  }

  const payload = parsedPayload.data

  if (payload.type && payload.type !== 'INSERT') {
    return NextResponse.json(
      { ok: false, error: 'Unexpected webhook event type.' },
      { status: 400 }
    )
  }

  if (
    payload.schema &&
    payload.table &&
    (payload.schema !== 'public' || payload.table !== 'profiles')
  ) {
    return NextResponse.json(
      { ok: false, error: 'Unexpected webhook source.' },
      { status: 400 }
    )
  }

  await sendSignupEmail(payload.record)

  return NextResponse.json({ ok: true })
}
