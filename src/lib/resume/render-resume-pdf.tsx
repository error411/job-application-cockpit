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

  const headingRegex = /<h[1-3]>(.*?)<\/h[1-3]>/gis
  const paragraphRegex = /<p>(.*?)<\/p>/gis
  const listRegex = /<ul>(.*?)<\/ul>/gis
  const liRegex = /<li>(.*?)<\/li>/gis

  const combinedRegex =
    /<h[1-3]>(.*?)<\/h[1-3]>|<p>(.*?)<\/p>|<ul>(.*?)<\/ul>/gis

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

export function ResumePdfDocument(props: ResumePdfProps) {
  const blocks = markdownToBlocks(props.markdown)

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