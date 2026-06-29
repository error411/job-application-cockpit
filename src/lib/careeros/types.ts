import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/schema'

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type TimestampColumns = {
  created_at: string
  updated_at: string
}

type OwnedRow = TimestampColumns & {
  id: string
  user_id: string
}

type OptionalTimestampInsert = {
  id?: string
  created_at?: string
  updated_at?: string
}

export type CareerProfileRow = OwnedRow & {
  full_name: string
  email: string | null
  phone: string | null
  location: string | null
  headline: string | null
  summary: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  portfolio_url: string | null
  is_default: boolean
}

export type CareerProfileInsert = OptionalTimestampInsert & {
  user_id: string
  full_name: string
  email?: string | null
  phone?: string | null
  location?: string | null
  headline?: string | null
  summary?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  website_url?: string | null
  portfolio_url?: string | null
  is_default?: boolean
}

export type EmployerRow = OwnedRow & {
  career_profile_id: string | null
  name: string
  normalized_name: string | null
  website_url: string | null
  industry: string | null
  location: string | null
  description: string | null
  sort_order: number
}

export type EmployerInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  name: string
  normalized_name?: string | null
  website_url?: string | null
  industry?: string | null
  location?: string | null
  description?: string | null
  sort_order?: number
}

export type RoleRow = OwnedRow & {
  career_profile_id: string | null
  employer_id: string | null
  title: string
  employment_type: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  summary: string | null
  responsibilities: string[]
  sort_order: number
}

export type RoleInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  employer_id?: string | null
  title: string
  employment_type?: string | null
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  is_current?: boolean
  summary?: string | null
  responsibilities?: string[]
  sort_order?: number
}

export type ProjectRow = OwnedRow & {
  career_profile_id: string | null
  employer_id: string | null
  role_id: string | null
  name: string
  summary: string | null
  description: string | null
  project_url: string | null
  repository_url: string | null
  start_date: string | null
  end_date: string | null
  is_featured: boolean
  sort_order: number
}

export type ProjectInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  employer_id?: string | null
  role_id?: string | null
  name: string
  summary?: string | null
  description?: string | null
  project_url?: string | null
  repository_url?: string | null
  start_date?: string | null
  end_date?: string | null
  is_featured?: boolean
  sort_order?: number
}

export type SkillRow = OwnedRow & {
  career_profile_id: string | null
  name: string
  category: string | null
  proficiency: string | null
  years_experience: number | null
  summary: string | null
  is_featured: boolean
  sort_order: number
}

export type SkillInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  name: string
  category?: string | null
  proficiency?: string | null
  years_experience?: number | null
  summary?: string | null
  is_featured?: boolean
  sort_order?: number
}

export type TechnologyRow = OwnedRow & {
  name: string
  category: string | null
  website_url: string | null
}

export type TechnologyInsert = OptionalTimestampInsert & {
  user_id: string
  name: string
  category?: string | null
  website_url?: string | null
}

export type AccomplishmentRow = OwnedRow & {
  career_profile_id: string | null
  title: string | null
  statement: string
  impact_summary: string | null
  metric_value: string | null
  metric_unit: string | null
  scope: string | null
  evidence_url: string | null
  source_note: string | null
  confidence_score: number | null
  is_featured: boolean
  sort_order: number
}

export type AccomplishmentInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  title?: string | null
  statement: string
  impact_summary?: string | null
  metric_value?: string | null
  metric_unit?: string | null
  scope?: string | null
  evidence_url?: string | null
  source_note?: string | null
  confidence_score?: number | null
  is_featured?: boolean
  sort_order?: number
}

export type AccomplishmentTagRow = OwnedRow & {
  name: string
  color: string | null
}

export type AccomplishmentTagInsert = OptionalTimestampInsert & {
  user_id: string
  name: string
  color?: string | null
}

export type LinkRow = OwnedRow

export type AccomplishmentTagLinkRow = LinkRow & {
  accomplishment_id: string
  tag_id: string
}

export type AccomplishmentTagLinkInsert = OptionalTimestampInsert & {
  user_id: string
  accomplishment_id: string
  tag_id: string
}

export type RoleAccomplishmentRow = LinkRow & {
  role_id: string
  accomplishment_id: string
  sort_order: number
}

export type RoleAccomplishmentInsert = OptionalTimestampInsert & {
  user_id: string
  role_id: string
  accomplishment_id: string
  sort_order?: number
}

export type ProjectAccomplishmentRow = LinkRow & {
  project_id: string
  accomplishment_id: string
  sort_order: number
}

export type ProjectAccomplishmentInsert = OptionalTimestampInsert & {
  user_id: string
  project_id: string
  accomplishment_id: string
  sort_order?: number
}

export type RoleTechnologyRow = LinkRow & {
  role_id: string
  technology_id: string
}

export type RoleTechnologyInsert = OptionalTimestampInsert & {
  user_id: string
  role_id: string
  technology_id: string
}

export type ProjectTechnologyRow = LinkRow & {
  project_id: string
  technology_id: string
}

export type ProjectTechnologyInsert = OptionalTimestampInsert & {
  user_id: string
  project_id: string
  technology_id: string
}

export type AccomplishmentTechnologyRow = LinkRow & {
  accomplishment_id: string
  technology_id: string
}

export type AccomplishmentTechnologyInsert = OptionalTimestampInsert & {
  user_id: string
  accomplishment_id: string
  technology_id: string
}

export type StarStoryRow = OwnedRow & {
  career_profile_id: string | null
  accomplishment_id: string | null
  role_id: string | null
  project_id: string | null
  title: string
  situation: string
  task: string
  action: string
  result: string
  lesson_learned: string | null
  interview_question_targets: string[]
  tags: string[]
}

export type StarStoryInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  accomplishment_id?: string | null
  role_id?: string | null
  project_id?: string | null
  title: string
  situation: string
  task: string
  action: string
  result: string
  lesson_learned?: string | null
  interview_question_targets?: string[]
  tags?: string[]
}

export type EducationRow = OwnedRow & {
  career_profile_id: string | null
  institution: string
  degree: string | null
  field_of_study: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
  honors: string[]
  sort_order: number
}

export type EducationInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  institution: string
  degree?: string | null
  field_of_study?: string | null
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  is_current?: boolean
  description?: string | null
  honors?: string[]
  sort_order?: number
}

export type CertificationRow = OwnedRow & {
  career_profile_id: string | null
  name: string
  issuer: string | null
  credential_id: string | null
  credential_url: string | null
  issued_at: string | null
  expires_at: string | null
  does_not_expire: boolean
  sort_order: number
}

export type CertificationInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  name: string
  issuer?: string | null
  credential_id?: string | null
  credential_url?: string | null
  issued_at?: string | null
  expires_at?: string | null
  does_not_expire?: boolean
  sort_order?: number
}

export type ResumeVariantComposition = {
  role_ids?: string[]
  project_ids?: string[]
  accomplishment_ids?: string[]
  skill_ids?: string[]
  technology_ids?: string[]
  education_ids?: string[]
  certification_ids?: string[]
  section_order?: string[]
}

export type ResumeVariantRow = OwnedRow & {
  career_profile_id: string | null
  job_id: string | null
  name: string
  target_company: string | null
  target_title: string | null
  target_description: string | null
  variant_type: string
  composition: Json
  generated_markdown: string | null
  generated_text: string | null
  generated_html: string | null
  generation_prompt: Json | null
  generation_model: string | null
  generated_at: string | null
}

export type ResumeVariantInsert = OptionalTimestampInsert & {
  user_id: string
  career_profile_id?: string | null
  job_id?: string | null
  name: string
  target_company?: string | null
  target_title?: string | null
  target_description?: string | null
  variant_type?: string
  composition?: ResumeVariantComposition | Json
  generated_markdown?: string | null
  generated_text?: string | null
  generated_html?: string | null
  generation_prompt?: Json | null
  generation_model?: string | null
  generated_at?: string | null
}

export type CareerOsTables = {
  career_profiles: TableDefinition<
    CareerProfileRow,
    CareerProfileInsert,
    Partial<CareerProfileInsert>
  >
  employers: TableDefinition<EmployerRow, EmployerInsert, Partial<EmployerInsert>>
  roles: TableDefinition<RoleRow, RoleInsert, Partial<RoleInsert>>
  projects: TableDefinition<ProjectRow, ProjectInsert, Partial<ProjectInsert>>
  skills: TableDefinition<SkillRow, SkillInsert, Partial<SkillInsert>>
  technologies: TableDefinition<
    TechnologyRow,
    TechnologyInsert,
    Partial<TechnologyInsert>
  >
  accomplishments: TableDefinition<
    AccomplishmentRow,
    AccomplishmentInsert,
    Partial<AccomplishmentInsert>
  >
  accomplishment_tags: TableDefinition<
    AccomplishmentTagRow,
    AccomplishmentTagInsert,
    Partial<AccomplishmentTagInsert>
  >
  accomplishment_tag_links: TableDefinition<
    AccomplishmentTagLinkRow,
    AccomplishmentTagLinkInsert,
    Partial<AccomplishmentTagLinkInsert>
  >
  role_accomplishments: TableDefinition<
    RoleAccomplishmentRow,
    RoleAccomplishmentInsert,
    Partial<RoleAccomplishmentInsert>
  >
  project_accomplishments: TableDefinition<
    ProjectAccomplishmentRow,
    ProjectAccomplishmentInsert,
    Partial<ProjectAccomplishmentInsert>
  >
  role_technologies: TableDefinition<
    RoleTechnologyRow,
    RoleTechnologyInsert,
    Partial<RoleTechnologyInsert>
  >
  project_technologies: TableDefinition<
    ProjectTechnologyRow,
    ProjectTechnologyInsert,
    Partial<ProjectTechnologyInsert>
  >
  accomplishment_technologies: TableDefinition<
    AccomplishmentTechnologyRow,
    AccomplishmentTechnologyInsert,
    Partial<AccomplishmentTechnologyInsert>
  >
  star_stories: TableDefinition<
    StarStoryRow,
    StarStoryInsert,
    Partial<StarStoryInsert>
  >
  education: TableDefinition<EducationRow, EducationInsert, Partial<EducationInsert>>
  certifications: TableDefinition<
    CertificationRow,
    CertificationInsert,
    Partial<CertificationInsert>
  >
  resume_variants: TableDefinition<
    ResumeVariantRow,
    ResumeVariantInsert,
    Partial<ResumeVariantInsert>
  >
}

export type CareerOsDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables'> & {
    Tables: Database['public']['Tables'] & CareerOsTables
  }
}

export type CareerOsSupabaseClient = SupabaseClient<CareerOsDatabase>

export type CareerProfileSnapshot = {
  profile: CareerProfileRow
  employers: EmployerRow[]
  roles: RoleRow[]
  projects: ProjectRow[]
  skills: SkillRow[]
  technologies: TechnologyRow[]
  accomplishments: AccomplishmentRow[]
  accomplishmentTags: AccomplishmentTagRow[]
  accomplishmentTagLinks: AccomplishmentTagLinkRow[]
  roleAccomplishments: RoleAccomplishmentRow[]
  projectAccomplishments: ProjectAccomplishmentRow[]
  roleTechnologies: RoleTechnologyRow[]
  projectTechnologies: ProjectTechnologyRow[]
  accomplishmentTechnologies: AccomplishmentTechnologyRow[]
  starStories: StarStoryRow[]
  education: EducationRow[]
  certifications: CertificationRow[]
  resumeVariants: ResumeVariantRow[]
}
