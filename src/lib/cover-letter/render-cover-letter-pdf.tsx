import React from 'react'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

type CoverLetterPdfProps = {
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
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 46,
    fontSize: 11,
    lineHeight: 1.55,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 18,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 10,
    marginBottom: 2,
  },
  targetLine: {
    fontSize: 10,
    marginTop: 4,
  },
  paragraph: {
    marginBottom: 10,
  },
  signoff: {
    marginTop: 18,
  },
  signoffName: {
    marginTop: 6,
  },
})

const md = new MarkdownIt({
  html: false,
  linkify: false,
  typographer: false,
})

function normalizeText(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+\n/g, '\n').trim()
}

function markdownToParagraphs(markdown: string): string[] {
  const rendered = md.render(markdown ?? '')
  const clean = sanitizeHtml(rendered, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    allowedAttributes: {},
  })

  const matches = [...clean.matchAll(/<p>([\s\S]*?)<\/p>/gi)]

  return matches
    .map((match) =>
      normalizeText(
        match[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      )
    )
    .filter(Boolean)
}

function buildLine(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' • ')
}

export function CoverLetterPdfDocument(props: CoverLetterPdfProps) {
  const paragraphs = markdownToParagraphs(props.markdown)

  const contactLine = buildLine([
    props.location ?? null,
    props.phone ?? null,
    props.email ?? null,
  ])

  const targetLine = buildLine([
    props.targetRole ? `Role: ${props.targetRole}` : null,
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

        {paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        {props.candidateName ? (
          <View style={styles.signoff}>
            <Text>Sincerely,</Text>
            <Text style={styles.signoffName}>{props.candidateName}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  )
}