'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
} from '@/components/ui/section-card'

export function ResumeImportCard() {
  const router = useRouter()
  const [resumeText, setResumeText] = useState('')
  const [resumePdfData, setResumePdfData] = useState<string | null>(null)
  const [resumeFilename, setResumeFilename] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [hasImported, setHasImported] = useState(false)

  function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }

        reject(new Error('Could not read file as data URL'))
      }
      reader.onerror = () => reject(reader.error ?? new Error('File read failed'))
      reader.readAsDataURL(file)
    })
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setHasImported(false)
      setResumeFilename(file.name)

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const dataUrl = await readFileAsDataUrl(file)
        setResumePdfData(dataUrl)
        setResumeText('')
        setMessage(`Loaded ${file.name}. Import it to extract profile data from the PDF.`)
        return
      }

      const text = await file.text()
      setResumePdfData(null)
      setResumeText(text)
      setMessage(`Loaded ${file.name}. Review the text, then import it.`)
    } catch {
      setMessage('Could not read that file. Paste the resume text instead.')
    }
  }

  async function handleImport() {
    if (!resumePdfData && !resumeText.trim()) {
      setMessage('Paste your resume text or load a resume file first.')
      return
    }

    setIsImporting(true)
    setMessage('Parsing resume and updating your profile...')

    const res = await fetch('/api/profile/import-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: resumePdfData ? undefined : resumeText,
        resumePdfData,
        resumeFilename,
      }),
    })

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      setMessage(`Error: ${result?.error || 'Failed to import resume'}`)
      setIsImporting(false)
      return
    }

    setHasImported(true)
    setMessage(
      `Imported your profile and ${result.imported?.experienceCount ?? 0} experience entr${
        result.imported?.experienceCount === 1 ? 'y' : 'ies'
      }.`
    )
    setIsImporting(false)
    router.push('/profile?onboarding=review-profile&next=%2Fjobs%2Fnew')
  }

  return (
    <SectionCard
      className="scroll-mt-24 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-md shadow-blue-100/50"
      id="resume-import"
    >
      <SectionCardHeader
        title="Step 1: Import your resume"
        description="Start here. Paste resume text or load a resume file to prefill your profile, title, location, and experience."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/profile">Open Profile</Link>
          </Button>
        }
      />
      <SectionCardBody className="space-y-4">
        <div className="rounded-2xl border border-blue-200 bg-white/80 p-4 text-sm text-slate-600">
          This is the fastest way to get started. PDF uploads are supported, and
          text-based files like `.txt`, `.md`, `.html`, and `.rtf` still work too.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".pdf,.txt,.md,.text,.html,.htm,.rtf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-medium file:text-white"
          />

          <Button
            type="button"
            variant="brand"
            onClick={() => void handleImport()}
            disabled={isImporting}
            data-tour-target="onboarding-import-resume-button"
            className="sm:shrink-0"
          >
            {isImporting ? 'Importing...' : 'Import Resume'}
          </Button>
        </div>

        {resumePdfData ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            PDF ready for import: <span className="font-medium text-slate-900">{resumeFilename ?? 'resume.pdf'}</span>
          </div>
        ) : (
          <textarea
            value={resumeText}
            onChange={(event) => {
              setResumePdfData(null)
              setResumeFilename(null)
              setResumeText(event.target.value)
            }}
            rows={16}
            placeholder="Paste your resume text here..."
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}

        {hasImported ? (
          <p className="text-sm text-slate-600">
            Taking you to your profile to review and save the imported details...
          </p>
        ) : null}
      </SectionCardBody>
    </SectionCard>
  )
}
