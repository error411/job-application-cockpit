import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

type BuildResumeHtmlDocumentArgs = {
  markdown: string
  candidateName?: string | null
  targetCompany?: string | null
  targetRole?: string | null
  location?: string | null
  phone?: string | null
  email?: string | null
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: false,
})

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function sanitizeResumeHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'p',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'a',
      'hr',
      'blockquote',
      'br',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildDocumentTitle({
  candidateName,
  targetCompany,
  targetRole,
}: BuildResumeHtmlDocumentArgs): string {
  const parts = [
    candidateName?.trim(),
    targetRole?.trim(),
    targetCompany?.trim(),
    'Resume',
  ].filter(Boolean)

  return parts.join(' — ')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function looksLikeContactMetaLine(
  line: string,
  candidateName?: string | null,
  location?: string | null,
  phone?: string | null,
  email?: string | null
): boolean {
  const normalized = line.trim().toLowerCase()
  if (!normalized) return false

  const checks = [
    candidateName?.trim().toLowerCase(),
    location?.trim().toLowerCase(),
    phone?.trim().toLowerCase(),
    email?.trim().toLowerCase(),
  ].filter(Boolean) as string[]

  const hasKnownProfileValue = checks.some((value) => normalized.includes(value))
  const hasSeparator = normalized.includes('•') || normalized.includes('·') || normalized.includes('|')
  const hasEmailLikeText = normalized.includes('@')

  return hasKnownProfileValue || hasSeparator || hasEmailLikeText
}

function stripLeadingResumeHeaderBlock({
  markdown,
  candidateName,
  location,
  phone,
  email,
}: {
  markdown: string
  candidateName?: string | null
  location?: string | null
  phone?: string | null
  email?: string | null
}): string {
  if (!candidateName?.trim()) return markdown

  const lines = markdown.split('\n')
  if (lines.length === 0) return markdown

  const escapedName = escapeRegExp(candidateName.trim())
  const headingPattern = new RegExp(`^#\\s+${escapedName}\\s*$`, 'i')

  let index = 0

  while (index < lines.length && lines[index].trim() === '') {
    index += 1
  }

  if (index >= lines.length || !headingPattern.test(lines[index])) {
    return markdown
  }

  index += 1

  while (index < lines.length && lines[index].trim() === '') {
    index += 1
  }

  if (
    index < lines.length &&
    looksLikeContactMetaLine(
      lines[index],
      candidateName,
      location,
      phone,
      email
    )
  ) {
    index += 1

    while (index < lines.length && lines[index].trim() === '') {
      index += 1
    }
  }

  return lines.slice(index).join('\n').trim()
}

function buildResumeHeader({
  candidateName,
  location,
  phone,
  email,
}: Pick<
  BuildResumeHtmlDocumentArgs,
  'candidateName' | 'location' | 'phone' | 'email'
>): string {
  const name = candidateName?.trim()
  const contactParts = [location?.trim(), phone?.trim(), email?.trim()].filter(
    Boolean
  ) as string[]

  if (!name && contactParts.length === 0) {
    return ''
  }

  return `
    <header class="resume-header">
      ${name ? `<div class="resume-name">${escapeHtml(name)}</div>` : ''}
      ${
        contactParts.length > 0
          ? `<div class="resume-contact-line">${contactParts
              .map((part) => escapeHtml(part))
              .join(' · ')}</div>`
          : ''
      }
    </header>
  `
}

function getResumeStyles(): string {
  return `
    @page {
      size: Letter;
      margin: 0.48in 0.56in 0.5in 0.56in;
    }

    :root {
      --text: #111111;
      --muted: #4b5563;
      --subtle: #6b7280;
      --rule: #d1d5db;
      --rule-strong: #9ca3af;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      text-rendering: optimizeLegibility;
    }

    body {
      font-size: 10.4pt;
      line-height: 1.3;
    }

    .page {
      width: 100%;
    }

    .resume-header {
      margin: 0 0 0.16in 0;
    }

    .resume-name {
      font-size: 23pt;
      line-height: 1.02;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0 0 0.06in 0;
    }

    .resume-contact-line {
      font-size: 10pt;
      line-height: 1.25;
      color: var(--muted);
      margin: 0;
      word-break: break-word;
    }

    h1,
    h2,
    h3,
    p,
    ul,
    ol,
    li,
    hr,
    blockquote {
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 23pt;
      line-height: 1.02;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0 0 0.08in 0;
    }

    h1 + p {
      font-size: 10pt;
      line-height: 1.25;
      color: var(--muted);
      margin: 0 0 0.17in 0;
      word-break: break-word;
    }

    h2 {
      font-size: 9.2pt;
      line-height: 1.15;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text);
      padding: 0 0 0.04in 0;
      margin: 0.17in 0 0.08in 0;
      border-bottom: 1px solid var(--rule-strong);
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      line-height: 1.2;
      font-weight: 700;
      margin: 0.11in 0 0.02in 0;
      page-break-after: avoid;
    }

    h3 + p {
      font-size: 9.6pt;
      line-height: 1.22;
      color: var(--muted);
      margin: 0 0 0.05in 0;
    }

    p {
      margin: 0 0 0.055in 0;
      orphans: 3;
      widows: 3;
    }

    ul,
    ol {
      margin: 0.025in 0 0.075in 0.18in;
      padding: 0;
    }

    li {
      margin: 0 0 0.04in 0;
      padding-left: 0.01in;
    }

    li::marker {
      font-size: 0.9em;
    }

    a {
      color: inherit;
      text-decoration: none;
      word-break: break-word;
    }

    strong {
      font-weight: 700;
    }

    em {
      font-style: italic;
    }

    hr {
      border: 0;
      border-top: 1px solid var(--rule);
      margin: 0.12in 0;
    }

    blockquote {
      margin: 0.08in 0 0.08in 0.12in;
      padding-left: 0.12in;
      border-left: 2px solid var(--rule);
      color: var(--subtle);
    }

    h2,
    h3,
    p,
    li,
    ul,
    ol {
      page-break-inside: avoid;
    }

    h2:first-child {
      margin-top: 0;
    }

    h3:first-child {
      margin-top: 0;
    }

    p + ul,
    p + ol {
      margin-top: 0.015in;
    }

    ul + h3,
    ol + h3 {
      margin-top: 0.1in;
    }

    ul + h2,
    ol + h2,
    p + h2 {
      margin-top: 0.16in;
    }

    .resume-meta {
      display: none;
    }

    h2 + p strong:first-child,
    h2 + ul strong:first-child {
      letter-spacing: 0;
      text-transform: none;
    }

    h2 + h3 {
      margin-top: 0;
    }

    h2 + ul li,
    h2 + ol li {
      margin-bottom: 0.03in;
    }

    h3 + ul,
    h3 + ol {
      margin-top: 0.03in;
    }

    h1 + p a {
      color: inherit;
    }

    @media screen {
      body {
        background: #f3f4f6;
        padding: 24px;
      }

      .page {
        max-width: 8.5in;
        min-height: 11in;
        margin: 0 auto;
        background: #ffffff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        padding: 0.48in 0.56in 0.5in 0.56in;
      }
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .page {
        max-width: none;
        min-height: auto;
        box-shadow: none;
        padding: 0;
      }
    }
  `
}

export function buildResumeHtmlDocument({
  markdown,
  candidateName,
  targetCompany,
  targetRole,
  location,
  phone,
  email,
}: BuildResumeHtmlDocumentArgs): string {
  const normalizedMarkdown = normalizeMarkdown(markdown)
const markdownWithoutDuplicateHeader = stripLeadingResumeHeaderBlock({
  markdown: normalizedMarkdown,
  candidateName,
  location,
  phone,
  email,
})
const renderedHtml = md.render(markdownWithoutDuplicateHeader)
  const safeBody = sanitizeResumeHtml(renderedHtml)
  const title = buildDocumentTitle({
    markdown,
    candidateName,
    targetCompany,
    targetRole,
    location,
    phone,
    email,
  })

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${getResumeStyles()}</style>
  </head>
  <body>
    <main class="page">
      <div class="resume-meta">
        ${escapeHtml(targetCompany ?? '')}
        ${escapeHtml(targetRole ?? '')}
      </div>
      ${buildResumeHeader({
        candidateName,
        location,
        phone,
        email,
      })}
      ${safeBody}
    </main>
  </body>
</html>`
}