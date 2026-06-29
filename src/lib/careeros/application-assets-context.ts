import type { createAdminClient } from '@/lib/supabase/admin'
import type { Tables } from '@/lib/supabase/schema'

type AdminClient = ReturnType<typeof createAdminClient>

type CareerProfile = Tables<'career_profiles'>
type Technology = Tables<'technologies'>
type Accomplishment = Tables<'accomplishments'>
type RoleAccomplishment = Tables<'role_accomplishments'>
type ProjectAccomplishment = Tables<'project_accomplishments'>
type AccomplishmentTechnology = Tables<'accomplishment_technologies'>
type StarStory = Tables<'star_stories'>
type Education = Tables<'education'>
type Certification = Tables<'certifications'>
type ResumeVariant = Tables<'resume_variants'>

export type CareerOsApplicationAssetContext = {
  profile: CareerProfile
  candidateBlock: string
  skillsBlock: string
  experienceBlock: string
  projectsBlock: string
  accomplishmentsBlock: string
  starStoriesBlock: string
  educationBlock: string
  certificationsBlock: string
  resumeVariantsBlock: string
  hasStructuredExperience: boolean
}

function formatMonthYear(date: string | null): string | null {
  if (!date) return null

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean | null
) {
  const start = formatMonthYear(startDate) ?? 'Unknown start'
  const end = isCurrent ? 'Present' : formatMonthYear(endDate) ?? 'Unknown end'

  return `${start} - ${end}`
}

function bySortOrder<T extends { sort_order: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function listOrNone(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : '- None'
}

function getTechnologyNames(
  technologyIds: string[],
  technologies: Technology[]
): string[] {
  const technologyMap = new Map(
    technologies.map((technology) => [technology.id, technology.name])
  )

  return technologyIds
    .map((id) => technologyMap.get(id))
    .filter((name): name is string => Boolean(name))
}

function getRoleAccomplishments(
  roleId: string,
  links: RoleAccomplishment[],
  accomplishments: Accomplishment[]
): Accomplishment[] {
  const accomplishmentMap = new Map(
    accomplishments.map((accomplishment) => [
      accomplishment.id,
      accomplishment,
    ])
  )

  return bySortOrder(links.filter((link) => link.role_id === roleId))
    .map((link) => accomplishmentMap.get(link.accomplishment_id))
    .filter((item): item is Accomplishment => Boolean(item))
}

function getProjectAccomplishments(
  projectId: string,
  links: ProjectAccomplishment[],
  accomplishments: Accomplishment[]
): Accomplishment[] {
  const accomplishmentMap = new Map(
    accomplishments.map((accomplishment) => [
      accomplishment.id,
      accomplishment,
    ])
  )

  return bySortOrder(links.filter((link) => link.project_id === projectId))
    .map((link) => accomplishmentMap.get(link.accomplishment_id))
    .filter((item): item is Accomplishment => Boolean(item))
}

function getCompositionIds(value: unknown, key: string): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []

  const record = value as Record<string, unknown>
  const ids = record[key]

  return Array.isArray(ids)
    ? ids.map((id) => String(id).trim()).filter(Boolean)
    : []
}

export async function getCareerOsApplicationAssetContext(
  supabase: AdminClient,
  userId: string
): Promise<CareerOsApplicationAssetContext | null> {
  const { data: profile, error: profileError } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile) {
    return null
  }

  const [
    employersResult,
    rolesResult,
    projectsResult,
    skillsResult,
    technologiesResult,
    accomplishmentsResult,
    roleAccomplishmentsResult,
    projectAccomplishmentsResult,
    roleTechnologiesResult,
    projectTechnologiesResult,
    accomplishmentTechnologiesResult,
    starStoriesResult,
    educationResult,
    certificationsResult,
    resumeVariantsResult,
  ] = await Promise.all([
    supabase
      .from('employers')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('roles')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('technologies')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true }),
    supabase
      .from('accomplishments')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('role_accomplishments')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('project_accomplishments')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true }),
    supabase.from('role_technologies').select('*').eq('user_id', userId),
    supabase.from('project_technologies').select('*').eq('user_id', userId),
    supabase
      .from('accomplishment_technologies')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('star_stories')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('education')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('certifications')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('resume_variants')
      .select('*')
      .eq('user_id', userId)
      .eq('career_profile_id', profile.id)
      .order('updated_at', { ascending: false }),
  ])

  const results = [
    employersResult,
    rolesResult,
    projectsResult,
    skillsResult,
    technologiesResult,
    accomplishmentsResult,
    roleAccomplishmentsResult,
    projectAccomplishmentsResult,
    roleTechnologiesResult,
    projectTechnologiesResult,
    accomplishmentTechnologiesResult,
    starStoriesResult,
    educationResult,
    certificationsResult,
    resumeVariantsResult,
  ]

  results.forEach((result) => {
    if (result.error) {
      throw new Error(result.error.message)
    }
  })

  const employers = employersResult.data ?? []
  const roles = rolesResult.data ?? []
  const projects = projectsResult.data ?? []
  const skills = skillsResult.data ?? []
  const technologies = technologiesResult.data ?? []
  const accomplishments = accomplishmentsResult.data ?? []
  const roleAccomplishments = roleAccomplishmentsResult.data ?? []
  const projectAccomplishments = projectAccomplishmentsResult.data ?? []
  const roleTechnologies = roleTechnologiesResult.data ?? []
  const projectTechnologies = projectTechnologiesResult.data ?? []
  const accomplishmentTechnologies = accomplishmentTechnologiesResult.data ?? []
  const starStories = starStoriesResult.data ?? []
  const education = educationResult.data ?? []
  const certifications = certificationsResult.data ?? []
  const resumeVariants = resumeVariantsResult.data ?? []

  const employerMap = new Map(employers.map((employer) => [employer.id, employer]))

  const candidateBlock = `
Name: ${profile.full_name}
Headline: ${profile.headline ?? ''}
Summary: ${profile.summary ?? ''}
Location: ${profile.location ?? ''}
Email: ${profile.email ?? ''}
Phone: ${profile.phone ?? ''}
LinkedIn: ${profile.linkedin_url ?? ''}
GitHub: ${profile.github_url ?? ''}
Website: ${profile.website_url ?? profile.portfolio_url ?? ''}
  `.trim()

  const skillsBlock = listOrNone(
    bySortOrder(skills).map((skill) =>
      [
        skill.name,
        skill.category ? `Category: ${skill.category}` : null,
        skill.proficiency ? `Proficiency: ${skill.proficiency}` : null,
        skill.summary ? `Summary: ${skill.summary}` : null,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  )

  const experienceBlock = roles
    .map((role) => {
      const employer = role.employer_id ? employerMap.get(role.employer_id) : null
      const roleTechnologyIds = roleTechnologies
        .filter((link) => link.role_id === role.id)
        .map((link) => link.technology_id)
      const roleTechnologyNames = getTechnologyNames(
        roleTechnologyIds,
        technologies
      )
      const linkedAccomplishments = getRoleAccomplishments(
        role.id,
        roleAccomplishments,
        accomplishments
      )

      return `
${role.title} @ ${employer?.name ?? 'Independent / self-employed'}
Location: ${role.location ?? employer?.location ?? 'Not specified'}
Dates: ${formatDateRange(role.start_date, role.end_date, role.is_current)}
${role.summary ? `Summary: ${role.summary}` : ''}
${
  role.responsibilities.length
    ? `Responsibilities:\n${role.responsibilities.map((item) => `- ${item}`).join('\n')}`
    : ''
}
${
  linkedAccomplishments.length
    ? `Linked accomplishments:\n${linkedAccomplishments
        .map((item) => `- ${item.statement}`)
        .join('\n')}`
    : ''
}
${roleTechnologyNames.length ? `Technologies: ${roleTechnologyNames.join(', ')}` : ''}
      `.trim()
    })
    .join('\n\n')

  const projectsBlock = projects
    .map((project) => {
      const projectTechnologyIds = projectTechnologies
        .filter((link) => link.project_id === project.id)
        .map((link) => link.technology_id)
      const projectTechnologyNames = getTechnologyNames(
        projectTechnologyIds,
        technologies
      )
      const linkedAccomplishments = getProjectAccomplishments(
        project.id,
        projectAccomplishments,
        accomplishments
      )

      return `
${project.name}
${project.summary ? `Summary: ${project.summary}` : ''}
${project.description ? `Description: ${project.description}` : ''}
${
  linkedAccomplishments.length
    ? `Linked accomplishments:\n${linkedAccomplishments
        .map((item) => `- ${item.statement}`)
        .join('\n')}`
    : ''
}
${projectTechnologyNames.length ? `Technologies: ${projectTechnologyNames.join(', ')}` : ''}
      `.trim()
    })
    .join('\n\n')

  const accomplishmentTechnologyMap = new Map<string, string[]>()
  accomplishmentTechnologies.forEach((link: AccomplishmentTechnology) => {
    const existing = accomplishmentTechnologyMap.get(link.accomplishment_id) ?? []
    accomplishmentTechnologyMap.set(link.accomplishment_id, [
      ...existing,
      link.technology_id,
    ])
  })

  const accomplishmentsBlock = listOrNone(
    accomplishments.map((accomplishment) => {
      const linkedTechnologies = getTechnologyNames(
        accomplishmentTechnologyMap.get(accomplishment.id) ?? [],
        technologies
      )

      return [
        accomplishment.title ?? null,
        accomplishment.statement,
        accomplishment.impact_summary
          ? `Impact: ${accomplishment.impact_summary}`
          : null,
        accomplishment.scope ? `Scope: ${accomplishment.scope}` : null,
        linkedTechnologies.length
          ? `Technologies: ${linkedTechnologies.join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join(' | ')
    })
  )

  const starStoriesBlock = listOrNone(
    starStories.map((story: StarStory) =>
      [
        story.title,
        `Situation: ${story.situation}`,
        `Task: ${story.task}`,
        `Action: ${story.action}`,
        `Result: ${story.result}`,
        story.lesson_learned ? `Lesson: ${story.lesson_learned}` : null,
        story.tags.length ? `Tags: ${story.tags.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  )

  const educationBlock = listOrNone(
    education.map((item: Education) =>
      [
        item.institution,
        item.degree,
        item.field_of_study,
        formatDateRange(item.start_date, item.end_date, item.is_current),
        item.description,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  )

  const certificationsBlock = listOrNone(
    certifications.map((item: Certification) =>
      [
        item.name,
        item.issuer,
        item.issued_at ? `Issued: ${item.issued_at}` : null,
        item.expires_at ? `Expires: ${item.expires_at}` : null,
        item.credential_url,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  )

  const resumeVariantsBlock = listOrNone(
    resumeVariants.map((variant: ResumeVariant) => {
      const selectedCounts = [
        `roles: ${getCompositionIds(variant.composition, 'role_ids').length}`,
        `projects: ${getCompositionIds(variant.composition, 'project_ids').length}`,
        `accomplishments: ${
          getCompositionIds(variant.composition, 'accomplishment_ids').length
        }`,
        `skills: ${getCompositionIds(variant.composition, 'skill_ids').length}`,
        `technologies: ${
          getCompositionIds(variant.composition, 'technology_ids').length
        }`,
      ].join(', ')

      return [
        variant.name,
        variant.target_title ? `Target title: ${variant.target_title}` : null,
        variant.target_company
          ? `Target company: ${variant.target_company}`
          : null,
        `Type: ${variant.variant_type}`,
        `Composition counts: ${selectedCounts}`,
      ]
        .filter(Boolean)
        .join(' | ')
    })
  )

  return {
    profile,
    candidateBlock,
    skillsBlock,
    experienceBlock,
    projectsBlock,
    accomplishmentsBlock,
    starStoriesBlock,
    educationBlock,
    certificationsBlock,
    resumeVariantsBlock,
    hasStructuredExperience: roles.length > 0,
  }
}
