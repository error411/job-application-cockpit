import 'server-only'
import { requireUser } from '@/lib/auth/require-user'
import type {
  CareerOsSupabaseClient,
  CareerProfileInsert,
  CareerProfileSnapshot,
  ResumeVariantInsert,
} from '@/lib/careeros/types'

function assertSupabaseOk(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCareerOsContext() {
  const { supabase, user } = await requireUser()

  return {
    supabase: supabase as CareerOsSupabaseClient,
    user,
  }
}

export async function listCareerProfiles() {
  const { supabase, user } = await getCareerOsContext()

  const { data, error } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false })

  assertSupabaseOk(error)

  return data ?? []
}

export async function getDefaultCareerProfile() {
  const { supabase, user } = await getCareerOsContext()

  const { data, error } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .maybeSingle()

  assertSupabaseOk(error)

  return data
}

export async function createCareerProfile(
  input: Omit<CareerProfileInsert, 'user_id'>
) {
  const { supabase, user } = await getCareerOsContext()

  const { data, error } = await supabase
    .from('career_profiles')
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single()

  assertSupabaseOk(error)

  return data
}

export async function getCareerProfileSnapshot(
  careerProfileId?: string
): Promise<CareerProfileSnapshot | null> {
  const { supabase, user } = await getCareerOsContext()

  const profileQuery = supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', user.id)

  const { data: profile, error: profileError } = careerProfileId
    ? await profileQuery.eq('id', careerProfileId).maybeSingle()
    : await profileQuery.eq('is_default', true).maybeSingle()

  assertSupabaseOk(profileError)

  if (!profile) {
    return null
  }

  const [
    employers,
    roles,
    projects,
    skills,
    technologies,
    accomplishments,
    accomplishmentTags,
    accomplishmentTagLinks,
    roleAccomplishments,
    projectAccomplishments,
    roleTechnologies,
    projectTechnologies,
    accomplishmentTechnologies,
    starStories,
    education,
    certifications,
    resumeVariants,
  ] = await Promise.all([
    supabase
      .from('employers')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('skills')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('technologies')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('accomplishments')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('accomplishment_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('accomplishment_tag_links')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('role_accomplishments')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase
      .from('project_accomplishments')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase.from('role_technologies').select('*').eq('user_id', user.id),
    supabase.from('project_technologies').select('*').eq('user_id', user.id),
    supabase
      .from('accomplishment_technologies')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('star_stories')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('education')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('certifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('sort_order'),
    supabase
      .from('resume_variants')
      .select('*')
      .eq('user_id', user.id)
      .eq('career_profile_id', profile.id)
      .order('updated_at', { ascending: false }),
  ])

  const responses = [
    employers,
    roles,
    projects,
    skills,
    technologies,
    accomplishments,
    accomplishmentTags,
    accomplishmentTagLinks,
    roleAccomplishments,
    projectAccomplishments,
    roleTechnologies,
    projectTechnologies,
    accomplishmentTechnologies,
    starStories,
    education,
    certifications,
    resumeVariants,
  ]

  responses.forEach((response) => assertSupabaseOk(response.error))

  return {
    profile,
    employers: employers.data ?? [],
    roles: roles.data ?? [],
    projects: projects.data ?? [],
    skills: skills.data ?? [],
    technologies: technologies.data ?? [],
    accomplishments: accomplishments.data ?? [],
    accomplishmentTags: accomplishmentTags.data ?? [],
    accomplishmentTagLinks: accomplishmentTagLinks.data ?? [],
    roleAccomplishments: roleAccomplishments.data ?? [],
    projectAccomplishments: projectAccomplishments.data ?? [],
    roleTechnologies: roleTechnologies.data ?? [],
    projectTechnologies: projectTechnologies.data ?? [],
    accomplishmentTechnologies: accomplishmentTechnologies.data ?? [],
    starStories: starStories.data ?? [],
    education: education.data ?? [],
    certifications: certifications.data ?? [],
    resumeVariants: resumeVariants.data ?? [],
  }
}

export async function createResumeVariant(
  input: Omit<ResumeVariantInsert, 'user_id'>
) {
  const { supabase, user } = await getCareerOsContext()

  const { data, error } = await supabase
    .from('resume_variants')
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single()

  assertSupabaseOk(error)

  return data
}

export async function listResumeVariants(careerProfileId?: string) {
  const { supabase, user } = await getCareerOsContext()

  let query = supabase
    .from('resume_variants')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (careerProfileId) {
    query = query.eq('career_profile_id', careerProfileId)
  }

  const { data, error } = await query

  assertSupabaseOk(error)

  return data ?? []
}
