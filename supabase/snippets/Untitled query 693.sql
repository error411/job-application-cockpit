begin;

-- Upsert a single candidate profile row
-- Assumes you want one primary profile in the system.
insert into public.candidate_profile (
  full_name,
  title,
  summary,
  strengths,
  experience_bullets
)
values (
  'Dan Walter',
  'Website Manager / Senior Web Developer',
  'Website Manager and Senior Web Developer with 15+ years of experience leading WordPress website operations, content-driven web projects, and e-commerce initiatives. Strong background in PHP, MySQL, JavaScript, WooCommerce, custom CMS functionality, API integrations, and cross-functional collaboration. Proven success improving site performance, responsiveness, accessibility, and SEO while supporting business goals.',
  array[
    'Website management and web operations',
    'WordPress CMS administration',
    'WooCommerce and e-commerce web experiences',
    'Web analytics and performance monitoring',
    'Project leadership and cross-functional collaboration',
    'PHP',
    'MySQL',
    'JavaScript',
    'React',
    'Custom themes, plugins, and API integrations',
    'SEO',
    'Accessibility',
    'Responsiveness',
    'Usability',
    'Git',
    'Pantheon',
    'Staged deployments'
  ]::text[],
  array[
    'Led WordPress website operations and content-driven web projects',
    'Built and maintained custom themes, plugins, and API integrations',
    'Improved site performance, responsiveness, accessibility, and SEO',
    'Supported e-commerce and WooCommerce initiatives',
    'Worked cross-functionally to deliver business-focused web solutions'
  ]::text[]
)
on conflict (id) do nothing;

-- Use the first/only profile row as the parent for experience inserts
with profile as (
  select id
  from public.candidate_profile
  order by created_at asc
  limit 1
)
insert into public.candidate_experience (
  candidate_profile_id,
  company,
  title,
  bullets,
  technologies,
  summary,
  location,
  start_date,
  end_date,
  is_current,
  sort_order
)
select
  profile.id,
  v.company,
  v.title,
  v.bullets,
  v.technologies,
  v.summary,
  v.location,
  v.start_date,
  v.end_date,
  v.is_current,
  v.sort_order
from profile
cross join (
  values
    (
      'Slate Digital',
      'WordPress Developer',
      array[
        'Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives',
        'Built custom plugins and PHP scripts to support front-end and back-end website functionality',
        'Collaborated with creative and media teams to implement design updates and web campaigns',
        'Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations',
        'Optimized performance, responsiveness, and SEO using web best practices'
      ]::text[],
      array['WordPress','PHP','JavaScript','Pantheon','Git','SEO']::text[],
      'Developed and maintained high-traffic WordPress marketing websites and landing pages.',
      'Los Angeles, CA',
      '2021-12-01'::date,
      '2024-11-01'::date,
      false,
      1
    ),
    (
      'Turning Point for God',
      'Web Developer',
      array[
        'Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript',
        'Integrated internal and external APIs into web platforms to support user-facing content and functionality',
        'Partnered with internal teams to deliver web experiences aligned with organizational needs'
      ]::text[],
      array['PHP','HTML','CSS','JavaScript','APIs']::text[],
      'Maintained web properties and integrated APIs to support content and functionality.',
      'San Diego, CA',
      '2023-01-01'::date,
      '2023-11-01'::date,
      false,
      2
    ),
    (
      'Box Out Marketing',
      'Director of Product Development',
      array[
        'Led product development and engineering for marketing automation, membership, and WordPress-based web platforms',
        'Managed $667K+ in WordPress-based membership and LMS projects',
        'Oversaw API integrations and backend systems architecture across client implementations',
        'Directed discovery, scoping, and implementation for web initiatives tied to business goals',
        'Managed development team and product lifecycle from planning through delivery'
      ]::text[],
      array['WordPress','APIs','Marketing Automation','LMS','Backend Architecture']::text[],
      'Led engineering and product delivery for WordPress-based marketing and membership platforms.',
      'Carlsbad, CA',
      '2016-05-01'::date,
      '2021-06-01'::date,
      false,
      3
    ),
    (
      'Next Level Security Systems',
      'Manager of Product Support',
      array[
        'Led product support operations and technical training for customer deployments',
        'Configured customer systems across hardware, software, and networks',
        'Built and maintained the support portal and knowledge base'
      ]::text[],
      array['Technical Support','Training','Hardware','Software','Networks']::text[],
      'Led product support operations and customer deployment readiness.',
      'Carlsbad, CA',
      '2012-12-01'::date,
      '2016-05-01'::date,
      false,
      4
    ),
    (
      'Walter Computer Services',
      'Owner / Operator',
      array[
        'Delivered IT consulting, technical support, and web development services for local clients',
        'Built websites using PHP, MySQL, WordPress, Joomla, and Drupal',
        'Maintained servers, networks, and desktop systems across platforms'
      ]::text[],
      array['PHP','MySQL','WordPress','Joomla','Drupal','Servers','Networks']::text[],
      'Delivered consulting, support, and web development services for local clients.',
      'Oceanside, CA',
      '1989-12-01'::date,
      '2014-11-01'::date,
      false,
      5
    ),
    (
      'Point Loma Nazarene University',
      'Computer Dept. Sales & Support Manager',
      array[
        'Managed computer department sales and technical support operations',
        'Repaired and configured desktops and laptops',
        'Trained and supervised student employees'
      ]::text[],
      array['Technical Support','Hardware','Training']::text[],
      'Managed sales and technical support operations in a university computer department.',
      'San Diego, CA',
      '1998-02-01'::date,
      '2006-05-01'::date,
      false,
      6
    )
) as v(
  company,
  title,
  bullets,
  technologies,
  summary,
  location,
  start_date,
  end_date,
  is_current,
  sort_order
);

commit;