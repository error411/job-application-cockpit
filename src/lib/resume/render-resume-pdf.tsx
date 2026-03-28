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
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10.5,
    lineHeight: 1.45,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  header: {
    marginBottom: 14,
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
    fontSize: 9.5,
    color: '#4B5563',
  },
  targetLine: {
    marginTop: 6,
    fontSize: 9.5,
    color: '#374151',
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    textTransform: 'uppercase',
    color: '#111827',
  },
  paragraph: {
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 8,
  },
  bullet: {
    width: 10,
    fontFamily: 'Helvetica-Bold',
  },
  bulletText: {
    flex: 1,
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

function markdownToBlocks(markdown: string): Block[] {
  const rendered = md.render(markdown ?? '')
  const clean = sanitizeHtml(rendered, {
    allowedTags: ['h1', 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'br'],
    allowedAttributes: {},
  })

  const blocks: Block[] = []
  const liRegex = /<li>([\s\S]*?)<\/li>/gi
  const combinedRegex =
    /<h[1-3]>([\s\S]*?)<\/h[1-3]>|<p>([\s\S]*?)<\/p>|<ul>([\s\S]*?)<\/ul>/gi

  let match: RegExpExecArray | null
  while ((match = combinedRegex.exec(clean)) !== null) {
    const [fullMatch, headingText, paragraphText, listText] = match

    if (headingText) {
      const text = normalizeText(
        headingText.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      )
      if (text) blocks.push({ type: 'heading', text })
      continue
    }

    if (paragraphText) {
      const text = normalizeText(
        paragraphText.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      )
      if (text) blocks.push({ type: 'paragraph', text })
      continue
    }

    if (listText) {
      let liMatch: RegExpExecArray | null
      while ((liMatch = liRegex.exec(fullMatch)) !== null) {
        const text = normalizeText(
          liMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
        )
        if (text) blocks.push({ type: 'bullet', text })
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

  return normalizeCompare(text) === normalizeCompare(candidateName)
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

  if (
    blocks[startIndex]?.type === 'paragraph' &&
    isDuplicateNameLine(blocks[startIndex].text, options.candidateName)
  ) {
    startIndex += 1
  }

  if (
    blocks[startIndex]?.type === 'paragraph' &&
    isDuplicateContactLine(
      blocks[startIndex].text,
      options.email,
      options.phone
    )
  ) {
    startIndex += 1
  }

  return blocks.slice(startIndex)
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
          {contactLine ? <Text style={styles.contactLine}>{contactLine}</Text> : null}
          {targetLine ? <Text style={styles.targetLine}>{targetLine}</Text> : null}
        </View>

        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            return (
              <View key={`heading-${index}`} style={styles.section}>
                <Text style={styles.heading}>{block.text}</Text>
              </View>
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