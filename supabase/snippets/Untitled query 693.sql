insert into candidate_experience (
  candidate_profile_id,
  company,
  title,
  location,
  start_date,
  end_date,
  is_current,
  summary,
  bullets,
  technologies,
  sort_order
)
values

-- SLATE DIGITAL
(
  '051a2bb7-60c4-4f4b-bb48-fe14d6eb97d8',
  'Slate Digital',
  'WordPress Developer',
  'Los Angeles, CA',
  '2022-01-01',
  '2024-12-01',
  false,
  'Developed and maintained high-traffic WordPress marketing sites and landing pages.',
  array[
    'Developed and maintained main WordPress website and landing pages',
    'Built custom plugins and PHP scripts for front-end and back-end functionality',
    'Collaborated closely with creative and media teams on design implementation',
    'Managed Pantheon hosting, Git workflows, and staged deployments',
    'Optimized performance, responsiveness, and SEO using best practices'
  ],
  array['WordPress','PHP','JavaScript','MySQL','Git','Pantheon'],
  1
),

-- TURNING POINT
(
  '051a2bb7-60c4-4f4b-bb48-fe14d6eb97d8',
  'Turning Point for God',
  'Web Developer',
  'San Diego, CA',
  '2023-02-01',
  '2023-12-01',
  false,
  'Worked on web platforms integrating organizational data and APIs.',
  array[
    'Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript',
    'Integrated internal and external APIs into web platforms',
    'Collaborated with teams to bring organizational data into user-facing experiences'
  ],
  array['PHP','JavaScript','HTML','CSS','API Integration'],
  2
),

-- BOX OUT MARKETING
(
  '051a2bb7-60c4-4f4b-bb48-fe14d6eb97d8',
  'Box Out Marketing',
  'Director of Product Development',
  'Carlsbad, CA',
  '2016-06-01',
  '2021-07-01',
  false,
  'Led product development and engineering for marketing automation and membership platforms.',
  array[
    'Led development of "The Factory", a custom self-service system built on Keap',
    'Managed $667K+ in WordPress-based membership and LMS projects',
    'Oversaw API integrations and backend systems architecture',
    'Directed discovery, scoping, and implementation for client projects',
    'Managed development team and product lifecycle'
  ],
  array['WordPress','PHP','API Integration','Keap','Memberium','LearnDash'],
  3
),

-- NEXT LEVEL SECURITY
(
  '051a2bb7-60c4-4f4b-bb48-fe14d6eb97d8',
  'Next Level Security Systems',
  'Manager of Product Support',
  'Carlsbad, CA',
  '2013-01-01',
  '2016-06-01',
  false,
  'Managed technical support operations and customer system deployments.',
  array[
    'Led product support department and provided technical training',
    'Configured customer systems across hardware, software, and networks',
    'Built and maintained support portal and knowledge base'
  ],
  array['Networking','Linux','Windows','Technical Support'],
  4
),

-- WALTER COMPUTER SERVICES
(
  '051a2bb7-60c4-4f4b-bb48-fe14d6eb97d8',
  'Walter Computer Services',
  'Owner / Operator',
  'Oceanside, CA',
  '1990-01-01',
  '2014-12-01',
  false,
  'Provided IT consulting and web development services for local clients.',
  array[
    'Delivered IT consulting and support for businesses and individuals',
    'Built websites using PHP, MySQL, WordPress, Joomla, and Drupal',
    'Maintained servers, networks, and desktop systems across platforms'
  ],
  array['PHP','MySQL','WordPress','Joomla','Drupal','Linux','Windows'],
  5
),

-- PLNU
(
  '051a2bb7-60c4-4f4b-bb48-fe14d6eb97d8',
  'Point Loma Nazarene University',
  'Computer Dept. Sales & Support Manager',
  'San Diego, CA',
  '1998-03-01',
  '2006-06-01',
  false,
  'Managed computer department operations and technical support.',
  array[
    'Managed sales and technical support for computer department',
    'Repaired and configured desktops and laptops',
    'Trained and supervised student employees'
  ],
  array['Hardware','Technical Support','Training'],
  6
);