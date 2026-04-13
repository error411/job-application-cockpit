import { z } from 'zod'
import { openai } from '@/lib/openai/client'

const parsedExperienceSchema = z.object({
  company: z.string().trim(),
  title: z.string().trim(),
  location: z.string().trim().nullable(),
  start_date: z.string().trim().nullable(),
  end_date: z.string().trim().nullable(),
  is_current: z.boolean(),
  summary: z.string().trim().nullable(),
  bullets: z.array(z.string().trim()),
  technologies: z.array(z.string().trim()),
  sort_order: z.number().int().nonnegative(),
})

const parsedResumeSchema = z.object({
  full_name: z.string().trim().nullable(),
  email: z.string().trim().nullable(),
  phone: z.string().trim().nullable(),
  location: z.string().trim().nullable(),
  linkedin_url: z.string().trim().nullable(),
  title: z.string().trim().nullable(),
  summary: z.string().trim().nullable(),
  strengths: z.array(z.string().trim()),
  experience_bullets: z.array(z.string().trim()),
  experience: z.array(parsedExperienceSchema),
})

export type ParsedResumeProfile = z.infer<typeof parsedResumeSchema>

function getParsedResumeSchema() {
  return {
    type: 'json_schema' as const,
    name: 'parsed_resume_profile',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        full_name: { type: ['string', 'null'] },
        email: { type: ['string', 'null'] },
        phone: { type: ['string', 'null'] },
        location: { type: ['string', 'null'] },
        linkedin_url: { type: ['string', 'null'] },
        title: { type: ['string', 'null'] },
        summary: { type: ['string', 'null'] },
        strengths: {
          type: 'array',
          items: { type: 'string' },
        },
        experience_bullets: {
          type: 'array',
          items: { type: 'string' },
        },
        experience: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              company: { type: 'string' },
              title: { type: 'string' },
              location: { type: ['string', 'null'] },
              start_date: { type: ['string', 'null'] },
              end_date: { type: ['string', 'null'] },
              is_current: { type: 'boolean' },
              summary: { type: ['string', 'null'] },
              bullets: {
                type: 'array',
                items: { type: 'string' },
              },
              technologies: {
                type: 'array',
                items: { type: 'string' },
              },
              sort_order: { type: 'integer' },
            },
            required: [
              'company',
              'title',
              'location',
              'start_date',
              'end_date',
              'is_current',
              'summary',
              'bullets',
              'technologies',
              'sort_order',
            ],
          },
        },
      },
      required: [
        'full_name',
        'email',
        'phone',
        'location',
        'linkedin_url',
        'title',
        'summary',
        'strengths',
        'experience_bullets',
        'experience',
      ],
    },
  }
}

function getParseInstructions() {
  return `
Extract structured candidate profile data from resume text.

Rules:
- Use only facts explicitly supported by the resume text or PDF
- Do not invent names, employers, links, dates, skills, metrics, or education
- Keep summary concise and grounded in the resume
- Strengths should be short phrases derived from repeated or clear themes in the resume
- Experience bullets should capture high-signal accomplishments from the resume
- Return experience entries in reverse chronological order
- sort_order must start at 0 and increment by 1
- For start_date and end_date, only return YYYY-MM-DD
- If a resume provides month and year but not a day, normalize to the first day of that month
- If a resume provides only a year or the date is ambiguous, return null for that date
- If the role is current, set is_current to true and end_date to null
- If a field is missing, return null or an empty array
- Output must follow the schema exactly
  `.trim()
}

function toNullableString(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function normalizeDate(value: string | null) {
  if (!value) return null

  const trimmed = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null
}

export async function parseResumeText(
  resumeText: string
): Promise<ParsedResumeProfile> {
  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: [
      {
        role: 'system',
        content: getParseInstructions(),
      },
      {
        role: 'user',
        content: `Resume text:\n${resumeText}`,
      },
    ],
    text: {
      format: {
        ...getParsedResumeSchema(),
      },
    },
  })

  return normalizeParsedResumeResponse(response.output_text)
}

export async function parseResumePdf(
  fileData: string,
  filename = 'resume.pdf'
): Promise<ParsedResumeProfile> {
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: getParseInstructions(),
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_file',
            filename,
            file_data: fileData,
          },
          {
            type: 'input_text',
            text: 'Extract the candidate profile and work history from this resume PDF.',
          },
        ],
      },
    ],
    text: {
      format: {
        ...getParsedResumeSchema(),
      },
    },
  })

  return normalizeParsedResumeResponse(response.output_text)
}

function normalizeParsedResumeResponse(rawOutputText: string | undefined) {
  const rawText = rawOutputText?.trim()

  if (!rawText) {
    throw new Error('No parsed resume payload returned from model')
  }

  const parsedJson = JSON.parse(rawText) as unknown
  const parsed = parsedResumeSchema.parse(parsedJson)

  return {
    full_name: toNullableString(parsed.full_name),
    email: toNullableString(parsed.email),
    phone: toNullableString(parsed.phone),
    location: toNullableString(parsed.location),
    linkedin_url: toNullableString(parsed.linkedin_url),
    title: toNullableString(parsed.title),
    summary: toNullableString(parsed.summary),
    strengths: uniqueStrings(parsed.strengths),
    experience_bullets: uniqueStrings(parsed.experience_bullets),
    experience: parsed.experience
      .filter((item) => item.company.length > 0 && item.title.length > 0)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item, index) => ({
        company: item.company.trim(),
        title: item.title.trim(),
        location: toNullableString(item.location),
        start_date: normalizeDate(item.start_date),
        end_date: item.is_current ? null : normalizeDate(item.end_date),
        is_current: item.is_current,
        summary: toNullableString(item.summary),
        bullets: uniqueStrings(item.bullets),
        technologies: uniqueStrings(item.technologies),
        sort_order: index,
      })),
  }
}
