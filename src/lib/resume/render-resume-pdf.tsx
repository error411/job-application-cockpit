import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

type ResumePdfProps = {
  markdown: string
  candidateName?: string | null
  location?: string | null
  phone?: string | null
  email?: string | null
  targetCompany?: string | null
  targetRole?: string | null
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 40,
    fontSize: 10.2,
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  name: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9.4,
    color: '#4B5563',
  },
  targetLine: {
    marginTop: 5,
    fontSize: 9.3,
    color: '#374151',
  },
  heading: {
    fontSize: 10.8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headingFirst: {
    marginTop: 0,
  },
  headingSpaced: {
    marginTop: 12,
  },
  paragraph: {
    marginBottom: 4,
  },
  jobTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.4,
    color: '#111827',
    marginTop: 7,
    marginBottom: 2,
  },
  jobTitleFirst: {
    marginTop: 2,
  },
  jobMeta: {
    fontSize: 9.2,
    color: '#4B5563',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingRight: 8,
  },
  bullet: {
    width: 10,
    fontFamily: 'Helvetica-Bold',
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.38,
  },
})

const md = new MarkdownIt({
  html: false,
  linkify: false,
  typographer: false,
})

type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }

function normalizeText(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+\n/g, '\n').trim()
}

function stripTags(value: string): string {
  return value.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
}

function markdownToBlocks(markdown: string): Block[] {
  const rendered = md.render(markdown ?? '')
  const clean = sanitizeHtml(rendered, {
    allowedTags: ['h1', 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'br'],
    allowedAttributes: {},
  })

  const blocks: Block[] = []
  const combinedRegex =
    /<h[1-3]>([\s\S]*?)<\/h[1-3]>|<p>([\s\S]*?)<\/p>|<ul>([\s\S]*?)<\/ul>/gi
  const liRegex = /<li>([\s\S]*?)<\/li>/gi

  let match: RegExpExecArray | null
  while ((match = combinedRegex.exec(clean)) !== null) {
    const [, headingText, paragraphText, listText] = match

    if (headingText) {
      const text = normalizeText(stripTags(headingText))
      if (text) {
        blocks.push({ type: 'heading', text })
      }
      continue
    }

    if (paragraphText) {
      const text = normalizeText(stripTags(paragraphText))
      if (text) {
        blocks.push({ type: 'paragraph', text })
      }
      continue
    }

    if (listText) {
      liRegex.lastIndex = 0

      let liMatch: RegExpExecArray | null
      while ((liMatch = liRegex.exec(listText)) !== null) {
        const text = normalizeText(stripTags(liMatch[1]))
        if (text) {
          blocks.push({ type: 'bullet', text })
        }
      }
    }
  }

  return blocks
}

function buildContactLine(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' • ')
}

function normalizeCompare(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w@.+()-]/g, '')
    .trim()
}

function looksLikeContactLine(text: string): boolean {
  const hasEmail = /@/.test(text)
  const hasPhone =
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text) ||
    /\d{3}[\s.-]?\d{4}/.test(text)

  return hasEmail || hasPhone
}

function isDuplicateNameLine(
  text: string,
  candidateName?: string | null
): boolean {
  if (!candidateName) return false

  const normalizedText = normalizeCompare(text)
  const normalizedCandidateName = normalizeCompare(candidateName)

  return (
    normalizedText === normalizedCandidateName ||
    normalizedText.replace(/\s+/g, '') ===
      normalizedCandidateName.replace(/\s+/g, '')
  )
}

function isDuplicateContactLine(
  text: string,
  email?: string | null,
  phone?: string | null
): boolean {
  const normalizedText = normalizeCompare(text)
  const normalizedEmail = normalizeCompare(email)

  const matchesEmail = normalizedEmail
    ? normalizedText.includes(normalizedEmail)
    : false

  const digitsOnlyText = text.replace(/\D/g, '')
  const digitsOnlyPhone = (phone ?? '').replace(/\D/g, '')

  const matchesPhone =
    digitsOnlyPhone.length >= 7
      ? digitsOnlyText.includes(digitsOnlyPhone) ||
        digitsOnlyText.includes(digitsOnlyPhone.slice(-7))
      : false

  return looksLikeContactLine(text) && (matchesEmail || matchesPhone)
}

function stripDuplicateHeaderBlocks(
  blocks: Block[],
  options: {
    candidateName?: string | null
    email?: string | null
    phone?: string | null
  }
): Block[] {
  let startIndex = 0

  while (startIndex < blocks.length) {
    const block = blocks[startIndex]

    const isNameBlock =
      (block.type === 'heading' || block.type === 'paragraph') &&
      isDuplicateNameLine(block.text, options.candidateName)

    const isContactBlock =
      block.type === 'paragraph' &&
      isDuplicateContactLine(block.text, options.email, options.phone)

    if (isNameBlock || isContactBlock) {
      startIndex += 1
      continue
    }

    break
  }

  return blocks.slice(startIndex)
}

function looksLikeJobTitle(text: string): boolean {
  return (
    text.includes('|') &&
    text === text.toUpperCase() &&
    !text.startsWith('TARGET ROLE:')
  )
}

function looksLikeJobMeta(text: string): boolean {
  return (
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(text) &&
    text.includes('|')
  )
}

function isFirstHeading(blocks: Block[], index: number): boolean {
  return !blocks.slice(0, index).some((block) => block.type === 'heading')
}

function isFirstJobTitle(blocks: Block[], index: number): boolean {
  return !blocks
    .slice(0, index)
    .some((block) => block.type === 'paragraph' && looksLikeJobTitle(block.text))
}

export function ResumePdfDocument(props: ResumePdfProps) {
  const rawBlocks = markdownToBlocks(props.markdown)

  const blocks = stripDuplicateHeaderBlocks(rawBlocks, {
    candidateName: props.candidateName,
    email: props.email,
    phone: props.phone,
  })

  const contactLine = buildContactLine([
    props.location ?? null,
    props.phone ?? null,
    props.email ?? null,
  ])

  const targetLine = buildContactLine([
    props.targetRole ? `Target Role: ${props.targetRole}` : null,
    props.targetCompany ? `Company: ${props.targetCompany}` : null,
  ])

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {props.candidateName ? (
            <Text style={styles.name}>{props.candidateName}</Text>
          ) : null}

          {contactLine ? (
            <Text style={styles.contactLine}>{contactLine}</Text>
          ) : null}

          {targetLine ? (
            <Text style={styles.targetLine}>{targetLine}</Text>
          ) : null}
        </View>

        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            const headingStyle = isFirstHeading(blocks, index)
              ? [styles.heading, styles.headingFirst]
              : [styles.heading, styles.headingSpaced]

            return (
              <Text key={`heading-${index}`} style={headingStyle}>
                {block.text}
              </Text>
            )
          }

          if (block.type === 'paragraph' && looksLikeJobTitle(block.text)) {
            const jobTitleStyle = isFirstJobTitle(blocks, index)
              ? [styles.jobTitle, styles.jobTitleFirst]
              : styles.jobTitle

            return (
              <Text key={`job-title-${index}`} style={jobTitleStyle}>
                {block.text}
              </Text>
            )
          }

          if (block.type === 'paragraph' && looksLikeJobMeta(block.text)) {
            return (
              <Text key={`job-meta-${index}`} style={styles.jobMeta}>
                {block.text}
              </Text>
            )
          }

          if (block.type === 'bullet') {
            return (
              <View key={`bullet-${index}`} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{block.text}</Text>
              </View>
            )
          }

          return (
            <Text key={`paragraph-${index}`} style={styles.paragraph}>
              {block.text}
            </Text>
          )
        })}
      </Page>
    </Document>
  )
}