SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict xeL89uKVmlfyY9qQ739yCosuhWTyC11eWaDfo6AS4mIZYemN3B42DV3eQ4YmAqp

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."jobs" ("id", "company", "title", "description_raw", "description_clean", "location", "posted_at", "source", "status", "url", "created_at", "updated_at") VALUES
	('fa21508e-4fb6-4f99-bc32-da80f9b73efe', 'Straight North, LLC', 'WordPress Developer', 'Full job description
Straight North is seeking a skilled and experienced WordPress developer to join our dynamic team. You will be responsible for developing visually appealing and user-friendly websites that enhance the overall digital experience for our clients'' target audiences. You will collaborate closely with designers, copywriters and project managers to bring concepts to life, ensuring seamless integration of design and functionality across various digital platforms. You will also support updates to our company and client websites to improve various aspects of design, functionality, SEO and conversion.

This is a flexible remote/office position in our Downers Grove, IL office requiring one day in the office per week.

Responsibilities

· Build and maintain responsive WordPress websites using HTML, CSS, JavaScript and PHP.

· Collaborate with designers to translate mockups and wireframes into pixel-perfect UI components.

· Optimize website performance and user experience through efficient coding practices and UI enhancements.

· Conduct thorough testing and debugging to ensure compatibility and stability across different browsers and devices.

· Stay updated on emerging trends and best practices in front-end development, and actively contribute to knowledge sharing within the team.

Qualifications

· 3-5+ years of proven experience as a front-end developer, with a strong portfolio showcasing your previous work.

· Proficiency in writing custom HTML, CSS, and JavaScript to build responsive websites from the ground up.

· Strong understanding of the WordPress ecosystem, site architecture, theme building, and best practices.

· Experience and understanding of Git workflows and working with Git for all code changes.

· Experience with SCSS/SASS with a basic understanding of Mixins and Extends.

· Experience with Advanced Custom Fields and WordPress plugin development is a plus.

· Experience working with multiple CMS platforms a plus.

· Knowledge of technical SEO best practices.

· Strong problem-solving skills and attention to detail.

· Excellent communication and teamwork abilities.

Benefits

Our highly competitive benefits package includes a 401(k), FSA, paid time off (for vacation, illness and personal time) along with health, dental, vision, short-term disability and long-term disability insurance.

About Straight North

Straight North is an Internet marketing agency with over 100 experts on staff. We''re successful and growing, with a steady stream of new clients. Our formula is to hire smart people and turn them loose. We''ll listen to you, help you, challenge you, and above all give you every opportunity to grow in your profession.

Job Type: Full-time

Pay: $70,000.00 per year

Benefits:

401(k)
401(k) matching
Dental insurance
Flexible spending account
Health insurance
Life insurance
Paid time off
Vision insurance
Schedule:

8 hour shift
Monday to Friday
Ability to Relocate:

Downers Grove, IL 60515: Relocate before starting work (Required)
Work Location: Hybrid remote in Downers Grove, IL 60515', NULL, 'Downers Grove, IL 60515•Hybrid work', NULL, NULL, 'ready_to_apply', 'https://www.indeed.com/viewjob?jk=d755204425956871&from=shareddesktop_copy', '2026-03-26 13:56:34.964843+00', '2026-03-26 13:56:34.964843+00'),
	('1e45c82c-fe94-447c-85b5-06c63a6dba4b', 'ANZAR ENTERPRISES, INC.', 'Website Manager', 'About the job
Company Description

MONTE DE PIEDAD is a Pawn & Jewelry company headquartered in San Ysidro, California. With its primary location at 329 E San Ysidro Blvd, the company is dedicated to providing reliable financial services and solutions. ANZAR ENTERPRISES, INC. is committed to delivering exceptional value and support to its customers in the financial sector. Join a team focused on innovation and fostering professional growth.



Role Description

This is a full-time, on-site Website Manager role located in San Diego, CA. The Website Manager will be responsible for overseeing the company’s website operations, ensuring optimal performance and user experience. Daily tasks include managing content updates, analyzing web traffic data, coordinating e-commerce activities, and leading web-related projects. The role also involves collaborating with cross-functional teams to optimize website design and functionality while aligning it with business goals.



Qualifications

Experience in Web Analytics and the ability to monitor and interpret website performance metrics
Proficiency in Content Management Systems (CMS) and managing web-based content
Strong skills in Project Management and leading website-related initiatives
Knowledge of E-Commerce operations and driving online sales improvements
Proficiency in Web Design principles and related tools to enhance user experiences
Strong organizational, problem-solving, and communication skills
Understanding of SEO best practices is a plus', NULL, 'Remote', NULL, NULL, 'ready_to_apply', 'https://www.linkedin.com/jobs/view/4385639939/', '2026-03-26 03:35:30.986361+00', '2026-03-26 03:35:30.986361+00'),
	('33a73cd1-6aa7-49cb-ad30-188631719391', 'Medical Consulting Group, LLC', 'WordPress Developer', 'Full job description
Medical Consulting Group (MCG) is looking for a highly skilled and experienced WordPress Developer to join our creative and collaborative digital team. This role is ideal for someone who thrives in a fast-paced environment and brings deep expertise in WordPress, WooCommerce, CSS, and modern web design best practices.

As a WordPress Developer, you’ll play a central role in planning, designing, building, and maintaining websites for our clients in the ophthalmology and medical industries. In addition to technical execution, this role requires strong communication skills and the ability to clearly explain the technical reasoning behind development choices. You’ll serve as a knowledgeable resource to clients—helping them understand how and why their web solutions are built to support functionality, performance, and their broader business goals.

Position Overview

This is a hands-on design and development role focused on crafting clean, scalable, responsive websites. You’ll be responsible for new builds, enhancements to existing sites, and ensuring every site you touch is visually polished, fast, accessible, and easy to use. You’ll collaborate closely with team members across disciplines to integrate video, graphics, copy, and marketing strategies into cohesive digital experiences.

You’ll also work directly with clients and account managers to explain development concepts in plain language, helping clients understand the functionality, structure, and performance decisions behind their digital products. Whether it''s outlining how a custom process improves user experience or breaking down performance optimizations, you''ll be the bridge between technical execution and client clarity.

Key Responsibilities

Design and build custom WordPress websites with attention to performance, responsiveness, and visual quality
Develop and style WooCommerce product pages, checkout flows, and custom shopping experiences
Customize layouts using CSS to align with client branding and ensure responsive functionality
Create flexible, dynamic content systems using tools like Advanced Custom Fields, conditional logic, and reusable modules
Maintain and enhance existing websites, including plugin updates, content refreshes, bug fixes, and performance tuning
Work cross-functionally with other team members to integrate visual content, SEO, GEO, and social strategy into web builds
Ensure accessibility (WCAG), SEO best practices, and mobile-first design are baked into every project
Troubleshoot compatibility and performance issues across platforms and browsers
Clearly articulate technical recommendations, functionality, and web performance considerations to clients in a way that is both approachable and informative
Collaborate with account managers to ensure client goals are fully understood and reflected in the technical build
Basic PHP or JavaScript skills for extending WordPress functionality
Required Skills & Experience

3+ years of professional web design and development experience, with a strong portfolio of WordPress and WooCommerce projects
Advanced proficiency in CSS and responsive layout systems
Experience building with page builders (e.g., Elementor, Beaver Builder, WPBakery, or similar) and customizing themes
Solid understanding of WooCommerce functionality and styling
Familiarity with WordPress theme structure and template hierarchy
Skilled in responsive, mobile-first design principles
Proficiency in design software such as Figma, Adobe, or Affinity
Strong collaboration and communication skills; able to work effectively with designers, developers, content creators, and strategists
Comfortable explaining technical solutions, site functionality, and performance metrics to non-technical audiences
Strong attention to detail and a passion for clean, maintainable code
Ability to manage multiple projects and deadlines in a team-oriented environment
Bonus / Nice-to-Have Skills

Familiarity with cPanel, DNS settings, staging environments, and site migrations
Understanding of WCAG accessibility and SEO best practices
Experience integrating HIPAA-compliant forms and working within regulated industries
Knowledge of email marketing platforms and integrations
Collaborative Environment

You’ll be part of a cross-functional creative and digital team that includes:

Web Designer
Videographer
Graphic Artist
Marketing Specialist
Copywriter
Social Media Coordinator
Together, you’ll work to deliver integrated digital campaigns and web experiences that drive measurable success for our clients. You''ll also contribute to building trust with clients by providing insights and guidance on how your technical solutions align with their marketing and business strategies.

Why MCG?

At Medical Consulting Group, we’re passionate about helping the ophthalmic industry grow through smart, strategic digital marketing. You’ll work in a collaborative environment where your skills are respected, your ideas are heard, and your work truly makes an impact.
Compensation is competitive and is based on the experience and skill set of the successful candidate. Benefits include health, dental, vision, life insurance, HSA, FSA, and SIMPLE IRA retirement plan. Generous paid time off and holiday pay complete the benefit package.

Benefits:

Dental insurance
Flexible spending account
Health insurance
Health savings account
Life insurance
Paid time off
Retirement plan
Vision insurance
Work Location: In person', NULL, 'Springfield, MO 65804', NULL, NULL, 'ready_to_apply', 'https://www.indeed.com/viewjob?jk=2d3be38e655d657e&from=shareddesktop_copy', '2026-03-26 14:07:41.579319+00', '2026-03-26 14:07:41.579319+00'),
	('c955e188-885f-431b-9395-2b279ccc19f2', 'Motion Recruitment', 'Web Developer / Wordpress and Next.js', 'About the job
We’re hiring a Senior WordPress & Next.js Developer to join a well-established, mission-driven organization based in Los Alamitos, CA (hybrid schedule). This team builds and maintains enterprise-level web platforms that power content publishing, eCommerce, and member engagement at scale. You’ll work across modern technologies including WordPress (custom PHP), headless CMS architecture, WooCommerce, React, Next.js, JavaScript/TypeScript, and REST APIs to deliver secure, high-performing applications that directly impact revenue and digital strategy.

This is a highly visible role where your work directly influences how the organization monetizes its intellectual property and serves its community. The #1 feature of this opportunity? Ownership. You’ll drive projects end-to-end — from architecture and design through launch and optimization — while collaborating closely with leadership, product, and design teams. They’re looking for someone who thrives in a thoughtful, collaborative environment and enjoys building scalable systems the right way. If you’re excited about modernizing enterprise platforms, implementing headless WordPress solutions, and influencing long-term technical direction — this is a chance to step into real impact and growth while maintaining strong work-life balance in a hybrid setup.

Required Skills & Experience

Extensive experience with WordPress and PHP 
Strong experience with building and scaling high-traffic websites 
Experience with React and Next.js 

Desired Skills & Experience

Familiarity with headless CMS implementations 
Ability to own projects from conception to production 

What You Will Be Doing

Tech Breakdown

50% WordPress 
50% React / Next.js 

The Offer

Bonus eligible 

You Will Receive The Following Benefits

Medical, Dental, and Vision Insurance 
Vacation Time 
Stock Options 

Applicants must be currently authorized to work in the US on a full-time basis now and in the future.

Posted By: Courtney Hughes', NULL, 'Hybrid - Costa Mesa', NULL, NULL, 'ready_to_apply', 'https://www.linkedin.com/jobs/view/4374447198/', '2026-03-26 03:38:55.350147+00', '2026-03-26 03:38:55.350147+00'),
	('7e665783-a238-49f9-b506-1d68a39fb415', 'American Creative, Inc', 'SEO and Wordpress Web Developer', 'Job description
American Creative is seeking new developers and project managers to join our SEO and website team, handling various SEO optimization and website creation tasks including:



- SEO website optimization, including H1s, title and meta fields (we''ll teach you our process and guidelines)
- Making adjustments to coded Wordpress websites
- Posting new blogs and content to clients’ Wordpress websites
- Participating in campaign management, including occasional phone conferences with clients, sales team, and coordinating content writing and production.
- Managing content order workflows from the account managers through writers and assign or post to the sites.
- Website support changes, such as adding images to clients’ Wordpress sites, posting new pages, adding forms, widgets and more.
- Other standard SEO and PPC support for clients



To accomplish these tasks, it is expected that you be comfortable with basic coding and working with:

- Wordpress
- HTML/CSS
- Photoshop
- FTP
- Microsoft Office (Word & Excel)



Familiarity working with the following would be helpful, but NOT required:

- Editing non-CMS sites (PHP/HTML)
- PHP/MYSQL
- DNS setup/changes
- SSL Certificates
- Google Ads
- Facebook/Instagram Ad Campaigns



This role involves working with modern SEO workflows, including the use of AI-assisted tools for research, content optimization, and productivity.



You must be:

- Organized
- Have excellent communication and email writing skills
- Be comfortable proofreading for grammatical errors in content
- Have had experience working with 20+ clients per month
- Have a great attitude.



In business for over 27 years, AMERICAN CREATIVE, INC. maintains a strong customer base of over 12,000 small-to-medium sized business clients across the country.

Our services have grown from our original base of On-Hold clients to an expansive Web Design division and a Google Certified Partner division offering Internet Marketing, SEO, Facebook Campaigns and Pay Per Click Management.



Learn more about us at https://www.americancreative.com.



PLEASE REPLY TO THIS AD WITH YOUR RESUME or call 954-671-5488 to set up an appointment for an interview.



With a presence in Florida, Tennessee and Mississippi, we are open to consider both in office and/or remote work arrangements, with opportunities for full-time, part-time and freelance.

Company Description
American Creative is a full-service digital marketing agency with over 27 years of experience serving 12,000+ small and mid-sized businesses nationwide. We specialize in web design, SEO, PPC, and online marketing, offering a collaborative environment where team members grow their technical and professional skills while working on real client projects.', NULL, 'Remote', NULL, NULL, 'ready_to_apply', 'https://www.ziprecruiter.com/jobs/a/b?lk=zNv2Brk1OvQYJE3MWJR37g&tsid=111000038', '2026-03-26 12:26:36.591563+00', '2026-03-26 12:26:36.591563+00'),
	('c778f63b-ef5e-4e80-b7f1-1f545a02fbaa', 'Cross Catholic Outreach', 'Web Developer', 'Job description

Cross Catholic Outreach is a Catholic ministry with an ecumenical staff of Catholic, Protestant, and Eastern Orthodox believers working in unity to provide food, water, housing, education, orphan support, medical care, micro-enterprise, and disaster relief, and the love of our Lord Jesus Christ to the poorest of the poor in more than 30 countries around the world. We believe strongly in unifying Christians in this mission of mercy, and we believe that creating a welcoming work environment for all Christian faiths is essential to achieving our ministry goals.
Best Christian Workplaces To Work Certified 2026
Position Title: Web Developer
Department: Technology Services
Reports to: Senior Web Developer
Position Summary:
The Mid-Level Web Developer supports the organization''s web platforms through daily maintenance, security, and feature delivery across public websites, e-commerce back-end systems, and related integrations. The role focuses on PHP and Laravel development, middleware services, and operational tasks such as DNS configuration, email deliverability, patching, monitoring, backups, and access controls. Typical work includes implementing features, fixing defects, integrating APIs, monitoring jobs and webhooks, and troubleshooting production issues. The position also supports SharePoint Online updates and basic PowerApps changes. This role contributes to secure, performant, and accessible digital experiences that advance fundraising and engagement goals, and performs other related duties as assigned.
Educational or Certification Requirements:
Degree in Computer Science, information technology, or equivalent experience
Relevant professional certifications are a plus
Experience Requirements:
3 to 5 years of building and maintaining production web systems
Strong experience with PHP, Next JS, and the Laravel framework
Experience with middleware and API integrations (RESTful services, webhooks, secure endpoints)
Experience deploying and supporting applications on Render, Heroku, or similar PaaS platforms
E-commerce experience: troubleshooting back-end flows, maintaining integrations, handling payment gateways, managing security, uptime, and observability (FoxyCart or a similar API-driven platform preferred)
Solid front-end skills in HTML, CSS/SCSS, and JavaScript
Database skills in SQL/MySQL, including writing and optimizing queries
Knowledge of email infrastructure: DNS, SPF, DKIM, DMARC, bounce handling, and deliverability best practices
Experience with Git/GitHub, code review, and deployment workflows
Familiarity with SharePoint Online and Power Apps is a plus
Experience with monitoring, logging, alerting, and resolving production incidents
Knowledge, Skills, & Character Required:
Is a consistent witness for Jesus Christ; maintains a courteous, Christ-like attitude in dealing with people within and outside of the ministry
Feels a calling to serve God through serving Cross Catholic Outreach in this capacity
Believes in and supports the mission and ministry of Cross Catholic Outreach, and agrees with the conduct policies and expectations of Cross Catholic Outreach
Understanding of e-commerce operations, including PCI considerations, tokenized payments, refunds, chargebacks, fraud checks, reconciliation, and reporting
Good grasp of web security, performance, accessibility, and SEO fundamentals
Ability to translate technical issues for nontechnical audiences
Strong problem-solving skills, attention to detail, and a proactive mindset
Clear communicator and effective collaborator across teams
Familiar with providing tier 3 support for issues involving unexpected interface behavior or back-end code defects
Proficient in HTML, CSS, SCSS or SASS, and vanilla JavaScript, plus basic Node.js, where applicable
Competent with PHP and MySQL, including reading, writing, and optimizing queries
Knowledge of building and integrating APIs, REST patterns, and secure webhooks
Knowledge of serverless approaches such as Netlify Functions or Cloudflare Workers
Knowledge of hosting environments and servers, DNS, SFTP or FTP, SSL, and CDNs
Knowledge of and working experience with WordPress, site builders, and SharePoint
Experience with e-commerce platforms, shopping cart technologies, and payment service providers or gateways
Ability to effectively interface with technical and nontechnical staff at all organizational levels
Able to work in a team environment while working independently as needed
Ability to engage vendor support on technical and functional issues
Competent at analyzing issues and determining practical solutions
Ability to produce clear written documentation, such as procedures, summaries, and reports
Duties:
Develop and maintain WordPress sites, custom PHP/Laravel applications, and middleware services
Build and manage secure API integrations with CRMs, fundraising systems, and marketing tools
Support and extend e-commerce platforms: manage webhooks and background jobs, payment flows and gateways, subscriptions, coupons, tax and shipping rules, error handling and retries, fraud checks, reconciliation and reporting, and security compliance
Implement and monitor analytics, event tracking, and marketing tags, including Meta Pixel and Conversions API
Manage DNS and email reputation settings (SPF, DKIM, DMARC) to support campaign deliverability
Support SharePoint Online and PowerApps projects as needed
Troubleshoot and resolve tier 3 production issues quickly and effectively
Collaborate with stakeholders to deliver new features, templates, and site improvements
Participate in code reviews, maintain version control standards, and document development processes
Research and recommend improvements in tools, frameworks, and workflows
Other duties as assigned
• This role requires the ability to perform standard office functions, including prolonged sitting, standing, and computer use. Occasional lifting, carrying, or moving materials weighing up to 20 pounds may be required. OR
• This position requires the ability to perform physically demanding work. Essential functions include frequent standing, walking, bending, stooping, kneeling, and reaching. The employee must be able to regularly lift, carry, push, and pull materials weighing up to 50 pounds, with or without reasonable accommodation. AND
• This position may require occasional domestic and/or international travel to attend meetings, trainings, conferences, or organizational events. Travel may be conducted by airplane, automobile, bus, or other reasonable means. Travel frequency is expected to be limited and scheduled in advance when possible.
Job Types: Full-time, Permanent

About the Employer

We mobilize the global Catholic Church to transform the poor and their communities materially and spiritually for the glory of Jesus Christ.
Our Vision
All Catholics around the world united in overcoming material and spiritual poverty





Company Description
Cross Catholic Outreach is a 501c3 Catholic relief and development ministry that provides food, shelter, medical care, water, education, self-help programs, care for orphans, and emergency relief to the poorest of the poor around the world in the name of Christ.
We mobilize the global Catholic Church to transform the poor and their communities materially and spiritually for the glory of Jesus Christ. Cross Catholic Outreach’s priority is to help “the poorest of the poor.” Our efforts reach those suffering extreme poverty in countries throughout the Caribbean, Africa, Asia, and Latin America.
Projects include relief for earthquake, flood, and tsunami victims, care and education for orphans and other vulnerable children, housing for the homeless, medicines and health care for the indigent, food for families suffering extreme malnutrition, and clean water for communities that have none, as well as micro-enterprise programs and other long-term development efforts to break the cycle of poverty.
In every case, our method of outreach is the same: Cross Catholic locates needy Catholic-based ministries serving the poor and distributes material aid through their existing programs. In this way, we can supply meaningful help where it is needed most. In all our work we remain dedicated in our service to the Lord as good stewards of His resources in every challenge we seek to overcome. We partner with Dioceses all over the world.', NULL, 'Remote', NULL, NULL, 'ready_to_apply', 'https://www.ziprecruiter.com/jobs/a/b?lk=-PIBG-zwzmth9METnpJ1RA&tsid=111000038', '2026-03-26 12:40:11.038999+00', '2026-03-26 12:40:11.038999+00'),
	('3d02326a-f871-4feb-baab-29831f467bca', 'PJ Metal Craft LLC', 'Website & Digital Optimization Specialist (WordPress)', 'Job description
PJ Metal Craft is looking for a detail-oriented and creative WordPress Website Specialist to manage, improve, and optimize our online presence. This role is ideal for someone with a strong eye for design and functionality who can take ownership of keeping our websites clean, updated, and performing at a high level.

Shop Location & Info

1 Barry Place, Stamford, CT 06902
Remote / Hybrid (Stamford, CT-based company)
Schedule: 1 day per week (flexible hours)
Why Work at PJ Metal Craft

Work closely with leadership team to help design and optimize our online presence.

Flexible schedule (1 day per week)

Opportunity to work on high-end architectural and construction projects.

Creative freedom with a direct impact on company growth.

Key Responsibilities

Website Management & Updates: Maintain and update WordPress content, images, and pages; ensure accuracy and brand alignment; improve layout and user experience.
Design & User Experience: Enhance visuals for a clean, high-end look; maintain consistent branding; optimize responsiveness.
Plugins & Features: Manage and troubleshoot plugins; add new features (forms, galleries, integrations); ensure security and performance.
Forms & Integrations: Create and manage contact and order forms; integrate with Constant Contact and lead capture tools.
SEO & Optimization: Perform basic SEO improvements (titles, descriptions, keywords) and improve page speed.
New Development: Assist with building new pages or full websites and support landing pages for campaigns.
Qualifications

Experience with WordPress (Divi preferred).
Strong design sense with a high-end aesthetic.
Familiarity with plugins, forms, and integrations.
Basic understanding of SEO and website performance.
Experience with Constant Contact or email marketing tools (preferred).
Ability to work independently and take initiative.
What We’re Looking For

Organized, reliable, and detail-oriented.
Problem-solver mindset.
Proactive communicator who takes ownership of systems.
Company Description
Are you a craftsperson who takes pride in precision and artistry?
PJ Metal Craft LLC is a premier, family-owned architectural metal firm where European heritage meets modern innovation. Based in Stamford, Connecticut, we bring over 20 years of "Old-World" craftsmanship to luxury homes, restoration projects, and landmark buildings across the U.S.
We specialize in high-end custom copper product fabrication, such as dormers, chimney caps, finials, and weathervanes, as well as the replication of historical ornamental metalwork. Our team of master artisans blends traditional hand-tool skills with advanced technologies like 3D scanning, CNC machines, water jet cutting, and modern bending methods.
At PJ Metal Craft, we don’t just fabricate metal; we elevate architecture. We are looking for dedicated team members who align with our S.T.A.N.D.A.R.D. values:
Safety • Teamwork • Accountability • No Shortcuts • Discipline • Architectural Precision • Reliability • Delivery of Excellence
Join us to build a career where your attention to detail is valued and your work is built to last for generations.', NULL, 'remote', NULL, NULL, 'ready_to_apply', 'https://www.ziprecruiter.com/jobs/a/b?lk=jERh9lQYan-E0o2Pk90ajQ&tsid=111000038', '2026-03-26 12:43:57.231766+00', '2026-03-26 12:43:57.231766+00'),
	('d573cc28-d19d-4766-9287-e29355a3a583', 'Legal Leads Group', 'Website / WordPress Developer', 'Full job description
Job Description: Website / WordPress Developer

Company: Legal Leads Group, Inc.

Location: 699 Hampshire Rd, Westlake Village, CA 91361

Job Type: Full-time, In-Office

Compensation: Depends On Experience

About Us

Legal Leads Group, Inc. is a premier performance marketing agency specializing in high-impact advertising, SEO, and digital strategies for law firms and medical practices. We help our clients achieve market leadership through data-driven campaigns and a cutting-edge online presence. As a fast-growing, attorney-owned agency with over 18 years of experience, we deliver exceptional results in a dynamic, collaborative environment. Our Westlake Village office serves as the hub for our creative and technical teams.

Position Overview

We are seeking a highly skilled Website / WordPress Developer to join our in-house team. In this full-time, on-site role, you will design and build high-performing, conversion-focused websites using leading CMS platforms such as WordPress. The ideal candidate combines outstanding visual design and UX/UI expertise with strong front-end development skills to create fully functional, responsive, and SEO-optimized sites that drive leads and results.

This position is perfect for a detail-oriented professional who thrives in a fast-paced agency setting, values precision, and enjoys turning creative concepts into high-performing digital experiences.

Key Responsibilities

While specific duties may evolve, your core responsibilities will include:

Website Development: Architect, develop, and maintain custom, responsive WordPress websites tailored to the needs of law firms and medical practices.
UX/UI Design: Translate creative concepts and wireframes into intuitive, visually appealing, and user-friendly interfaces that enhance user engagement and conversion rates.
Conversion Optimization: Implement best practices for landing page design and lead generation, ensuring all digital assets are optimized to drive measurable results.
Performance & SEO: Optimize website speed, performance, and technical SEO elements to ensure maximum visibility and functionality across all devices and browsers.
Collaboration: Work closely with the digital marketing, SEO, and content teams to align website functionality with broader advertising and marketing campaigns.
Maintenance & Troubleshooting: Perform regular website updates, manage plugins, ensure robust security measures, and troubleshoot any technical issues that arise.
Qualifications

To be successful in this role, you should possess the following qualifications:

Experience: Proven experience as a WordPress Developer, Front-End Developer, or similar role, preferably within a digital agency environment.
Technical Skills: Proficiency in HTML5, CSS3, JavaScript, and PHP. Deep understanding of WordPress architecture, custom theme development, and plugin integration.
Design Acumen: Strong eye for visual design and UX/UI principles, with the ability to create aesthetically pleasing and highly functional digital experiences.
SEO & Performance: Solid understanding of technical SEO best practices, website performance optimization, and responsive design techniques.
Soft Skills: Exceptional attention to detail, strong problem-solving abilities, and the capacity to manage multiple projects simultaneously in a fast-paced setting.
Work Environment: Must be able to work full-time, on-site at our Westlake Village, CA office.
What We Offer

At Legal Leads Group, Inc., we value our team members and offer a supportive environment where you can grow your career. We provide:

Competitive compensation commensurate with your experience.
The opportunity to work with a fast-growing, industry-leading agency.
A dynamic, collaborative, and creative in-office culture.
Professional development and the chance to make a tangible impact on high-profile client campaigns.
How to Apply

If you are a passionate developer ready to build digital experiences that drive real business results, we want to hear from you. Please submit your resume, a cover letter detailing your relevant experience, and a portfolio showcasing your best WordPress and web development projects.

Legal Leads Group, Inc. is an Equal Opportunity Employer.

Job Type: Full-time

Pay: $7,500.00 - $12,500.00 per month

Benefits:

Health insurance
Paid time off
Vision insurance
Ability to Commute:

Westlake Village, CA 91361 (Required)
Work Location: In person', NULL, 'Westlake Village, CA 91361', NULL, NULL, 'ready_to_apply', 'https://www.indeed.com/viewjob?jk=b8d7de26868ea759&from=shareddesktop_copy', '2026-03-26 13:44:04.970292+00', '2026-03-26 13:44:04.970292+00');


--
-- Data for Name: application_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."application_assets" ("id", "job_id", "resume_markdown", "cover_letter_markdown", "recruiter_note", "created_at") VALUES
	('f93c5102-693d-4e6f-966d-e2f211e431a2', '1e45c82c-fe94-447c-85b5-06c63a6dba4b', '# Dan Walter

Website Manager / Senior Web Developer

## Summary
Website Manager and Senior Web Developer with 15+ years of experience leading WordPress website operations, content-driven web projects, and e-commerce initiatives. Strong background in CMS administration, web analytics, project leadership, SEO, accessibility, responsiveness, and cross-functional collaboration. Hands-on experience building and maintaining custom WordPress functionality, API integrations, and business-focused web experiences.

## Skills
- Website management and web operations
- WordPress CMS administration
- WooCommerce and e-commerce web experiences
- Web analytics and performance monitoring
- Project leadership and cross-functional collaboration
- PHP, MySQL, JavaScript, React
- Custom themes, plugins, and API integrations
- SEO, accessibility, responsiveness, usability
- Git, Pantheon, staged deployments

## Experience
### WordPress Developer | Slate Digital
Los Angeles, CA | Nov 2021 – Oct 2024
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized site performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
San Diego, CA | Dec 2022 – Oct 2023
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
Carlsbad, CA | Apr 2016 – May 2021
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development team and product lifecycle from planning through delivery.

### Manager of Product Support | Next Level Security Systems
Carlsbad, CA | Nov 2012 – Apr 2016
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Owner / Operator | Walter Computer Services
Oceanside, CA | Nov 1989 – Oct 2014
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
San Diego, CA | Jan 1998 – Apr 2006
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.', 'Dear Hiring Team,

I’m excited to apply for the Website Manager role with ANZAR ENTERPRISES, INC. Dan Walter is a Website Manager / Senior Web Developer with 15+ years of experience leading website operations, managing CMS-driven content, and supporting business-focused web initiatives. My background includes WordPress administration, e-commerce support, project leadership, SEO, and ongoing website optimization to improve performance and user experience.

In recent roles, I have managed high-traffic WordPress sites and landing pages, built custom plugins and integrations, supported API-driven functionality, and worked closely with creative, media, and internal stakeholders to deliver reliable web experiences. I have also led larger WordPress-based product initiatives, including membership and LMS platforms, with responsibility for scoping, execution, and cross-functional coordination. This aligns well with your need for someone who can oversee daily website operations, content updates, analytics-informed improvements, and e-commerce activity.

I would welcome the opportunity to bring my experience in website management, technical execution, and collaborative project delivery to MONTE DE PIEDAD. I’m particularly drawn to the chance to support a customer-focused business by improving website performance, usability, and alignment with business goals. Thank you for your consideration.', 'Dan Walter is a strong match for this Website Manager role, with 15+ years spanning WordPress operations, CMS content management, web project leadership, and e-commerce support. He brings hands-on technical depth in PHP, JavaScript, APIs, SEO, and deployment workflows, along with experience collaborating across teams to improve site performance and user experience. His recent work managing high-traffic WordPress environments makes him especially relevant for this opening.', '2026-03-26 03:36:53.905737+00'),
	('e1929dfb-8bee-44e0-9ac3-81689efd0bd8', 'c955e188-885f-431b-9395-2b279ccc19f2', '# Dan Walter

Website Manager / Senior Web Developer

## Summary
Senior WordPress developer and website manager with 15+ years of experience building, maintaining, and optimizing content-driven web platforms, high-traffic marketing sites, and e-commerce experiences. Strong background in custom PHP development, WordPress CMS administration, API integrations, React, WooCommerce, and cross-functional project ownership from architecture through launch. Proven success improving performance, responsiveness, accessibility, and SEO while supporting business and digital strategy goals.

## Skills
- WordPress, custom PHP, MySQL, JavaScript, React
- WooCommerce, custom themes, plugins, REST/API integrations
- High-traffic websites, website operations, staged deployments
- Pantheon, Git, CMS administration
- Performance optimization, SEO, accessibility, responsiveness, usability
- Project leadership, cross-functional collaboration, web analytics

## Experience
### WordPress Developer | Slate Digital
*Los Angeles, CA | Nov 2021 – Oct 2024*
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized site performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
*San Diego, CA | Dec 2022 – Oct 2023*
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
*Carlsbad, CA | Apr 2016 – May 2021*
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development team and product lifecycle from planning through delivery.

### Manager of Product Support | Next Level Security Systems
*Carlsbad, CA | Nov 2012 – Apr 2016*
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Owner / Operator | Walter Computer Services
*Oceanside, CA | Nov 1989 – Oct 2014*
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
*San Diego, CA | Jan 1998 – Apr 2006*
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.', 'Dear Hiring Team,

I’m excited to apply for the Web Developer / WordPress and Next.js role with Motion Recruitment. My background includes 15+ years of web development and website management experience, with deep hands-on work in WordPress, custom PHP, high-traffic websites, API integrations, and business-critical web platforms. I’ve led projects from planning through launch and optimization, and I’m especially drawn to opportunities where web platforms support content publishing, e-commerce, and member engagement at scale.

In recent roles, I developed and maintained high-traffic WordPress sites and landing pages, built custom plugins and PHP scripts, managed Pantheon hosting and Git-based deployments, and improved performance, responsiveness, and SEO. I also led WordPress-based membership and LMS initiatives, oversaw backend architecture and API integrations, and partnered closely with cross-functional teams to deliver scalable solutions aligned with business goals. In addition to strong JavaScript and React experience, I would bring a practical ownership mindset to a role focused on modernizing enterprise web platforms.

I’d welcome the opportunity to contribute my WordPress expertise, React foundation, and end-to-end project leadership to this team. This role stands out because of its focus on ownership, thoughtful collaboration, and long-term platform impact, and I would be excited to help support that mission.
', 'Dan Walter is a strong match for this Senior WordPress-focused opening, with 15+ years of experience across WordPress development, custom PHP, API integrations, and website operations. He has recent experience supporting high-traffic WordPress environments, plus React exposure and a track record of owning projects from planning through deployment. His background in membership, content, and business-driven web platforms aligns well with this organization’s publishing and engagement goals.', '2026-03-26 03:39:48.070062+00'),
	('d592d4e5-e0fe-4c56-a521-d344490c8388', '7e665783-a238-49f9-b506-1d68a39fb415', '# Dan Walter

## Summary
Website Manager and Senior Web Developer with 15+ years of experience leading WordPress website operations, content-driven web projects, and e-commerce initiatives. Strong background in WordPress, PHP, MySQL, JavaScript, HTML/CSS, API integrations, SEO, accessibility, responsiveness, and cross-functional coordination. Experienced supporting website updates, content publishing, landing pages, forms, and ongoing optimization for business-focused web experiences.

## Skills
- WordPress CMS administration
- SEO optimization
- Content publishing and website support updates
- HTML, CSS, PHP, MySQL, JavaScript
- Custom themes, plugins, and API integrations
- WooCommerce and e-commerce support
- Website performance, responsiveness, accessibility, and usability
- Web operations, Git, Pantheon, staged deployments
- Cross-functional collaboration and project leadership

## Experience
### WordPress Developer | Slate Digital
Los Angeles, CA | Nov 2021 – Oct 2024
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized site performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
San Diego, CA | Dec 2022 – Oct 2023
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
Carlsbad, CA | Apr 2016 – May 2021
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development team and product lifecycle from planning through delivery.

### Manager of Product Support | Next Level Security Systems
Carlsbad, CA | Nov 2012 – Apr 2016
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Owner / Operator | Walter Computer Services
Oceanside, CA | Nov 1989 – Oct 2014
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
San Diego, CA | Jan 1998 – Apr 2006
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.', 'Dear Hiring Team,

I’m excited to apply for the SEO and WordPress Web Developer role at American Creative. My background includes 15+ years of WordPress website management and web development, with hands-on experience maintaining sites, posting and updating content, building custom functionality, and improving SEO, responsiveness, and usability. I’ve supported marketing websites, landing pages, and ongoing web operations in environments where strong organization and communication were essential.

In recent roles, I developed and maintained high-traffic WordPress sites, collaborated with creative and internal teams on campaigns and design updates, and worked across PHP, HTML, CSS, JavaScript, APIs, Git, and hosting workflows. I also bring experience from product and support leadership roles, which strengthened my ability to manage requests, coordinate across stakeholders, and keep web projects moving efficiently. That mix of technical execution and day-to-day website support aligns well with your need for someone who can handle SEO-related updates, WordPress changes, and campaign coordination.

I’d welcome the opportunity to contribute to American Creative’s client work and support your SEO and website team. I’m especially interested in applying my WordPress and optimization experience in an agency environment focused on client service, continuous improvement, and practical digital marketing results.
', 'Dan Walter is a strong match for this SEO and WordPress Web Developer role based on deep WordPress experience, hands-on PHP/HTML/CSS/JavaScript work, and a consistent track record supporting marketing websites and landing pages. He also brings SEO optimization, content-focused web operations, and cross-functional coordination experience that aligns well with agency-style client support.', '2026-03-26 12:37:32.379596+00'),
	('2a7d7981-c4cb-4538-84bb-92eeecbea9bd', 'c778f63b-ef5e-4e80-b7f1-1f545a02fbaa', '# Dan Walter
Website Manager / Senior Web Developer

## Summary
Website Manager and Senior Web Developer with 15+ years of experience building and supporting production web systems with deep WordPress, PHP, MySQL, JavaScript, API integration, and e-commerce expertise. Proven track record leading website operations, improving performance, accessibility, responsiveness, and SEO, and delivering business-focused web solutions in collaboration with cross-functional teams. Hands-on experience with Git, staged deployments, hosting operations, troubleshooting, and maintaining reliable user-facing web platforms.

## Skills
- PHP, MySQL, JavaScript, React, HTML, CSS
- WordPress CMS administration, custom themes, plugins, and site operations
- API integrations, REST-style services, secure endpoints, web functionality integrations
- WooCommerce and e-commerce web experiences
- Git, Pantheon, staged deployments
- Website performance, accessibility, SEO, responsiveness, usability
- Web analytics and performance monitoring
- Cross-functional collaboration, project leadership, technical troubleshooting
- Hosting environments, production support, web platform maintenance

## Experience
### WordPress Developer | Slate Digital
Los Angeles, CA | Nov 2021 – Oct 2024
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
San Diego, CA | Dec 2022 – Oct 2023
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
Carlsbad, CA | Apr 2016 – May 2021
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development team and product lifecycle from planning through delivery.

### Manager of Product Support | Next Level Security Systems
Carlsbad, CA | Nov 2012 – Apr 2016
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Owner / Operator | Walter Computer Services
Oceanside, CA | Nov 1989 – Oct 2014
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
San Diego, CA | Jan 1998 – Apr 2006
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.', 'Dear Hiring Team,

I am excited to apply for the Web Developer role at Cross Catholic Outreach. With 15+ years of experience in web operations and development, I bring strong hands-on expertise in WordPress, PHP, MySQL, JavaScript, API integrations, and e-commerce-focused web platforms. My background includes maintaining production websites, supporting back-end functionality, improving performance and SEO, and partnering across teams to deliver reliable digital experiences aligned with organizational goals.

In recent roles, I developed and maintained high-traffic WordPress sites and landing pages, built custom plugins and PHP-based functionality, managed Pantheon hosting and Git deployment workflows, and integrated APIs to support user-facing content and business processes. I have also led product delivery for WordPress-based membership and LMS platforms, overseen backend architecture and integrations, and supported web systems with a strong focus on usability, accessibility, responsiveness, and operational reliability.

Cross Catholic Outreach’s mission is especially meaningful, and I would welcome the opportunity to contribute my technical skills in service of an organization focused on helping the poorest of the poor in the name of Christ. I would be glad to support your team by maintaining secure, effective web platforms, resolving production issues, and helping deliver features that strengthen fundraising, engagement, and outreach efforts.', 'Dan Walter is a strong match for this Web Developer role based on his extensive WordPress, PHP, MySQL, API integration, e-commerce, and production web support experience. He has led website operations, managed hosting and deployment workflows, and supported business-critical web platforms across both hands-on developer and leadership roles. While his profile does not specifically confirm Laravel, Next.js, SharePoint Online, or Power Apps, his background aligns closely with the core WordPress, PHP, integration, troubleshooting, and cross-functional collaboration needs of the position.', '2026-03-26 12:43:05.192222+00'),
	('8dcaa98b-5871-4b77-8558-d6bdc2612807', '3d02326a-f871-4feb-baab-29831f467bca', '# Dan Walter
Website Manager / Senior Web Developer

## Summary
Website Manager and Senior Web Developer with 15+ years of experience leading WordPress website operations, content updates, landing page development, and e-commerce initiatives. Strong background in PHP, MySQL, JavaScript, WooCommerce, custom plugins, API integrations, SEO, accessibility, responsiveness, and performance optimization. Known for owning website quality end to end, collaborating with stakeholders, and delivering clean, user-friendly web experiences aligned with business goals.

## Skills
- WordPress website management and administration
- Content updates, landing pages, and layout improvements
- Plugin management, troubleshooting, and custom functionality
- PHP, MySQL, JavaScript, React
- Custom themes, plugins, and API integrations
- WooCommerce and e-commerce web experiences
- Forms, lead capture, and web integrations
- SEO, page speed, responsiveness, accessibility, usability
- Git, Pantheon, staged deployments
- Cross-functional collaboration and project leadership

## Experience
### WordPress Developer | Slate Digital
Los Angeles, CA | Nov 2021 – Oct 2024
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized site performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
San Diego, CA | Dec 2022 – Oct 2023
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
Carlsbad, CA | Apr 2016 – May 2021
- Led product development and engineering for WordPress-based marketing automation, membership, and web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development teams and product delivery from planning through launch.

### Owner / Operator | Walter Computer Services
Oceanside, CA | Nov 1989 – Oct 2014
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Manager of Product Support | Next Level Security Systems
Carlsbad, CA | Nov 2012 – Apr 2016
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
San Diego, CA | Jan 1998 – Apr 2006
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.
', 'Dear Hiring Team,

I’m excited to apply for the Website & Digital Optimization Specialist role with PJ Metal Craft. With 15+ years of experience managing WordPress websites, building custom functionality, improving SEO and performance, and supporting content-driven web projects, I offer the combination of technical depth and day-to-day website ownership you’re seeking. My background includes maintaining WordPress sites and landing pages, managing plugins and deployments, and partnering with stakeholders to create polished, user-friendly web experiences.

In recent roles, I developed and maintained high-traffic WordPress websites, built custom plugins and PHP functionality, managed hosting and staged deployments, and improved responsiveness, layout, and search visibility. I’ve also supported forms, API integrations, and campaign pages, and I’m comfortable working independently to keep websites accurate, organized, and aligned with brand goals. While Divi and Constant Contact are listed as preferences, my experience across WordPress environments, plugins, integrations, and marketing-focused web operations would allow me to contribute quickly.

PJ Metal Craft’s emphasis on precision, quality, and architectural excellence strongly resonates with me. I would welcome the opportunity to help maintain and elevate your online presence with the same attention to detail your team brings to its work. Thank you for your time and consideration.
', 'Dan is a strong match for this part-time WordPress role because his background centers on website ownership, content updates, plugin/custom functionality, SEO, responsiveness, and performance optimization. He has substantial experience supporting marketing sites and landing pages, plus the initiative and independence needed for a flexible, leadership-facing position. While Divi and Constant Contact are not explicitly listed in his background, his WordPress and integrations experience is directly relevant.', '2026-03-26 12:44:53.172793+00'),
	('5df3b47c-54bd-41a6-b8f7-b2e67ef26f71', 'd573cc28-d19d-4766-9287-e29355a3a583', '# Dan Walter

## Summary
Website Manager / Senior Web Developer with 15+ years of experience building and managing WordPress websites, landing pages, and content-driven web experiences. Strong background in custom WordPress development, PHP, JavaScript, API integrations, WooCommerce, SEO, accessibility, responsiveness, and performance optimization. Experienced collaborating with creative, content, and marketing teams to deliver conversion-focused websites that support business goals.

## Skills
- WordPress CMS administration and website operations
- Custom themes, plugins, and API integrations
- PHP, MySQL, JavaScript, React, HTML, CSS
- WooCommerce and e-commerce web experiences
- Technical SEO, accessibility, responsiveness, and usability
- Website performance monitoring and optimization
- Git, Pantheon, and staged deployments
- Cross-functional collaboration and project leadership

## Experience
### WordPress Developer | Slate Digital
*Los Angeles, CA | Nov 2021 – Oct 2024*
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
*San Diego, CA | Dec 2022 – Oct 2023*
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
*Carlsbad, CA | Apr 2016 – May 2021*
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development team and product lifecycle from planning through delivery.

### Manager of Product Support | Next Level Security Systems
*Carlsbad, CA | Nov 2012 – Apr 2016*
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Owner / Operator | Walter Computer Services
*Oceanside, CA | Nov 1989 – Oct 2014*
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
*San Diego, CA | Jan 1998 – Apr 2006*
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.
', 'Dear Hiring Team,

I am excited to apply for the Website / WordPress Developer role with Legal Leads Group. With 15+ years of web development experience, I have built and managed WordPress websites, landing pages, and custom functionality that support marketing goals, improve performance, and create strong user experiences. My background includes PHP, JavaScript, custom themes and plugins, API integrations, SEO, accessibility, and responsive development.

In recent roles, I developed and maintained high-traffic WordPress websites and landing pages, collaborated closely with creative and media teams, and supported reliable website operations through Git, Pantheon, and staged deployments. I have also led WordPress-based product and membership platform delivery, managed complex API integrations, and worked across teams to turn business requirements into effective web solutions. This aligns well with your need for a developer who can build conversion-focused websites and support broader marketing and SEO initiatives.

I would welcome the opportunity to bring my WordPress development experience, attention to detail, and collaborative approach to Legal Leads Group’s in-house team. I am especially interested in contributing to high-performing websites that help clients generate leads and strengthen their digital presence. Thank you for your consideration.
', 'Dan Walter is a strong fit for this Website / WordPress Developer role based on his deep WordPress background, agency-adjacent marketing site experience, and long track record in PHP, JavaScript, SEO, performance, and custom plugin/API work. He has recent experience supporting high-traffic WordPress sites and landing pages, collaborating with creative teams, and managing reliable deployment workflows. He appears especially well aligned for a conversion-focused, in-office web development environment.', '2026-03-26 13:45:17.750391+00'),
	('beee895b-dd96-4dd2-8617-6c13a96e8e8c', 'fa21508e-4fb6-4f99-bc32-da80f9b73efe', '# Dan Walter

## Summary
Website Manager / Senior Web Developer with 15+ years of experience building and managing WordPress websites, landing pages, and content-driven web platforms. Strong background in PHP, JavaScript, MySQL, custom themes and plugins, API integrations, Git workflows, and staged deployments. Proven success improving performance, responsiveness, accessibility, SEO, and usability while collaborating with designers, marketers, and cross-functional teams to deliver business-focused web experiences.

## Skills
- WordPress development and administration
- PHP, JavaScript, HTML, CSS, MySQL
- Custom themes, plugins, and API integrations
- Responsive web development
- WooCommerce and e-commerce web experiences
- Git, Pantheon, staged deployments
- Technical SEO, accessibility, usability, performance optimization
- Website operations, testing, debugging, and cross-browser responsiveness
- Cross-functional collaboration with design, content, and project stakeholders
- React
- Multiple CMS platforms: WordPress, Joomla, Drupal

## Experience
### WordPress Developer | Slate Digital
*Los Angeles, CA | Nov 2021 – Oct 2024*
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives.
- Built custom plugins and PHP scripts to support front-end and back-end website functionality.
- Collaborated with creative and media teams to implement design updates and web campaigns.
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations.
- Optimized site performance, responsiveness, and SEO using web best practices.

### Web Developer | Turning Point for God
*San Diego, CA | Dec 2022 – Oct 2023*
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript.
- Integrated internal and external APIs into web platforms to support user-facing content and functionality.
- Partnered with internal teams to deliver web experiences aligned with organizational needs.

### Director of Product Development | Box Out Marketing
*Carlsbad, CA | Apr 2016 – May 2021*
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms.
- Managed $667K+ in WordPress-based membership and LMS projects.
- Oversaw API integrations and backend systems architecture across client implementations.
- Directed discovery, scoping, and implementation for web initiatives tied to business goals.
- Managed development team and product lifecycle from planning through delivery.

### Manager of Product Support | Next Level Security Systems
*Carlsbad, CA | Nov 2012 – Apr 2016*
- Led product support operations and technical training for customer deployments.
- Configured customer systems across hardware, software, and networks.
- Built and maintained the support portal and knowledge base.

### Owner / Operator | Walter Computer Services
*Oceanside, CA | Nov 1989 – Oct 2014*
- Delivered IT consulting, technical support, and web development services for local clients.
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal.
- Maintained servers, networks, and desktop systems across platforms.

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
*San Diego, CA | Jan 1998 – Apr 2006*
- Managed computer department sales and technical support operations.
- Repaired and configured desktops and laptops.
- Trained and supervised student employees.', 'Dear Hiring Team,

I’m excited to apply for the WordPress Developer role at Straight North. With 15+ years of web development experience, including recent hands-on work building and maintaining high-traffic WordPress websites and landing pages, I offer a strong mix of front-end development, WordPress expertise, and website operations support. My background includes PHP, JavaScript, HTML, CSS, custom plugin development, API integrations, Git workflows, and performance and SEO optimization.

In my recent role at Slate Digital, I developed and maintained WordPress marketing sites, built custom plugins and PHP functionality, collaborated with creative and media teams on campaign launches, and managed Pantheon hosting with staged deployments and Git-based code changes. Across prior roles, I’ve also supported landing pages, responsive website updates, API-driven functionality, and WordPress-based marketing and membership platforms. This aligns closely with your need for someone who can translate concepts into polished web experiences while improving design, functionality, SEO, and conversion.

Straight North’s focus on collaboration, digital marketing, and client impact is especially appealing to me. I’d welcome the opportunity to bring my WordPress development experience, technical problem-solving, and team-oriented approach to your organization. Thank you for your consideration.
', 'Dan Walter is a strong match for Straight North’s WordPress Developer role, with deep WordPress experience across marketing sites, landing pages, custom plugins, API integrations, and Git-based deployment workflows. His background aligns well with your need for responsive front-end development, SEO-conscious site improvements, and close collaboration with creative and project teams. He also brings experience across multiple CMS platforms, which is listed as a plus in the posting.', '2026-03-26 13:57:14.275233+00'),
	('65fc93df-0c74-42f0-83e0-73863f3bdced', '33a73cd1-6aa7-49cb-ad30-188631719391', '# Dan Walter

Website Manager / Senior Web Developer

## Summary
Website Manager and Senior Web Developer with 15+ years of experience leading WordPress website operations, custom development, and content-driven web projects. Strong background in WordPress, WooCommerce, PHP, MySQL, JavaScript, custom themes, plugins, API integrations, and staged deployments. Proven success improving site performance, responsiveness, accessibility, and SEO while partnering with cross-functional teams to deliver business-focused web solutions.

## Skills
- WordPress development and website management
- WooCommerce and e-commerce experiences
- PHP, MySQL, JavaScript, React
- Custom themes, plugins, and API integrations
- CSS, responsive design, usability, accessibility, SEO
- Web analytics, performance monitoring, and optimization
- Git, Pantheon, staged deployments
- Cross-functional collaboration and project leadership
- Client-facing communication and technical explanation

## Experience
### WordPress Developer | Slate Digital
*Los Angeles, CA | Nov 2021 – Oct 2024*
- Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives
- Built custom plugins and PHP scripts to support front-end and back-end website functionality
- Collaborated with creative and media teams to implement design updates and web campaigns
- Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations
- Optimized site performance, responsiveness, and SEO using web best practices

### Web Developer | Turning Point for God
*San Diego, CA | Dec 2022 – Oct 2023*
- Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript
- Integrated internal and external APIs into web platforms to support user-facing content and functionality
- Partnered with internal teams to deliver web experiences aligned with organizational needs

### Director of Product Development | Box Out Marketing
*Carlsbad, CA | Apr 2016 – May 2021*
- Led product development and engineering for marketing automation, membership, and WordPress-based web platforms
- Managed $667K+ in WordPress-based membership and LMS projects
- Oversaw API integrations and backend systems architecture across client implementations
- Directed discovery, scoping, and implementation for web initiatives tied to business goals
- Managed development team and product lifecycle from planning through delivery

### Manager of Product Support | Next Level Security Systems
*Carlsbad, CA | Nov 2012 – Apr 2016*
- Led product support operations and technical training for customer deployments
- Configured customer systems across hardware, software, and networks
- Built and maintained the support portal and knowledge base

### Owner / Operator | Walter Computer Services
*Oceanside, CA | Nov 1989 – Oct 2014*
- Delivered IT consulting, technical support, and web development services for local clients
- Built websites using PHP, MySQL, WordPress, Joomla, and Drupal
- Maintained servers, networks, and desktop systems across platforms

### Computer Dept. Sales & Support Manager | Point Loma Nazarene University
*San Diego, CA | Jan 1998 – Apr 2006*
- Managed computer department sales and technical support operations
- Repaired and configured desktops and laptops
- Trained and supervised student employees
', '# Dan Walter

Dear Hiring Team,

I’m excited to apply for the WordPress Developer role at Medical Consulting Group. With 15+ years of experience in WordPress website operations, custom development, and business-focused web delivery, I bring a strong background in building and maintaining responsive, high-performing websites using WordPress, WooCommerce, PHP, JavaScript, and custom integrations.

In recent roles, I have developed and maintained high-traffic WordPress sites and landing pages, built custom plugins and PHP functionality, supported API integrations, and improved site performance, responsiveness, accessibility, and SEO. I have also partnered closely with creative, media, and internal stakeholders to deliver polished web experiences that align with broader campaign and business goals. My background leading WordPress-based product and membership platform initiatives has also strengthened my ability to balance technical execution, usability, and project priorities in fast-paced environments.

I’m especially interested in MCG’s collaborative model and the opportunity to support clients by clearly explaining technical decisions in a practical, approachable way. I would welcome the chance to bring my WordPress development experience, cross-functional collaboration skills, and focus on clean, maintainable web solutions to your digital team.
', 'Dan Walter is a strong match for this WordPress Developer role based on his deep WordPress experience, custom PHP development, WooCommerce support, and focus on performance, responsiveness, accessibility, and SEO. He has worked closely with creative and cross-functional teams, managed staged deployments in Pantheon, and led business-focused WordPress initiatives. He should be especially compelling for a role that needs both hands-on execution and clear communication of technical choices.', '2026-03-26 14:08:28.576159+00');


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."applications" ("id", "job_id", "status", "notes", "applied_at", "follow_up_1_due", "follow_up_2_due", "resume_markdown", "resume_text", "cover_letter_markdown", "cover_letter_text", "created_at", "updated_at", "follow_up_1_sent_at", "follow_up_2_sent_at") VALUES
	('7c3a74c3-9996-4192-b857-1356a04d9957', '1e45c82c-fe94-447c-85b5-06c63a6dba4b', 'applied', NULL, '2026-03-26 03:37:36.257+00', '2026-03-31 03:37:36.257+00', '2026-04-05 03:37:36.257+00', NULL, NULL, NULL, NULL, '2026-03-26 03:35:31.008445+00', '2026-03-26 03:37:36.257+00', NULL, NULL),
	('bcd0af33-817c-40f0-a3e0-4426fb5f751d', 'c955e188-885f-431b-9395-2b279ccc19f2', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 03:38:55.372875+00', '2026-03-26 03:39:55.077+00', NULL, NULL),
	('1a7f783d-d936-4059-acf9-4d59da2ac3be', '7e665783-a238-49f9-b506-1d68a39fb415', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 12:26:36.608086+00', '2026-03-26 12:26:36.608086+00', NULL, NULL),
	('cf21eb29-bf8e-4e26-b3ff-1ce7fbd19069', 'c778f63b-ef5e-4e80-b7f1-1f545a02fbaa', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 12:40:11.049947+00', '2026-03-26 12:40:11.049947+00', NULL, NULL),
	('bb3d7aa0-bb5a-4b7d-ac7c-de61db88eddf', '3d02326a-f871-4feb-baab-29831f467bca', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 12:43:57.241696+00', '2026-03-26 12:43:57.241696+00', NULL, NULL),
	('17b57e9a-3263-4e8d-a4c5-5d2425cdd1b0', 'd573cc28-d19d-4766-9287-e29355a3a583', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 13:44:04.993611+00', '2026-03-26 13:44:04.993611+00', NULL, NULL),
	('deb8b1ec-8686-481f-881d-fc24bc5f734e', 'fa21508e-4fb6-4f99-bc32-da80f9b73efe', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 13:56:34.986989+00', '2026-03-26 13:56:34.986989+00', NULL, NULL),
	('4691588d-4603-47c1-b4a7-dfbcce2dc4c1', '33a73cd1-6aa7-49cb-ad30-188631719391', 'ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-26 14:07:41.601327+00', '2026-03-26 14:07:41.601327+00', NULL, NULL);


--
-- Data for Name: automation_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."automation_jobs" ("id", "job_type", "entity_type", "entity_id", "status", "attempts", "max_attempts", "payload", "last_error", "scheduled_for", "started_at", "completed_at", "created_at", "updated_at") VALUES
	('476cb691-d396-4d4d-8e75-949ed466d6f1', 'score_job', 'job', '1e45c82c-fe94-447c-85b5-06c63a6dba4b', 'completed', 0, 3, '{}', NULL, '2026-03-26 03:35:31.023+00', '2026-03-26 12:35:34.462+00', '2026-03-26 12:35:40.626+00', '2026-03-26 03:35:31.025925+00', '2026-03-26 12:35:40.628867+00'),
	('56bcd9e8-cc0d-421b-9561-ba2cd2f918cc', 'schedule_followups', 'application', '7c3a74c3-9996-4192-b857-1356a04d9957', 'completed', 0, 3, '{}', NULL, '2026-03-26 03:37:36.273+00', '2026-03-26 12:35:40.636+00', '2026-03-26 12:35:40.645+00', '2026-03-26 03:37:36.276512+00', '2026-03-26 12:35:40.647483+00'),
	('7a0a6183-266a-4532-84f4-c730ddf766c3', 'score_job', 'job', 'c955e188-885f-431b-9395-2b279ccc19f2', 'completed', 0, 3, '{}', NULL, '2026-03-26 03:38:55.387+00', '2026-03-26 12:35:40.655+00', '2026-03-26 12:35:44.858+00', '2026-03-26 03:38:55.389991+00', '2026-03-26 12:35:44.865894+00'),
	('d0fa063e-3d48-407e-be4f-ce9ce4dda7fa', 'score_job', 'job', '7e665783-a238-49f9-b506-1d68a39fb415', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:26:36.629+00', '2026-03-26 12:35:44.867+00', '2026-03-26 12:35:50.444+00', '2026-03-26 12:26:36.634637+00', '2026-03-26 12:35:50.452179+00'),
	('49389bee-9286-4210-b553-915fa0a59128', 'generate_assets', 'job', '1e45c82c-fe94-447c-85b5-06c63a6dba4b', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:35:40.617+00', '2026-03-26 12:36:53.623+00', '2026-03-26 12:37:06.077+00', '2026-03-26 12:35:40.619488+00', '2026-03-26 12:37:06.080903+00'),
	('a420a28a-9870-4339-b27b-102ba306aef3', 'generate_assets', 'job', 'c955e188-885f-431b-9395-2b279ccc19f2', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:35:44.851+00', '2026-03-26 12:37:06.085+00', '2026-03-26 12:37:19.681+00', '2026-03-26 12:35:44.858402+00', '2026-03-26 12:37:19.683954+00'),
	('3639d1c1-827c-4fa1-8473-4a58a53bdf3e', 'generate_assets', 'job', '7e665783-a238-49f9-b506-1d68a39fb415', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:35:50.436+00', '2026-03-26 12:37:19.69+00', '2026-03-26 12:37:32.396+00', '2026-03-26 12:35:50.444004+00', '2026-03-26 12:37:32.401056+00'),
	('600d0ac7-6844-4f7c-af11-400720d4bb9c', 'score_job', 'job', 'c778f63b-ef5e-4e80-b7f1-1f545a02fbaa', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:40:11.062+00', '2026-03-26 12:40:43.661+00', '2026-03-26 12:40:49.802+00', '2026-03-26 12:40:11.064549+00', '2026-03-26 12:40:49.805374+00'),
	('aac2bab3-1def-4d3c-9f09-85248c945218', 'score_job', 'job', '3d02326a-f871-4feb-baab-29831f467bca', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:43:57.254+00', '2026-03-26 12:44:13.292+00', '2026-03-26 12:44:21.076+00', '2026-03-26 12:43:57.256907+00', '2026-03-26 12:44:21.080594+00'),
	('2075b397-0937-43f7-b35d-6c9efc186907', 'generate_assets', 'job', '3d02326a-f871-4feb-baab-29831f467bca', 'completed', 0, 3, '{}', NULL, '2026-03-26 12:44:21.065+00', '2026-03-26 12:44:39.056+00', '2026-03-26 12:44:53.198+00', '2026-03-26 12:44:21.069956+00', '2026-03-26 12:44:53.200212+00'),
	('d61127b4-e210-4218-a583-a89ca20a996a', 'score_job', 'job', 'd573cc28-d19d-4766-9287-e29355a3a583', 'completed', 0, 3, '{}', NULL, '2026-03-26 13:44:05.005+00', '2026-03-26 13:44:28.624+00', '2026-03-26 13:44:34.904+00', '2026-03-26 13:44:05.009691+00', '2026-03-26 13:44:34.909663+00'),
	('80270395-ebb2-403f-b587-627b0642a248', 'generate_assets', 'job', 'd573cc28-d19d-4766-9287-e29355a3a583', 'completed', 0, 3, '{}', NULL, '2026-03-26 13:44:34.896+00', '2026-03-26 13:45:01.911+00', '2026-03-26 13:45:17.767+00', '2026-03-26 13:44:34.901585+00', '2026-03-26 13:45:17.770775+00'),
	('fb54fa06-1411-4da7-8676-a72217cec31c', 'score_job', 'job', 'fa21508e-4fb6-4f99-bc32-da80f9b73efe', 'completed', 0, 3, '{}', NULL, '2026-03-26 13:56:34.999+00', '2026-03-26 13:56:53.907+00', '2026-03-26 13:57:00.599+00', '2026-03-26 13:56:35.003739+00', '2026-03-26 13:57:00.604783+00'),
	('61f370a2-dd5f-4b49-9487-795d042eabb1', 'generate_assets', 'job', 'fa21508e-4fb6-4f99-bc32-da80f9b73efe', 'completed', 0, 3, '{}', NULL, '2026-03-26 13:57:00.59+00', '2026-03-26 13:57:00.618+00', '2026-03-26 13:57:14.289+00', '2026-03-26 13:57:00.595638+00', '2026-03-26 13:57:14.291675+00'),
	('f3750854-94ed-4a02-b50b-b63068682123', 'score_job', 'job', '33a73cd1-6aa7-49cb-ad30-188631719391', 'completed', 0, 3, '{}', NULL, '2026-03-26 14:07:41.616+00', '2026-03-26 14:08:09.665+00', '2026-03-26 14:08:16.062+00', '2026-03-26 14:07:41.618912+00', '2026-03-26 14:08:16.064936+00'),
	('1c9dcbbb-21d3-4472-bbd0-0d79893c706e', 'generate_assets', 'job', '33a73cd1-6aa7-49cb-ad30-188631719391', 'completed', 0, 3, '{}', NULL, '2026-03-26 14:08:16.054+00', '2026-03-26 14:08:16.079+00', '2026-03-26 14:08:28.591+00', '2026-03-26 14:08:16.057317+00', '2026-03-26 14:08:28.596289+00');


--
-- Data for Name: candidate_experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."candidate_experience" ("id", "candidate_profile_id", "company", "title", "bullets", "technologies", "summary", "location", "start_date", "end_date", "is_current", "sort_order", "created_at", "updated_at") VALUES
	('867bfdab-5e76-462a-97f8-a7da4d0432ff', '99de6939-48b8-472a-ad51-d4e534310f02', 'Slate Digital', 'WordPress Developer', '{"Developed and maintained the main WordPress website and landing pages for high-traffic marketing initiatives","Built custom plugins and PHP scripts to support front-end and back-end website functionality","Collaborated with creative and media teams to implement design updates and web campaigns","Managed Pantheon hosting, Git workflows, and staged deployments for reliable website operations","Optimized performance, responsiveness, and SEO using web best practices"}', '{WordPress,PHP,JavaScript,Pantheon,Git,SEO}', 'Developed and maintained high-traffic WordPress marketing websites and landing pages.', 'Los Angeles, CA', '2021-12-01', '2024-11-01', false, 1, '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00'),
	('98a0b67b-5eb1-4967-866c-3a4c0883bb7e', '99de6939-48b8-472a-ad51-d4e534310f02', 'Turning Point for God', 'Web Developer', '{"Maintained websites and landing pages using PHP, HTML, CSS, and JavaScript","Integrated internal and external APIs into web platforms to support user-facing content and functionality","Partnered with internal teams to deliver web experiences aligned with organizational needs"}', '{PHP,HTML,CSS,JavaScript,APIs}', 'Maintained web properties and integrated APIs to support content and functionality.', 'San Diego, CA', '2023-01-01', '2023-11-01', false, 2, '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00'),
	('f615119a-563a-44d5-945c-071fa5633bc8', '99de6939-48b8-472a-ad51-d4e534310f02', 'Box Out Marketing', 'Director of Product Development', '{"Led product development and engineering for marketing automation, membership, and WordPress-based web platforms","Managed $667K+ in WordPress-based membership and LMS projects","Oversaw API integrations and backend systems architecture across client implementations","Directed discovery, scoping, and implementation for web initiatives tied to business goals","Managed development team and product lifecycle from planning through delivery"}', '{WordPress,APIs,"Marketing Automation",LMS,"Backend Architecture"}', 'Led engineering and product delivery for WordPress-based marketing and membership platforms.', 'Carlsbad, CA', '2016-05-01', '2021-06-01', false, 3, '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00'),
	('20dfeaec-8836-4241-b1d2-b1a6c463aea6', '99de6939-48b8-472a-ad51-d4e534310f02', 'Next Level Security Systems', 'Manager of Product Support', '{"Led product support operations and technical training for customer deployments","Configured customer systems across hardware, software, and networks","Built and maintained the support portal and knowledge base"}', '{"Technical Support",Training,Hardware,Software,Networks}', 'Led product support operations and customer deployment readiness.', 'Carlsbad, CA', '2012-12-01', '2016-05-01', false, 4, '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00'),
	('935370d9-204e-4d1f-8dc9-440ec388b96f', '99de6939-48b8-472a-ad51-d4e534310f02', 'Walter Computer Services', 'Owner / Operator', '{"Delivered IT consulting, technical support, and web development services for local clients","Built websites using PHP, MySQL, WordPress, Joomla, and Drupal","Maintained servers, networks, and desktop systems across platforms"}', '{PHP,MySQL,WordPress,Joomla,Drupal,Servers,Networks}', 'Delivered consulting, support, and web development services for local clients.', 'Oceanside, CA', '1989-12-01', '2014-11-01', false, 5, '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00'),
	('a206a4d1-a29a-42b9-a0cf-50027eb1ed62', '99de6939-48b8-472a-ad51-d4e534310f02', 'Point Loma Nazarene University', 'Computer Dept. Sales & Support Manager', '{"Managed computer department sales and technical support operations","Repaired and configured desktops and laptops","Trained and supervised student employees"}', '{"Technical Support",Hardware,Training}', 'Managed sales and technical support operations in a university computer department.', 'San Diego, CA', '1998-02-01', '2006-05-01', false, 6, '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00');


--
-- Data for Name: candidate_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."candidate_profile" ("id", "full_name", "title", "summary", "strengths", "experience_bullets", "created_at", "updated_at") VALUES
	('99de6939-48b8-472a-ad51-d4e534310f02', 'Dan Walter', 'Website Manager / Senior Web Developer', 'Website Manager and Senior Web Developer with 15+ years of experience leading WordPress website operations, content-driven web projects, and e-commerce initiatives. Strong background in PHP, MySQL, JavaScript, WooCommerce, custom CMS functionality, API integrations, and cross-functional collaboration. Proven success improving site performance, responsiveness, accessibility, and SEO while supporting business goals.', '{"Website management and web operations","WordPress CMS administration","WooCommerce and e-commerce web experiences","Web analytics and performance monitoring","Project leadership and cross-functional collaboration",PHP,MySQL,JavaScript,React,"Custom themes, plugins, and API integrations",SEO,Accessibility,Responsiveness,Usability,Git,Pantheon,"Staged deployments"}', '{"Led WordPress website operations and content-driven web projects","Built and maintained custom themes, plugins, and API integrations","Improved site performance, responsiveness, accessibility, and SEO","Supported e-commerce and WooCommerce initiatives","Worked cross-functionally to deliver business-focused web solutions"}', '2026-03-26 03:31:59.294946+00', '2026-03-26 03:31:59.294946+00');


--
-- Data for Name: job_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."job_scores" ("id", "job_id", "score", "matched_skills", "missing_skills", "reasons", "created_at") VALUES
	('d2116c91-7971-494b-a253-96c18b23c767', '1e45c82c-fe94-447c-85b5-06c63a6dba4b', 92, '{"Website management and web operations","WordPress CMS administration","Content management for websites and landing pages","Web analytics and performance monitoring","Project leadership and cross-functional collaboration","WooCommerce and e-commerce web experiences",PHP,JavaScript,"Custom themes, plugins, and API integrations",SEO,"Performance optimization","Responsiveness and usability improvements",Git,Pantheon,"Staged deployments"}', '{"Direct evidence of specific web analytics tools (e.g., GA4)","Direct evidence of formal web design tools usage","Role is listed on-site in San Diego while candidate profile does not confirm on-site availability"}', '["15+ years in website management and senior web development aligns closely with Website Manager role", "Recent hands-on WordPress operations experience at Slate Digital is directly relevant", "Strong CMS background, especially WordPress, matches content management requirement", "Has e-commerce and WooCommerce experience relevant to online sales activities", "Demonstrated project leadership from Director of Product Development role", "Proven collaboration with cross-functional teams matches job expectations", "Strong SEO, performance, responsiveness, and accessibility background supports user experience goals", "Has API integration and custom functionality experience that strengthens website operations fit", "Missing explicit mention of named analytics platforms and specific design tools", "Location/job format has a possible mismatch because posting says on-site though header says remote"]', '2026-03-26 03:36:35.221062+00'),
	('ac6a90ef-e41d-4882-a4d0-0cace6f6c6d8', 'c955e188-885f-431b-9395-2b279ccc19f2', 79, '{WordPress,PHP,"High-traffic website development",React,JavaScript,WooCommerce,"REST/API integrations","Project ownership","Cross-functional collaboration","Performance optimization",SEO,Git,Pantheon,"Staged deployments"}', '{Next.js,TypeScript,"Headless CMS architecture","Explicit enterprise-scale React/Next.js delivery"}', '["15+ years of directly relevant web development and website management experience", "Strong WordPress and custom PHP background across multiple roles", "Recent experience building and maintaining high-traffic WordPress sites at Slate Digital", "Has React listed in skills, but work history does not show clear production Next.js experience", "Experience with WooCommerce and content-driven/e-commerce websites aligns well with role needs", "Led end-to-end web and product initiatives, supporting the ownership requirement", "Strong API integration background fits REST-driven and modern web platform work", "Missing explicit headless WordPress/CMS implementation experience", "TypeScript is mentioned in the job but not in the candidate profile"]', '2026-03-26 03:39:30.248962+00'),
	('1783a5ac-b318-46cc-b827-17f96e719b8e', '1e45c82c-fe94-447c-85b5-06c63a6dba4b', 90, '{"Website management and web operations","WordPress CMS administration","Web analytics and performance monitoring","Project leadership and cross-functional collaboration","WooCommerce and e-commerce web experiences",SEO,"Performance optimization","Responsiveness and usability improvements","Content-driven web projects","Web design implementation collaboration",PHP,JavaScript,"API integrations",Git,Pantheon,"Staged deployments"}', '{"Direct evidence of specific web analytics tools/platforms","Direct evidence of formal project management methodologies/tools","Direct evidence of hands-on web design tools","Role is listed on-site in San Diego while candidate profile does not address on-site availability"}', '["15+ years in website management and senior web development closely matches Website Manager scope", "Recent WordPress roles show direct hands-on ownership of website operations, content updates, performance, and SEO", "Strong CMS fit through extensive WordPress administration, custom themes, plugins, and content-driven web projects", "Good e-commerce alignment via WooCommerce and e-commerce initiative support", "Leadership background includes directing product development and cross-functional web initiatives tied to business goals", "Technical stack supports site optimization and functionality improvements through PHP, JavaScript, MySQL, and API integrations", "Has monitoring/performance experience, but the profile does not name specific analytics platforms or reporting tools", "Web design support is evident through collaboration and implementation, but not deep standalone design-tool ownership"]', '2026-03-26 12:35:40.590737+00'),
	('dae8c94e-5b03-4e2b-a0b8-4f8e0d961aeb', 'c955e188-885f-431b-9395-2b279ccc19f2', 82, '{WordPress,PHP,"High-traffic website development","Website operations",React,JavaScript,WooCommerce,"REST/API integrations","Project ownership","Cross-functional collaboration","Performance optimization",SEO,Git,Pantheon,"Staged deployments"}', '{Next.js,TypeScript,"Headless CMS architecture"}', '["15+ years of directly relevant WordPress/PHP experience across development and site operations", "Recent role at Slate Digital included high-traffic WordPress sites, custom plugins, and production operations", "Has React listed in strengths, but no clear work-history evidence of Next.js experience", "Strong overlap with e-commerce via WooCommerce and content publishing platforms", "Demonstrated end-to-end ownership through leadership roles and delivery from scoping to launch", "Solid API integration background aligns with modern web platform needs", "Lacks explicit headless WordPress/CMS implementation experience", "TypeScript is mentioned in the job stack but not in the candidate profile"]', '2026-03-26 12:35:44.837335+00'),
	('b9559c5d-50ae-45f1-ab64-d587860cfc27', '7e665783-a238-49f9-b506-1d68a39fb415', 85, '{"WordPress development and administration","SEO optimization",HTML/CSS,PHP,MySQL,JavaScript,"Posting and managing website content","Making coded WordPress adjustments","API integrations","Website support and maintenance","Cross-functional collaboration","Project leadership",Git,"Pantheon/staged deployments",E-commerce/WooCommerce}', '{Photoshop,FTP,"Microsoft Office (Word & Excel)","PPC support","Google Ads","Facebook/Instagram ad campaigns","Proofreading/grammar review explicitly stated","Direct evidence of handling 20+ clients per month","DNS setup/changes","SSL certificates"}', '["Strong direct experience with WordPress websites across multiple recent roles", "Solid SEO background, including site optimization and best practices", "Meets and exceeds the coding requirements with PHP, MySQL, JavaScript, HTML/CSS experience", "Has hands-on experience maintaining websites, landing pages, and content-driven web projects", "Demonstrated collaboration with cross-functional teams aligns with campaign coordination needs", "Leadership and web operations background suggest strong organization and workflow management", "Lacks explicit evidence for some agency-specific tools/processes like Photoshop, FTP, and Office", "Limited explicit evidence of PPC, paid social, and high-volume multi-client workload"]', '2026-03-26 12:35:50.423347+00'),
	('9df2d3ad-266d-4e48-b86d-3dc33297bd9e', 'c778f63b-ef5e-4e80-b7f1-1f545a02fbaa', 72, '{"WordPress development and administration",PHP,MySQL,JavaScript,HTML/CSS,"API integrations","WooCommerce and e-commerce experience","Git workflows","Staged deployments","Pantheon hosting",SEO,Accessibility,"Website operations and maintenance","Cross-functional collaboration","Custom themes and plugins","Production web troubleshooting","Analytics and performance monitoring"}', '{Laravel,Next.js,"Render/Heroku or similar PaaS platforms","DNS/email deliverability (SPF, DKIM, DMARC, bounce handling)","SharePoint Online","Power Apps","Monitoring/logging/alerting ownership","Payment gateways, refunds, chargebacks, fraud checks, reconciliation","Serverless tools like Netlify Functions or Cloudflare Workers","Meta Pixel and Conversions API","Explicit tier 3 support experience",SCSS/SASS,"Basic Node.js"}', '["Strong direct experience managing and developing WordPress production websites", "Solid match on PHP, MySQL, JavaScript, custom plugins, and API integrations", "Relevant e-commerce background through WooCommerce and WordPress-based membership platforms", "Good fit for collaboration, web operations, deployments, and business-focused delivery", "Has hosting/deployment experience with Pantheon and Git, but not the specific PaaS stack requested", "Major gap in Laravel and Next.js, which are central requirements", "Limited evidence for email infrastructure, SharePoint/Power Apps, and advanced e-commerce back-end/payment operations", "Security, accessibility, SEO, and performance background aligns well with the role''s operational needs"]', '2026-03-26 12:40:49.788248+00'),
	('b3ccdb10-3c92-4070-94ac-3e46cb27909a', '3d02326a-f871-4feb-baab-29831f467bca', 88, '{"WordPress website management","WordPress content-driven web projects","Custom themes and plugins",PHP,JavaScript,"API integrations",SEO,"Site performance optimization",Responsiveness,Accessibility,"WooCommerce / e-commerce experience",Git,Pantheon,"Staged deployments","Cross-functional collaboration","Project leadership","Building landing pages","Independent website operations"}', '{"Divi experience","Constant Contact experience","Explicit visual design / high-end aesthetic portfolio","Direct forms management experience called out in work history"}', '["15+ years of directly relevant WordPress and website operations experience", "Recent WordPress role managing high-traffic sites, plugins, hosting, deployments, SEO, and performance", "Strong overlap with maintenance, updates, new pages, landing pages, and integrations", "Has plugin, PHP, JavaScript, and API experience aligned to feature additions and troubleshooting", "Background in responsiveness, usability, and accessibility fits UX optimization needs", "Leadership and ownership experience match independent, proactive nature of the role", "No explicit evidence of Divi or Constant Contact, which are notable preferences", "Design/aesthetic strength is implied but not strongly proven through direct design-focused accomplishments"]', '2026-03-26 12:44:21.038905+00'),
	('b07dcca7-34a0-4e04-b7b7-c7172da154db', 'd573cc28-d19d-4766-9287-e29355a3a583', 84, '{"WordPress development","Custom theme/plugin development",PHP,JavaScript,HTML/CSS,"API integrations","SEO optimization","Website performance optimization","Responsive design","Landing pages","Website maintenance and operations",Git,Pantheon,"Cross-functional collaboration","Project leadership",WooCommerce/e-commerce}', '{"Strong proven UX/UI visual design portfolio","Explicit agency experience focused on law firms or medical practices","Explicit conversion rate optimization / lead-gen testing experience","Explicit website security management","Confirmed ability/willingness to work full-time on-site in Westlake Village"}', '["15+ years of directly relevant web and WordPress experience", "Recent WordPress role included high-traffic marketing sites and landing pages", "Strong match on PHP, JavaScript, WordPress architecture, plugins, and operations", "Has proven SEO, responsiveness, and performance optimization experience", "Background aligns with marketing-focused web delivery and cross-functional campaign work", "Leadership experience adds value for owning projects and working with stakeholders", "Less evidence of hands-on visual/UX design ownership versus development implementation", "Industry-specific client experience and on-site commute fit are not confirmed"]', '2026-03-26 13:44:34.877255+00'),
	('86e6034b-c531-4104-a539-85b6e4443386', 'fa21508e-4fb6-4f99-bc32-da80f9b73efe', 87, '{"WordPress development",HTML,CSS,JavaScript,PHP,"Responsive website development","Custom themes/plugins","API integrations","Git workflows",SEO,"Website performance optimization","Cross-functional collaboration","Multiple CMS platforms","WordPress site maintenance/operations"}', '{"SCSS/SASS with Mixins and Extends","Advanced Custom Fields (ACF)","Explicit front-end portfolio/pixel-perfect UI examples","Browser/device testing and debugging called out","Relocation/hybrid Downers Grove requirement"}', '["15+ years in web development with strong recent WordPress-focused work history", "Direct experience building and maintaining WordPress sites with PHP, JavaScript, HTML, and CSS", "Recent role at Slate Digital closely matches core duties: high-traffic WordPress sites, Git, Pantheon, staged deployments, SEO, performance", "Has custom plugin development experience, which aligns well with WordPress ecosystem requirements", "Worked cross-functionally with creative/media teams, similar to collaborating with designers, copywriters, and project managers", "Experience across WordPress, Joomla, and Drupal matches the multiple CMS plus", "Technical SEO, responsiveness, accessibility, and usability are strong relevant strengths", "SCSS/SASS and ACF are not mentioned, and those are notable preferred skills", "Strong fit on technical background, but location/relocation requirement is unconfirmed and could be a practical gap"]', '2026-03-26 13:57:00.570154+00'),
	('6ece88d5-2523-4c6d-a9cf-62e5407d6995', '33a73cd1-6aa7-49cb-ad30-188631719391', 85, '{"WordPress development","WooCommerce and e-commerce",PHP,JavaScript,"CSS/responsive web development","Custom themes and plugins","API integrations","SEO best practices","Accessibility/WCAG awareness","Performance optimization","Cross-functional collaboration","Client/business-focused communication",Git,Pantheon,"Staged deployments"}', '{"Advanced Custom Fields (ACF) explicitly mentioned","Page builders such as Elementor, Beaver Builder, or WPBakery","Design software such as Figma, Adobe, or Affinity","Direct evidence of WooCommerce product page/checkout styling","HIPAA-compliant forms or regulated medical industry experience","cPanel and DNS settings explicitly mentioned","GEO/social strategy integration explicitly mentioned"}', '["15+ years in web development with strong recent WordPress-focused roles", "Direct recent experience building and maintaining high-traffic WordPress sites", "Strong overlap with WooCommerce, PHP, JavaScript, SEO, accessibility, and performance needs", "Has led WordPress-based product delivery and custom development work", "Evidence of collaboration with creative/media/internal teams aligns with cross-functional environment", "Experience supporting business goals and explaining technical work is implied by leadership and cross-functional roles", "Missing several tool-specific requirements like ACF, page builders, and design software", "No direct evidence of medical/ophthalmology or HIPAA-regulated web work"]', '2026-03-26 14:08:16.029518+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict xeL89uKVmlfyY9qQ739yCosuhWTyC11eWaDfo6AS4mIZYemN3B42DV3eQ4YmAqp

RESET ALL;
