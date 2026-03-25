import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

type BuildCoverLetterHtmlDocumentArgs = {
  markdown: string
  candidateName?: string | null
  targetCompany?: string | null
  targetRole?: string | null
  city?: string | null
  state?: string | null
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

function sanitizeCoverLetterHtml(html: string): string {
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
}: BuildCoverLetterHtmlDocumentArgs): string {
  const parts = [
    candidateName?.trim(),
    targetRole?.trim(),
    targetCompany?.trim(),
    'Cover Letter',
  ].filter(Boolean)

  return parts.join(' — ')
}

function buildHeader({
  candidateName,
  city,
  state,
  phone,
  email,
}: Pick<
  BuildCoverLetterHtmlDocumentArgs,
  'candidateName' | 'city' | 'state' | 'phone' | 'email'
>): string {
  const location = [city?.trim(), state?.trim()].filter(Boolean).join(', ')

  const lines = [
    candidateName?.trim() || '',
    location,
    phone?.trim() || '',
    email?.trim() || '',
  ].filter(Boolean)

  if (lines.length === 0) {
    return ''
  }

  return `
    <header class="cl-header">
      ${lines
        .map((line, index) =>
          index === 0
            ? `<div class="cl-name">${escapeHtml(line)}</div>`
            : `<div class="cl-contact-line">${escapeHtml(line)}</div>`
        )
        .join('')}
    </header>
  `
}

function buildSignoff(candidateName?: string | null): string {
  if (!candidateName) return ''

  return `
    <div class="cl-signoff">
      <p>Sincerely,</p>
      <p class="cl-signoff-name">${escapeHtml(candidateName)}</p>
    </div>
  `
}

function getCoverLetterStyles(): string {
  return `
    @page {
      size: Letter;
      margin: 0.7in 0.75in 0.75in 0.75in;
    }

    :root {
      --text: #111111;
      --muted: #4b5563;
      --rule: #d1d5db;
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
      font-size: 11pt;
      line-height: 1.5;
    }

    .page {
      width: 100%;
    }

    .cl-header {
      margin: 0 0 0.3in 0;
    }

    .cl-name {
      font-size: 13pt;
      line-height: 1.2;
      font-weight: 700;
      margin: 0 0 0.04in 0;
    }

    .cl-contact-line {
      font-size: 11pt;
      line-height: 1.35;
      margin: 0 0 0.02in 0;
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
      font-size: 18pt;
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 0.08in 0;
    }

    h1 + p {
      color: var(--muted);
      margin: 0 0 0.22in 0;
      font-size: 10.5pt;
      line-height: 1.35;
    }

    h2,
    h3 {
      font-size: 11pt;
      line-height: 1.3;
      font-weight: 700;
      margin: 0.16in 0 0.06in 0;
    }

    p {
      margin: 0 0 0.14in 0;
      orphans: 3;
      widows: 3;
    }

    ul,
    ol {
      margin: 0.05in 0 0.14in 0.22in;
      padding: 0;
    }

    li {
      margin: 0 0 0.06in 0;
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
      margin: 0.16in 0;
    }

    blockquote {
      margin: 0.08in 0 0.14in 0.12in;
      padding-left: 0.12in;
      border-left: 2px solid var(--rule);
      color: var(--muted);
    }

    h1,
    h2,
    h3,
    p,
    li {
      page-break-inside: avoid;
    }

    .cover-letter-meta {
      display: none;
    }

    .cl-signoff {
  margin-top: 0.3in;
}

.cl-signoff-name {
  margin-top: 0.08in;
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
        padding: 0.7in 0.75in 0.75in 0.75in;
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

export function buildCoverLetterHtmlDocument({
  markdown,
  candidateName,
  targetCompany,
  targetRole,
  city,
  state,
  phone,
  email,
}: BuildCoverLetterHtmlDocumentArgs): string {
  const normalizedMarkdown = normalizeMarkdown(markdown)
  const renderedHtml = md.render(normalizedMarkdown)
  const safeBody = sanitizeCoverLetterHtml(renderedHtml)
  const title = buildDocumentTitle({
    candidateName,
    targetCompany,
    targetRole,
    markdown,
    city,
    state,
    phone,
    email,
  })

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${getCoverLetterStyles()}</style>
  </head>
  <body>
    <main class="page">
      <div class="cover-letter-meta">
        ${escapeHtml(targetCompany ?? '')}
        ${escapeHtml(targetRole ?? '')}
      </div>
      ${buildHeader({
        candidateName,
        city,
        state,
        phone,
        email,
      })}
      ${safeBody}
${buildSignoff(candidateName)}
    </main>
  </body>
</html>`
}