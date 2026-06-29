'use client'

import { useMemo, useState } from 'react'
import type {
  AccomplishmentRow,
  CertificationRow,
  EducationRow,
  ProjectRow,
  ResumeVariantComposition,
  ResumeVariantRow,
  RoleRow,
  SkillRow,
  TechnologyRow,
} from '@/lib/careeros/types'

type VariantFormState = {
  name: string
  target_company: string
  target_title: string
  target_description: string
  variant_type: string
  role_ids: string[]
  project_ids: string[]
  accomplishment_ids: string[]
  skill_ids: string[]
  technology_ids: string[]
  education_ids: string[]
  certification_ids: string[]
  section_order: string
}

type SourceOption = {
  id: string
  label: string
  detail?: string | null
}

type ResumeVariantsManagerProps = {
  careerProfileId: string
  initialVariants: ResumeVariantRow[]
  roles: RoleRow[]
  projects: ProjectRow[]
  accomplishments: AccomplishmentRow[]
  skills: SkillRow[]
  technologies: TechnologyRow[]
  education: EducationRow[]
  certifications: CertificationRow[]
}

const DEFAULT_SECTION_ORDER = [
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
]

const VARIANT_STARTERS = [
  {
    label: 'Full-stack SaaS',
    name: 'Full-stack SaaS Developer',
    target_title: 'Full-stack SaaS Developer',
    variant_type: 'targeted_resume',
    keywords: ['SaaS', 'React', 'Next.js', 'TypeScript', 'Supabase', 'PostgreSQL'],
  },
  {
    label: 'WordPress/PHP',
    name: 'WordPress / PHP Consultant',
    target_title: 'WordPress Developer',
    variant_type: 'targeted_resume',
    keywords: ['WordPress', 'PHP', 'CMS', 'client'],
  },
  {
    label: 'Support/Ops',
    name: 'Technical Support and Hosting Operations',
    target_title: 'Technical Support Specialist',
    variant_type: 'targeted_resume',
    keywords: ['support', 'hosting', 'DNS', 'email', 'Linux'],
  },
  {
    label: 'Drupal/CMS',
    name: 'Drupal CMS Developer',
    target_title: 'Drupal Developer',
    variant_type: 'targeted_resume',
    keywords: ['Drupal', 'Twig', 'DDEV', 'Drush', 'CMS'],
  },
]

function compositionFromVariant(
  variant: ResumeVariantRow
): ResumeVariantComposition {
  return typeof variant.composition === 'object' &&
    variant.composition !== null &&
    !Array.isArray(variant.composition)
    ? (variant.composition as ResumeVariantComposition)
    : {}
}

function idList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter(Boolean)
    : []
}

function formFromVariant(variant: ResumeVariantRow): VariantFormState {
  const composition = compositionFromVariant(variant)

  return {
    name: variant.name,
    target_company: variant.target_company ?? '',
    target_title: variant.target_title ?? '',
    target_description: variant.target_description ?? '',
    variant_type: variant.variant_type,
    role_ids: idList(composition.role_ids),
    project_ids: idList(composition.project_ids),
    accomplishment_ids: idList(composition.accomplishment_ids),
    skill_ids: idList(composition.skill_ids),
    technology_ids: idList(composition.technology_ids),
    education_ids: idList(composition.education_ids),
    certification_ids: idList(composition.certification_ids),
    section_order: idList(composition.section_order).join(', '),
  }
}

function emptyForm(careerProfileName = 'Targeted Resume'): VariantFormState {
  return {
    name: careerProfileName,
    target_company: '',
    target_title: '',
    target_description: '',
    variant_type: 'targeted_resume',
    role_ids: [],
    project_ids: [],
    accomplishment_ids: [],
    skill_ids: [],
    technology_ids: [],
    education_ids: [],
    certification_ids: [],
    section_order: DEFAULT_SECTION_ORDER.join(', '),
  }
}

function toComposition(form: VariantFormState): ResumeVariantComposition {
  return {
    role_ids: form.role_ids,
    project_ids: form.project_ids,
    accomplishment_ids: form.accomplishment_ids,
    skill_ids: form.skill_ids,
    technology_ids: form.technology_ids,
    education_ids: form.education_ids,
    certification_ids: form.certification_ids,
    section_order: form.section_order
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  }
}

function includesKeyword(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase()

  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
}

function getStarterForm({
  starter,
  roles,
  projects,
  accomplishments,
  skills,
  technologies,
}: {
  starter: (typeof VARIANT_STARTERS)[number]
  roles: RoleRow[]
  projects: ProjectRow[]
  accomplishments: AccomplishmentRow[]
  skills: SkillRow[]
  technologies: TechnologyRow[]
}): VariantFormState {
  return {
    ...emptyForm(starter.name),
    name: starter.name,
    target_title: starter.target_title,
    variant_type: starter.variant_type,
    role_ids: roles
      .filter((role) =>
        includesKeyword(
          `${role.title} ${role.summary ?? ''} ${role.responsibilities.join(' ')}`,
          starter.keywords
        )
      )
      .map((role) => role.id),
    project_ids: projects
      .filter((project) =>
        includesKeyword(
          `${project.name} ${project.summary ?? ''} ${project.description ?? ''}`,
          starter.keywords
        )
      )
      .map((project) => project.id),
    accomplishment_ids: accomplishments
      .filter((accomplishment) =>
        includesKeyword(
          `${accomplishment.title ?? ''} ${accomplishment.statement} ${
            accomplishment.impact_summary ?? ''
          } ${accomplishment.scope ?? ''}`,
          starter.keywords
        )
      )
      .map((accomplishment) => accomplishment.id),
    skill_ids: skills
      .filter((skill) =>
        includesKeyword(`${skill.name} ${skill.summary ?? ''}`, starter.keywords)
      )
      .map((skill) => skill.id),
    technology_ids: technologies
      .filter((technology) => includesKeyword(technology.name, starter.keywords))
      .map((technology) => technology.id),
  }
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-900">
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
    />
  )
}

function CheckboxGroup({
  title,
  options,
  selectedIds,
  onChange,
}: {
  title: string
  options: SourceOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const selected = new Set(selectedIds)

  function toggle(id: string) {
    if (selected.has(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id))
      return
    }

    onChange([...selectedIds, id])
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-zinc-950">{title}</h4>
        <span className="text-xs text-zinc-500">{selectedIds.length}</span>
      </div>
      {options.length > 0 ? (
        <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-sm transition hover:bg-zinc-50"
            >
              <input
                type="checkbox"
                checked={selected.has(option.id)}
                onChange={() => toggle(option.id)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-zinc-800">
                  {option.label}
                </span>
                {option.detail ? (
                  <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                    {option.detail}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No source records yet.</p>
      )}
    </div>
  )
}

function describeSelected(
  selectedIds: string[],
  options: SourceOption[]
): string[] {
  const labels = new Map(options.map((option) => [option.id, option.label]))

  return selectedIds
    .map((id) => labels.get(id))
    .filter((label): label is string => Boolean(label))
}

function VariantSummary({
  variant,
  sourceLabels,
}: {
  variant: ResumeVariantRow
  sourceLabels: Record<string, string[]>
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-zinc-950">
          {variant.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-600">
          {variant.target_title || variant.variant_type}
          {variant.target_company ? ` at ${variant.target_company}` : ''}
        </p>
      </div>

      {variant.target_description ? (
        <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
          {variant.target_description}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(sourceLabels).map(([label, items]) => (
          <div key={label} className="rounded-2xl border border-zinc-200 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              {label}
            </p>
            {items.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">None selected.</p>
            )}
          </div>
        ))}
      </div>

      {variant.generated_markdown ? (
        <details className="rounded-2xl border border-zinc-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-zinc-900">
            Generated Markdown
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-4 text-xs leading-5 text-zinc-50">
            {variant.generated_markdown}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

export function ResumeVariantsManager({
  careerProfileId,
  initialVariants,
  roles,
  projects,
  accomplishments,
  skills,
  technologies,
  education,
  certifications,
}: ResumeVariantsManagerProps) {
  const sortedInitialVariants = useMemo(
    () =>
      [...initialVariants].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    [initialVariants]
  )
  const [variants, setVariants] = useState(sortedInitialVariants)
  const [selectedId, setSelectedId] = useState<string | null>(
    sortedInitialVariants[0]?.id ?? null
  )
  const [mode, setMode] = useState<'view' | 'edit' | 'new'>('view')
  const [form, setForm] = useState<VariantFormState>(
    sortedInitialVariants[0]
      ? formFromVariant(sortedInitialVariants[0])
      : emptyForm()
  )
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const selectedVariant =
    variants.find((variant) => variant.id === selectedId) ?? variants[0] ?? null

  const roleOptions = roles.map((role) => ({
    id: role.id,
    label: role.title,
    detail: role.summary,
  }))
  const projectOptions = projects.map((project) => ({
    id: project.id,
    label: project.name,
    detail: project.summary,
  }))
  const accomplishmentOptions = accomplishments.map((accomplishment) => ({
    id: accomplishment.id,
    label: accomplishment.title ?? accomplishment.statement,
    detail: accomplishment.title ? accomplishment.statement : accomplishment.scope,
  }))
  const skillOptions = skills.map((skill) => ({
    id: skill.id,
    label: skill.name,
    detail: skill.category,
  }))
  const technologyOptions = technologies.map((technology) => ({
    id: technology.id,
    label: technology.name,
    detail: technology.category,
  }))
  const educationOptions = education.map((item) => ({
    id: item.id,
    label: item.institution,
    detail: item.degree,
  }))
  const certificationOptions = certifications.map((item) => ({
    id: item.id,
    label: item.name,
    detail: item.issuer,
  }))

  function selectVariant(variant: ResumeVariantRow) {
    setSelectedId(variant.id)
    setForm(formFromVariant(variant))
    setMode('view')
    setMessage('')
  }

  function startNewVariant(nextForm = emptyForm()) {
    setSelectedId(null)
    setForm(nextForm)
    setMode('new')
    setMessage('')
  }

  function updateForm<Key extends keyof VariantFormState>(
    key: Key,
    value: VariantFormState[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function saveVariant() {
    setIsSaving(true)
    setMessage('Saving variant...')

    const payload = {
      career_profile_id: careerProfileId,
      name: form.name,
      target_company: form.target_company || null,
      target_title: form.target_title || null,
      target_description: form.target_description || null,
      variant_type: form.variant_type || 'targeted_resume',
      composition: toComposition(form),
    }

    const url =
      mode === 'edit' && selectedId
        ? `/api/careeros/resume-variants/${selectedId}`
        : '/api/careeros/resume-variants'

    const res = await fetch(url, {
      method: mode === 'edit' ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      setMessage(`Error: ${result?.error || 'Failed to save variant'}`)
      setIsSaving(false)
      return
    }

    const savedVariant = result.resumeVariant as ResumeVariantRow

    setVariants((current) => {
      const existing = current.some((variant) => variant.id === savedVariant.id)
      const next = existing
        ? current.map((variant) =>
            variant.id === savedVariant.id ? savedVariant : variant
          )
        : [savedVariant, ...current]

      return next.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    })
    setSelectedId(savedVariant.id)
    setForm(formFromVariant(savedVariant))
    setMode('view')
    setMessage('Variant saved.')
    setIsSaving(false)
  }

  async function deleteVariant() {
    if (!selectedVariant) return

    const confirmed = window.confirm(`Delete "${selectedVariant.name}"?`)
    if (!confirmed) return

    setIsSaving(true)
    setMessage('Deleting variant...')

    const res = await fetch(`/api/careeros/resume-variants/${selectedVariant.id}`, {
      method: 'DELETE',
    })

    const result = await res.json().catch(() => null)

    if (!res.ok) {
      setMessage(`Error: ${result?.error || 'Failed to delete variant'}`)
      setIsSaving(false)
      return
    }

    setVariants((current) => {
      const next = current.filter((variant) => variant.id !== selectedVariant.id)
      const nextSelected = next[0] ?? null
      setSelectedId(nextSelected?.id ?? null)
      setForm(nextSelected ? formFromVariant(nextSelected) : emptyForm())
      return next
    })
    setMode('view')
    setMessage('Variant deleted.')
    setIsSaving(false)
  }

  const currentComposition = selectedVariant
    ? compositionFromVariant(selectedVariant)
    : toComposition(form)

  const sourceLabels = {
    Roles: describeSelected(idList(currentComposition.role_ids), roleOptions),
    Projects: describeSelected(
      idList(currentComposition.project_ids),
      projectOptions
    ),
    Accomplishments: describeSelected(
      idList(currentComposition.accomplishment_ids),
      accomplishmentOptions
    ),
    Skills: describeSelected(idList(currentComposition.skill_ids), skillOptions),
    Technologies: describeSelected(
      idList(currentComposition.technology_ids),
      technologyOptions
    ),
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startNewVariant()}
            className="app-button-primary"
          >
            New Variant
          </button>
          {selectedVariant ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setForm(formFromVariant(selectedVariant))
                  setMode('edit')
                  setMessage('')
                }}
                className="app-button"
              >
                Edit Selected
              </button>
              <button
                type="button"
                onClick={() => void deleteVariant()}
                disabled={isSaving}
                className="app-button border-red-300 text-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </>
          ) : null}
        </div>
        {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          Starter Variants
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VARIANT_STARTERS.map((starter) => (
            <button
              key={starter.label}
              type="button"
              onClick={() =>
                startNewVariant(
                  getStarterForm({
                    starter,
                    roles,
                    projects,
                    accomplishments,
                    skills,
                    technologies,
                  })
                )
              }
              className="app-button"
            >
              {starter.label}
            </button>
          ))}
        </div>
      </div>

      {variants.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => selectVariant(variant)}
              className={`rounded-2xl border bg-white p-4 text-left transition hover:bg-zinc-50 ${
                selectedVariant?.id === variant.id && mode === 'view'
                  ? 'border-zinc-900 ring-2 ring-zinc-900/10'
                  : 'border-zinc-200'
              }`}
            >
              <span className="block text-sm font-semibold text-zinc-950">
                {variant.name}
              </span>
              <span className="mt-1 block text-sm text-zinc-600">
                {variant.target_title ?? variant.variant_type}
              </span>
              <span className="mt-3 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {variant.generated_at
                  ? `Generated ${new Date(
                      variant.generated_at
                    ).toLocaleDateString()}`
                  : 'Composition only'}
              </span>
            </button>
          ))}
        </div>
      ) : mode === 'view' ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
          No resume variants yet.
        </div>
      ) : null}

      {mode === 'view' && selectedVariant ? (
        <VariantSummary variant={selectedVariant} sourceLabels={sourceLabels} />
      ) : null}

      {mode !== 'view' ? (
        <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Variant Name">
              <TextInput
                value={form.name}
                onChange={(value) => updateForm('name', value)}
                placeholder="Targeted resume"
              />
            </Field>
            <Field label="Variant Type">
              <TextInput
                value={form.variant_type}
                onChange={(value) => updateForm('variant_type', value)}
                placeholder="targeted_resume"
              />
            </Field>
            <Field label="Target Company">
              <TextInput
                value={form.target_company}
                onChange={(value) => updateForm('target_company', value)}
                placeholder="Company name"
              />
            </Field>
            <Field label="Target Title">
              <TextInput
                value={form.target_title}
                onChange={(value) => updateForm('target_title', value)}
                placeholder="Role title"
              />
            </Field>
          </div>

          <Field label="Target Description">
            <textarea
              rows={4}
              value={form.target_description}
              onChange={(event) =>
                updateForm('target_description', event.target.value)
              }
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="Paste or summarize the target job context."
            />
          </Field>

          <Field label="Section Order">
            <TextInput
              value={form.section_order}
              onChange={(value) => updateForm('section_order', value)}
              placeholder="summary, skills, experience, projects"
            />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            <CheckboxGroup
              title="Roles"
              options={roleOptions}
              selectedIds={form.role_ids}
              onChange={(ids) => updateForm('role_ids', ids)}
            />
            <CheckboxGroup
              title="Projects"
              options={projectOptions}
              selectedIds={form.project_ids}
              onChange={(ids) => updateForm('project_ids', ids)}
            />
            <CheckboxGroup
              title="Accomplishments"
              options={accomplishmentOptions}
              selectedIds={form.accomplishment_ids}
              onChange={(ids) => updateForm('accomplishment_ids', ids)}
            />
            <CheckboxGroup
              title="Skills"
              options={skillOptions}
              selectedIds={form.skill_ids}
              onChange={(ids) => updateForm('skill_ids', ids)}
            />
            <CheckboxGroup
              title="Technologies"
              options={technologyOptions}
              selectedIds={form.technology_ids}
              onChange={(ids) => updateForm('technology_ids', ids)}
            />
            <CheckboxGroup
              title="Education"
              options={educationOptions}
              selectedIds={form.education_ids}
              onChange={(ids) => updateForm('education_ids', ids)}
            />
            <CheckboxGroup
              title="Certifications"
              options={certificationOptions}
              selectedIds={form.certification_ids}
              onChange={(ids) => updateForm('certification_ids', ids)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveVariant()}
              disabled={isSaving}
              className="app-button-primary disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Variant'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedVariant) {
                  setForm(formFromVariant(selectedVariant))
                }
                setMode('view')
                setMessage('')
              }}
              disabled={isSaving}
              className="app-button disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
