import Link from 'next/link'
import { ResumeVariantsManager } from '@/app/careeros/resume-variants-manager'
import { getCareerProfileSnapshot } from '@/lib/careeros/server'
import type {
  AccomplishmentRow,
  CareerProfileSnapshot,
  ProjectRow,
  RoleRow,
  StarStoryRow,
  TechnologyRow,
} from '@/lib/careeros/types'

function formatDate(value: string | null): string {
  if (!value) return 'Present'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return 'Dates not set'

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

function bySortOrder<T extends { sort_order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="app-panel p-0">
      <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{hint}</p>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
      {label}
    </div>
  )
}

function PillList({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function getTechnologiesForRole(
  snapshot: CareerProfileSnapshot,
  roleId: string
): TechnologyRow[] {
  const technologyIds = new Set(
    snapshot.roleTechnologies
      .filter((link) => link.role_id === roleId)
      .map((link) => link.technology_id)
  )

  return snapshot.technologies.filter((technology) =>
    technologyIds.has(technology.id)
  )
}

function getTechnologiesForProject(
  snapshot: CareerProfileSnapshot,
  projectId: string
): TechnologyRow[] {
  const technologyIds = new Set(
    snapshot.projectTechnologies
      .filter((link) => link.project_id === projectId)
      .map((link) => link.technology_id)
  )

  return snapshot.technologies.filter((technology) =>
    technologyIds.has(technology.id)
  )
}

function getAccomplishmentsForRole(
  snapshot: CareerProfileSnapshot,
  roleId: string
): AccomplishmentRow[] {
  const links = bySortOrder(
    snapshot.roleAccomplishments.filter((link) => link.role_id === roleId)
  )

  return links
    .map((link) =>
      snapshot.accomplishments.find(
        (accomplishment) => accomplishment.id === link.accomplishment_id
      )
    )
    .filter((item): item is AccomplishmentRow => Boolean(item))
}

function getAccomplishmentsForProject(
  snapshot: CareerProfileSnapshot,
  projectId: string
): AccomplishmentRow[] {
  const links = bySortOrder(
    snapshot.projectAccomplishments.filter((link) => link.project_id === projectId)
  )

  return links
    .map((link) =>
      snapshot.accomplishments.find(
        (accomplishment) => accomplishment.id === link.accomplishment_id
      )
    )
    .filter((item): item is AccomplishmentRow => Boolean(item))
}

function RoleCard({
  role,
  snapshot,
}: {
  role: RoleRow
  snapshot: CareerProfileSnapshot
}) {
  const employer = snapshot.employers.find((item) => item.id === role.employer_id)
  const technologies = getTechnologiesForRole(snapshot, role.id)
  const accomplishments = getAccomplishmentsForRole(snapshot, role.id)

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">
            {role.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-700">
            {employer?.name ?? 'Independent'}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {formatRange(role.start_date, role.end_date)}
          </p>
        </div>
        {role.is_current ? (
          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Current
          </span>
        ) : null}
      </div>

      {role.summary ? (
        <p className="mt-4 text-sm leading-6 text-zinc-700">{role.summary}</p>
      ) : null}

      {role.responsibilities.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-700">
          {role.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {technologies.length > 0 ? (
        <div className="mt-4">
          <PillList items={technologies.map((item) => item.name)} />
        </div>
      ) : null}

      {accomplishments.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
          {accomplishments.map((accomplishment) => (
            <p key={accomplishment.id} className="text-sm text-zinc-700">
              {accomplishment.statement}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function ProjectCard({
  project,
  snapshot,
}: {
  project: ProjectRow
  snapshot: CareerProfileSnapshot
}) {
  const technologies = getTechnologiesForProject(snapshot, project.id)
  const accomplishments = getAccomplishmentsForProject(snapshot, project.id)

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">
            {project.name}
          </h3>
          {project.summary ? (
            <p className="mt-1 text-sm leading-6 text-zinc-700">
              {project.summary}
            </p>
          ) : null}
        </div>
        {project.is_featured ? (
          <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Featured
          </span>
        ) : null}
      </div>

      {project.description ? (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          {project.description}
        </p>
      ) : null}

      {technologies.length > 0 ? (
        <div className="mt-4">
          <PillList items={technologies.map((item) => item.name)} />
        </div>
      ) : null}

      {accomplishments.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
          {accomplishments.map((accomplishment) => (
            <p key={accomplishment.id} className="text-sm text-zinc-700">
              {accomplishment.statement}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function AccomplishmentCard({
  accomplishment,
}: {
  accomplishment: AccomplishmentRow
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {accomplishment.title ? (
            <h3 className="text-sm font-semibold text-zinc-950">
              {accomplishment.title}
            </h3>
          ) : null}
          <p className="mt-1 text-sm leading-6 text-zinc-700">
            {accomplishment.statement}
          </p>
        </div>
        {accomplishment.scope ? (
          <span className="w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {accomplishment.scope}
          </span>
        ) : null}
      </div>
      {accomplishment.impact_summary ? (
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {accomplishment.impact_summary}
        </p>
      ) : null}
    </article>
  )
}

function StarStoryCard({ story }: { story: StarStoryRow }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <h3 className="text-base font-semibold text-zinc-950">{story.title}</h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-zinc-950">Situation</dt>
          <dd className="mt-1 leading-6 text-zinc-600">{story.situation}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-950">Task</dt>
          <dd className="mt-1 leading-6 text-zinc-600">{story.task}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-950">Action</dt>
          <dd className="mt-1 leading-6 text-zinc-600">{story.action}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-950">Result</dt>
          <dd className="mt-1 leading-6 text-zinc-600">{story.result}</dd>
        </div>
      </dl>
      {story.tags.length > 0 ? (
        <div className="mt-4">
          <PillList items={story.tags} />
        </div>
      ) : null}
    </article>
  )
}

export default async function CareerOsPage() {
  const snapshot = await getCareerProfileSnapshot()

  if (!snapshot) {
    return (
      <div className="space-y-8">
        <section className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            CareerOS
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Build your career source of truth
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            No CareerOS profile exists yet. Seed or create a career profile to
            begin composing targeted resumes and interview prep from structured
            history.
          </p>
        </section>
        <EmptyState label="No CareerOS profile found for this account." />
      </div>
    )
  }

  const profile = snapshot.profile
  const roles = bySortOrder(snapshot.roles)
  const projects = bySortOrder(snapshot.projects)
  const skills = bySortOrder(snapshot.skills)
  const accomplishments = bySortOrder(snapshot.accomplishments)

  const technologyNames = snapshot.technologies.map((item) => item.name).sort()

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            CareerOS
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            {profile.full_name}
          </h1>
          {profile.headline ? (
            <p className="max-w-3xl text-base leading-7 text-zinc-700">
              {profile.headline}
            </p>
          ) : null}
          {profile.summary ? (
            <p className="max-w-4xl text-sm leading-6 text-zinc-600">
              {profile.summary}
            </p>
          ) : null}
        </div>

        <Link href="/profile" className="app-button">
          Legacy Profile
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Roles"
          value={snapshot.roles.length}
          hint="Professional positions"
        />
        <MetricCard
          label="Projects"
          value={snapshot.projects.length}
          hint="Reusable work samples"
        />
        <MetricCard
          label="Skills"
          value={snapshot.skills.length}
          hint="Profile strengths"
        />
        <MetricCard
          label="Tech"
          value={snapshot.technologies.length}
          hint="Attachable tools"
        />
        <MetricCard
          label="Proof"
          value={snapshot.accomplishments.length}
          hint="Reusable outcomes"
        />
        <MetricCard
          label="Stories"
          value={snapshot.starStories.length}
          hint="Interview prep"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel
          title="Roles"
          description="Structured professional history with linked proof points and technologies."
        >
          {roles.length > 0 ? (
            <div className="space-y-4">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} snapshot={snapshot} />
              ))}
            </div>
          ) : (
            <EmptyState label="No roles yet." />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Skills"
            description="Editable capability inventory for tailoring generated assets."
          >
            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-950">
                          {skill.name}
                        </h3>
                        {skill.summary ? (
                          <p className="mt-1 text-sm leading-6 text-zinc-600">
                            {skill.summary}
                          </p>
                        ) : null}
                      </div>
                      {skill.category ? (
                        <span className="w-fit rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                          {skill.category}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No skills yet." />
            )}
          </Panel>

          <Panel
            title="Technologies"
            description="Canonical technology names attached to roles, projects, and accomplishments."
          >
            {technologyNames.length > 0 ? (
              <PillList items={technologyNames} />
            ) : (
              <EmptyState label="No technologies yet." />
            )}
          </Panel>
        </div>
      </section>

      <Panel
        title="Projects"
        description="Project records can carry their own accomplishments and technology stack."
      >
        {projects.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                snapshot={snapshot}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No projects yet." />
        )}
      </Panel>

      <Panel
        title="Accomplishment Library"
        description="These are reusable source-of-truth proof points for resumes, cover letters, and interview prep."
      >
        {accomplishments.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {accomplishments.map((accomplishment) => (
              <AccomplishmentCard
                key={accomplishment.id}
                accomplishment={accomplishment}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No accomplishments yet." />
        )}
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel
          title="STAR Stories"
          description="Interview-ready stories connected to accomplishments, roles, or projects."
        >
          {snapshot.starStories.length > 0 ? (
            <div className="space-y-4">
              {snapshot.starStories.map((story) => (
                <StarStoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <EmptyState label="No STAR stories yet." />
          )}
        </Panel>

        <Panel
          title="Resume Variants"
          description="View, edit, and create generated compositions that reference source data instead of replacing it."
        >
          <ResumeVariantsManager
            careerProfileId={profile.id}
            initialVariants={snapshot.resumeVariants}
            roles={roles}
            projects={projects}
            accomplishments={accomplishments}
            skills={skills}
            technologies={snapshot.technologies}
            education={snapshot.education}
            certifications={snapshot.certifications}
          />
        </Panel>
      </section>
    </div>
  )
}
