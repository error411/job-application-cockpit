begin;

-- Editable seed config.
-- Replace this placeholder with the auth.users.id that should own the data.
create temporary table careeros_seed_config (
  user_id uuid not null
) on commit drop;

insert into careeros_seed_config (user_id)
values ('c8ff02fd-c619-47b9-b5a7-01569c1bb4cf');

insert into public.career_profiles (
  id,
  user_id,
  full_name,
  headline,
  summary,
  is_default
)
select
  '00000000-0000-4000-8000-000000000001',
  user_id,
  'Dan Walter',
  'Full-stack SaaS developer and principal software consultant',
  'Founder and principal software consultant with deep experience across SaaS product development, WordPress/PHP consulting, React/Next.js/TypeScript, Supabase/PostgreSQL/RLS, Drupal/Twig, technical support, hosting, DNS, email, Linux, client support, project delivery, and deployment.',
  true
from careeros_seed_config
on conflict (id) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  headline = excluded.headline,
  summary = excluded.summary,
  is_default = excluded.is_default,
  updated_at = now();

insert into public.employers (
  id,
  user_id,
  career_profile_id,
  name,
  normalized_name,
  industry,
  description,
  sort_order
)
select
  '00000000-0000-4000-8000-000000000101',
  user_id,
  '00000000-0000-4000-8000-000000000001',
  'Walter Computer Services',
  'walter computer services',
  'Software consulting and web development',
  'Independent consulting practice focused on software development, websites, technical support, hosting, deployment, and client technology delivery.',
  10
from careeros_seed_config
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  name = excluded.name,
  normalized_name = excluded.normalized_name,
  industry = excluded.industry,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.roles (
  id,
  user_id,
  career_profile_id,
  employer_id,
  title,
  employment_type,
  start_date,
  is_current,
  summary,
  responsibilities,
  sort_order
)
select
  '00000000-0000-4000-8000-000000000201',
  user_id,
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Founder / Principal Software Consultant',
  'Self-employed',
  '1989-12-01',
  true,
  'Founded and operated a long-running software and technology consulting practice spanning SaaS development, CMS implementation, support, hosting, DNS, email, Linux, deployment, and client delivery.',
  array[
    'Deliver software consulting, web development, technical support, and deployment services for clients.',
    'Build and maintain WordPress, PHP, Drupal, React, Next.js, TypeScript, Supabase, and PostgreSQL solutions.',
    'Support hosting, DNS, email, Linux, troubleshooting, client communications, and project delivery.'
  ],
  10
from careeros_seed_config
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  employer_id = excluded.employer_id,
  title = excluded.title,
  employment_type = excluded.employment_type,
  start_date = excluded.start_date,
  is_current = excluded.is_current,
  summary = excluded.summary,
  responsibilities = excluded.responsibilities,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.projects (
  id,
  user_id,
  career_profile_id,
  employer_id,
  role_id,
  name,
  summary,
  description,
  is_featured,
  sort_order
)
select
  '00000000-0000-4000-8000-000000000301',
  user_id,
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  'ApplyEngine',
  'Full-stack SaaS application for job application management and AI-assisted job-search workflow.',
  'Built a structured job application cockpit using Next.js, React, TypeScript, Supabase, PostgreSQL, RLS, OpenAI-assisted generation, scoring, application assets, billing, and workflow automation.',
  true,
  10
from careeros_seed_config
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  employer_id = excluded.employer_id,
  role_id = excluded.role_id,
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.skills (
  id,
  user_id,
  career_profile_id,
  name,
  category,
  proficiency,
  summary,
  is_featured,
  sort_order
)
select skill_id, user_id, '00000000-0000-4000-8000-000000000001', name, category, proficiency, summary, true, sort_order
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000401'::uuid, 'Full-stack SaaS development', 'Software development', 'Advanced', 'Building full-stack SaaS products with frontend, backend, database, auth, billing, and automation concerns.', 10),
    ('00000000-0000-4000-8000-000000000402'::uuid, 'WordPress/PHP consulting', 'CMS development', 'Advanced', 'Consulting, implementation, troubleshooting, and delivery for WordPress and PHP-based websites.', 20),
    ('00000000-0000-4000-8000-000000000403'::uuid, 'React/Next.js/TypeScript development', 'Frontend engineering', 'Advanced', 'Building typed modern web applications with React, Next.js, TypeScript, and componentized UI patterns.', 30),
    ('00000000-0000-4000-8000-000000000404'::uuid, 'Supabase/PostgreSQL/RLS', 'Backend engineering', 'Advanced', 'Designing Supabase-backed application data models with PostgreSQL, auth ownership, and row-level security.', 40),
    ('00000000-0000-4000-8000-000000000405'::uuid, 'Drupal/Twig/DDEV/Drush', 'CMS development', 'Experienced', 'Working with Drupal theming and local development workflows using Twig, DDEV, and Drush.', 50),
    ('00000000-0000-4000-8000-000000000406'::uuid, 'Technical support and hosting operations', 'Operations', 'Advanced', 'Supporting hosting, DNS, email, Linux, troubleshooting, client issues, and production deployments.', 60),
    ('00000000-0000-4000-8000-000000000407'::uuid, 'Business consulting and client delivery', 'Consulting', 'Advanced', 'Managing client communication, business needs, project delivery, support, and deployment outcomes.', 70)
) as seed(skill_id, name, category, proficiency, summary, sort_order)
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  name = excluded.name,
  category = excluded.category,
  proficiency = excluded.proficiency,
  summary = excluded.summary,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.technologies (
  id,
  user_id,
  name,
  category
)
select tech_id, user_id, name, category
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000501'::uuid, 'Next.js', 'Framework'),
    ('00000000-0000-4000-8000-000000000502'::uuid, 'React', 'Framework'),
    ('00000000-0000-4000-8000-000000000503'::uuid, 'TypeScript', 'Language'),
    ('00000000-0000-4000-8000-000000000504'::uuid, 'Supabase', 'Backend platform'),
    ('00000000-0000-4000-8000-000000000505'::uuid, 'PostgreSQL', 'Database'),
    ('00000000-0000-4000-8000-000000000506'::uuid, 'Row Level Security', 'Security'),
    ('00000000-0000-4000-8000-000000000507'::uuid, 'WordPress', 'CMS'),
    ('00000000-0000-4000-8000-000000000508'::uuid, 'PHP', 'Language'),
    ('00000000-0000-4000-8000-000000000509'::uuid, 'Drupal', 'CMS'),
    ('00000000-0000-4000-8000-000000000510'::uuid, 'Twig', 'Template language'),
    ('00000000-0000-4000-8000-000000000511'::uuid, 'DDEV', 'Development environment'),
    ('00000000-0000-4000-8000-000000000512'::uuid, 'Drush', 'CLI'),
    ('00000000-0000-4000-8000-000000000513'::uuid, 'Linux', 'Operating system'),
    ('00000000-0000-4000-8000-000000000514'::uuid, 'DNS', 'Infrastructure'),
    ('00000000-0000-4000-8000-000000000515'::uuid, 'Email hosting', 'Infrastructure')
) as seed(tech_id, name, category)
on conflict (id) do update set
  user_id = excluded.user_id,
  name = excluded.name,
  category = excluded.category,
  updated_at = now();

insert into public.accomplishments (
  id,
  user_id,
  career_profile_id,
  title,
  statement,
  impact_summary,
  scope,
  confidence_score,
  is_featured,
  sort_order
)
select accomplishment_id, user_id, '00000000-0000-4000-8000-000000000001', title, statement, impact_summary, scope, 70, true, sort_order
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000601'::uuid, 'Founded consulting practice', 'Founded and operated Walter Computer Services as a principal software and technology consulting practice from December 1989 to the present.', 'Long-running independent consulting practice spanning software, web, infrastructure, support, and client delivery.', 'Business ownership', 10),
    ('00000000-0000-4000-8000-000000000602'::uuid, 'Built ApplyEngine SaaS', 'Built ApplyEngine as a full-stack SaaS product for managing job applications, scoring opportunities, and generating targeted application assets.', 'Demonstrates modern full-stack product development across application, database, auth, automation, and generation workflows.', 'SaaS product development', 20),
    ('00000000-0000-4000-8000-000000000603'::uuid, 'Implemented Supabase data model', 'Designed Supabase and PostgreSQL-backed application workflows with user-owned records and row-level security.', 'Shows backend architecture, auth-aware data modeling, and secure multi-user application design.', 'Backend architecture', 30),
    ('00000000-0000-4000-8000-000000000604'::uuid, 'Delivered WordPress/PHP consulting', 'Delivered WordPress and PHP consulting for client websites, support needs, custom functionality, and production delivery.', 'Shows practical CMS consulting, implementation, maintenance, and client-facing delivery.', 'CMS consulting', 40),
    ('00000000-0000-4000-8000-000000000605'::uuid, 'Worked across Drupal workflows', 'Worked with Drupal, Twig, DDEV, and Drush in local development and CMS implementation workflows.', 'Shows flexibility across CMS ecosystems and command-line developer tooling.', 'CMS development', 50),
    ('00000000-0000-4000-8000-000000000606'::uuid, 'Supported production infrastructure', 'Supported hosting, DNS, email, Linux, troubleshooting, and deployment concerns for client and project environments.', 'Shows broad operational ownership beyond application code.', 'Technical operations', 60),
    ('00000000-0000-4000-8000-000000000607'::uuid, 'Managed client delivery', 'Provided business consulting, client support, project delivery, and deployment guidance across technical engagements.', 'Shows consulting judgment, communication, ownership, and delivery discipline.', 'Client delivery', 70)
) as seed(accomplishment_id, title, statement, impact_summary, scope, sort_order)
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  title = excluded.title,
  statement = excluded.statement,
  impact_summary = excluded.impact_summary,
  scope = excluded.scope,
  confidence_score = excluded.confidence_score,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.accomplishment_tags (id, user_id, name, color)
select tag_id, user_id, name, color
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000701'::uuid, 'SaaS', '#2563eb'),
    ('00000000-0000-4000-8000-000000000702'::uuid, 'CMS', '#16a34a'),
    ('00000000-0000-4000-8000-000000000703'::uuid, 'Infrastructure', '#9333ea'),
    ('00000000-0000-4000-8000-000000000704'::uuid, 'Consulting', '#ca8a04')
) as seed(tag_id, name, color)
on conflict (id) do update set
  user_id = excluded.user_id,
  name = excluded.name,
  color = excluded.color,
  updated_at = now();

insert into public.role_accomplishments (id, user_id, role_id, accomplishment_id, sort_order)
select link_id, user_id, '00000000-0000-4000-8000-000000000201', accomplishment_id, sort_order
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000801'::uuid, '00000000-0000-4000-8000-000000000601'::uuid, 10),
    ('00000000-0000-4000-8000-000000000802'::uuid, '00000000-0000-4000-8000-000000000604'::uuid, 20),
    ('00000000-0000-4000-8000-000000000803'::uuid, '00000000-0000-4000-8000-000000000606'::uuid, 30),
    ('00000000-0000-4000-8000-000000000804'::uuid, '00000000-0000-4000-8000-000000000607'::uuid, 40)
) as seed(link_id, accomplishment_id, sort_order)
on conflict (id) do update set
  user_id = excluded.user_id,
  role_id = excluded.role_id,
  accomplishment_id = excluded.accomplishment_id,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.project_accomplishments (id, user_id, project_id, accomplishment_id, sort_order)
select link_id, user_id, '00000000-0000-4000-8000-000000000301', accomplishment_id, sort_order
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000811'::uuid, '00000000-0000-4000-8000-000000000602'::uuid, 10),
    ('00000000-0000-4000-8000-000000000812'::uuid, '00000000-0000-4000-8000-000000000603'::uuid, 20)
) as seed(link_id, accomplishment_id, sort_order)
on conflict (id) do update set
  user_id = excluded.user_id,
  project_id = excluded.project_id,
  accomplishment_id = excluded.accomplishment_id,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.role_technologies (id, user_id, role_id, technology_id)
select link_id, user_id, '00000000-0000-4000-8000-000000000201', technology_id
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000821'::uuid, '00000000-0000-4000-8000-000000000501'::uuid),
    ('00000000-0000-4000-8000-000000000822'::uuid, '00000000-0000-4000-8000-000000000502'::uuid),
    ('00000000-0000-4000-8000-000000000823'::uuid, '00000000-0000-4000-8000-000000000503'::uuid),
    ('00000000-0000-4000-8000-000000000824'::uuid, '00000000-0000-4000-8000-000000000507'::uuid),
    ('00000000-0000-4000-8000-000000000825'::uuid, '00000000-0000-4000-8000-000000000508'::uuid),
    ('00000000-0000-4000-8000-000000000826'::uuid, '00000000-0000-4000-8000-000000000509'::uuid),
    ('00000000-0000-4000-8000-000000000827'::uuid, '00000000-0000-4000-8000-000000000513'::uuid)
) as seed(link_id, technology_id)
on conflict (id) do update set
  user_id = excluded.user_id,
  role_id = excluded.role_id,
  technology_id = excluded.technology_id,
  updated_at = now();

insert into public.project_technologies (id, user_id, project_id, technology_id)
select link_id, user_id, '00000000-0000-4000-8000-000000000301', technology_id
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000831'::uuid, '00000000-0000-4000-8000-000000000501'::uuid),
    ('00000000-0000-4000-8000-000000000832'::uuid, '00000000-0000-4000-8000-000000000502'::uuid),
    ('00000000-0000-4000-8000-000000000833'::uuid, '00000000-0000-4000-8000-000000000503'::uuid),
    ('00000000-0000-4000-8000-000000000834'::uuid, '00000000-0000-4000-8000-000000000504'::uuid),
    ('00000000-0000-4000-8000-000000000835'::uuid, '00000000-0000-4000-8000-000000000505'::uuid),
    ('00000000-0000-4000-8000-000000000836'::uuid, '00000000-0000-4000-8000-000000000506'::uuid)
) as seed(link_id, technology_id)
on conflict (id) do update set
  user_id = excluded.user_id,
  project_id = excluded.project_id,
  technology_id = excluded.technology_id,
  updated_at = now();

insert into public.accomplishment_tag_links (id, user_id, accomplishment_id, tag_id)
select link_id, user_id, accomplishment_id, tag_id
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000841'::uuid, '00000000-0000-4000-8000-000000000602'::uuid, '00000000-0000-4000-8000-000000000701'::uuid),
    ('00000000-0000-4000-8000-000000000842'::uuid, '00000000-0000-4000-8000-000000000603'::uuid, '00000000-0000-4000-8000-000000000701'::uuid),
    ('00000000-0000-4000-8000-000000000843'::uuid, '00000000-0000-4000-8000-000000000604'::uuid, '00000000-0000-4000-8000-000000000702'::uuid),
    ('00000000-0000-4000-8000-000000000844'::uuid, '00000000-0000-4000-8000-000000000606'::uuid, '00000000-0000-4000-8000-000000000703'::uuid),
    ('00000000-0000-4000-8000-000000000845'::uuid, '00000000-0000-4000-8000-000000000607'::uuid, '00000000-0000-4000-8000-000000000704'::uuid)
) as seed(link_id, accomplishment_id, tag_id)
on conflict (id) do update set
  user_id = excluded.user_id,
  accomplishment_id = excluded.accomplishment_id,
  tag_id = excluded.tag_id,
  updated_at = now();

insert into public.accomplishment_technologies (id, user_id, accomplishment_id, technology_id)
select link_id, user_id, accomplishment_id, technology_id
from careeros_seed_config
cross join (
  values
    ('00000000-0000-4000-8000-000000000851'::uuid, '00000000-0000-4000-8000-000000000602'::uuid, '00000000-0000-4000-8000-000000000501'::uuid),
    ('00000000-0000-4000-8000-000000000852'::uuid, '00000000-0000-4000-8000-000000000602'::uuid, '00000000-0000-4000-8000-000000000502'::uuid),
    ('00000000-0000-4000-8000-000000000853'::uuid, '00000000-0000-4000-8000-000000000602'::uuid, '00000000-0000-4000-8000-000000000503'::uuid),
    ('00000000-0000-4000-8000-000000000854'::uuid, '00000000-0000-4000-8000-000000000603'::uuid, '00000000-0000-4000-8000-000000000504'::uuid),
    ('00000000-0000-4000-8000-000000000855'::uuid, '00000000-0000-4000-8000-000000000603'::uuid, '00000000-0000-4000-8000-000000000505'::uuid),
    ('00000000-0000-4000-8000-000000000856'::uuid, '00000000-0000-4000-8000-000000000604'::uuid, '00000000-0000-4000-8000-000000000507'::uuid),
    ('00000000-0000-4000-8000-000000000857'::uuid, '00000000-0000-4000-8000-000000000604'::uuid, '00000000-0000-4000-8000-000000000508'::uuid),
    ('00000000-0000-4000-8000-000000000858'::uuid, '00000000-0000-4000-8000-000000000605'::uuid, '00000000-0000-4000-8000-000000000509'::uuid)
) as seed(link_id, accomplishment_id, technology_id)
on conflict (id) do update set
  user_id = excluded.user_id,
  accomplishment_id = excluded.accomplishment_id,
  technology_id = excluded.technology_id,
  updated_at = now();

insert into public.star_stories (
  id,
  user_id,
  career_profile_id,
  accomplishment_id,
  role_id,
  project_id,
  title,
  situation,
  task,
  action,
  result,
  lesson_learned,
  interview_question_targets,
  tags
)
select
  story_id,
  user_id,
  '00000000-0000-4000-8000-000000000001',
  accomplishment_id,
  '00000000-0000-4000-8000-000000000201',
  project_id,
  title,
  situation,
  task,
  action,
  result,
  lesson_learned,
  interview_question_targets,
  tags
from careeros_seed_config
cross join (
  values
    (
      '00000000-0000-4000-8000-000000000901'::uuid,
      '00000000-0000-4000-8000-000000000602'::uuid,
      '00000000-0000-4000-8000-000000000301'::uuid,
      'Building ApplyEngine as a SaaS product',
      'Needed a structured system to manage job opportunities, applications, scoring, and generated application assets.',
      'Create a full-stack product foundation that could support authenticated users, secure data ownership, and repeatable generation workflows.',
      'Built the application with Next.js, React, TypeScript, Supabase, PostgreSQL, RLS, OpenAI integration, billing infrastructure, and workflow-oriented data models.',
      'Produced a working SaaS foundation for capturing jobs, scoring fit, generating application materials, and extending toward CareerOS.',
      'A career product needs normalized source data first, then generated artifacts as views or compositions.',
      array['Tell me about a product you built', 'Describe a complex technical project'],
      array['SaaS', 'Full-stack', 'Architecture']
    ),
    (
      '00000000-0000-4000-8000-000000000902'::uuid,
      '00000000-0000-4000-8000-000000000607'::uuid,
      null::uuid,
      'Delivering client technology outcomes',
      'Clients needed practical technology support across websites, infrastructure, communication, and delivery constraints.',
      'Translate business needs into reliable technical execution and supportable deployments.',
      'Combined consulting, implementation, troubleshooting, client communication, hosting support, DNS/email knowledge, and deployment planning.',
      'Delivered practical solutions across software, websites, support, and operations while maintaining long-term consulting relationships.',
      'Strong delivery depends on pairing technical judgment with clear client communication.',
      array['Tell me about client communication', 'Describe project ownership'],
      array['Consulting', 'Client delivery', 'Support']
    )
) as seed(
  story_id,
  accomplishment_id,
  project_id,
  title,
  situation,
  task,
  action,
  result,
  lesson_learned,
  interview_question_targets,
  tags
)
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  accomplishment_id = excluded.accomplishment_id,
  role_id = excluded.role_id,
  project_id = excluded.project_id,
  title = excluded.title,
  situation = excluded.situation,
  task = excluded.task,
  action = excluded.action,
  result = excluded.result,
  lesson_learned = excluded.lesson_learned,
  interview_question_targets = excluded.interview_question_targets,
  tags = excluded.tags,
  updated_at = now();

insert into public.resume_variants (
  id,
  user_id,
  career_profile_id,
  name,
  target_title,
  variant_type,
  composition
)
select
  '00000000-0000-4000-8000-000000000951',
  user_id,
  '00000000-0000-4000-8000-000000000001',
  'Founder / Full-stack SaaS Developer baseline',
  'Full-stack SaaS Developer',
  'baseline_resume_composition',
  '{
    "role_ids": ["00000000-0000-4000-8000-000000000201"],
    "project_ids": ["00000000-0000-4000-8000-000000000301"],
    "accomplishment_ids": [
      "00000000-0000-4000-8000-000000000601",
      "00000000-0000-4000-8000-000000000602",
      "00000000-0000-4000-8000-000000000603",
      "00000000-0000-4000-8000-000000000604",
      "00000000-0000-4000-8000-000000000606",
      "00000000-0000-4000-8000-000000000607"
    ],
    "skill_ids": [
      "00000000-0000-4000-8000-000000000401",
      "00000000-0000-4000-8000-000000000402",
      "00000000-0000-4000-8000-000000000403",
      "00000000-0000-4000-8000-000000000404",
      "00000000-0000-4000-8000-000000000406",
      "00000000-0000-4000-8000-000000000407"
    ],
    "section_order": ["summary", "skills", "experience", "projects", "selected_accomplishments"]
  }'::jsonb
from careeros_seed_config
on conflict (id) do update set
  user_id = excluded.user_id,
  career_profile_id = excluded.career_profile_id,
  name = excluded.name,
  target_title = excluded.target_title,
  variant_type = excluded.variant_type,
  composition = excluded.composition,
  updated_at = now();

-- Education and certifications are intentionally left empty until verified.
-- Add rows here later rather than placing unverified credentials in CareerOS.

commit;
