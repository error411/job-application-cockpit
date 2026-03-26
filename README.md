# Job Application Cockpit

Job Application Cockpit is a Next.js app for running a structured job-search pipeline: capture job postings, score fit with AI, generate tailored application assets, track applications, and manage follow-ups from a prioritized queue.

## What it does

- Capture job opportunities for review
- Score job fit against a candidate profile and experience
- Generate tailored resume and cover letter assets
- Export application assets as PDFs
- Track application status and follow-up timing
- Surface a prioritized apply queue
- Queue automation work for scoring, asset generation, and follow-up workflows

## Core workflow

1. Add a job opportunity
2. Score the job against the candidate profile
3. Automatically generate assets for strong-fit opportunities
4. Review the apply queue
5. Download resume and cover letter PDFs
6. Apply externally on the target job site
7. Mark the application as applied
8. Use the dashboard to manage follow-ups

## Current product status

### Implemented
- Manual job intake
- Structured AI job scoring
- Automated asset generation pipeline
- Resume and cover letter HTML/PDF export
- Application tracking and status updates
- Apply dashboard / queue
- Automation queue and worker foundation

### Partial
- Always-on automation
- Follow-up scheduling automation
- AI-generated follow-up assets
- Queue prioritization transparency

### Not yet implemented
- Reporting and conversion analytics
- Full feedback loop to optimize outcomes over time

## Tech stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- OpenAI Responses API
- Playwright
- markdown-it
- sanitize-html
- Zod

## Status model

### Job statuses
- `captured`
- `scored`
- `assets_generated`
- `ready_to_apply`
- `archived`

### Application statuses
- `ready`
- `applied`
- `follow_up_due`
- `interviewing`
- `rejected`
- `closed`

## Architecture overview

The app is organized around five connected pipelines:

### 1. Jobs pipeline
A job is captured, scored, and advanced toward readiness for application.

### 2. Application pipeline
An application record tracks execution state, timestamps, and follow-up timing.

### 3. Asset pipeline
Candidate profile data, experience, and job context are used to generate tailored application materials.

### 4. Apply queue
The system aggregates score, readiness, application state, and urgency into a prioritized work queue.

### 5. Automation pipeline
Automation jobs are queued, deduplicated, processed, and retried when appropriate.

## Local development

### Prerequisites
- Node.js 20+
- npm
- A Supabase project
- OpenAI API access

### Install
```bash
npm install
```

### Configure environment variables

Create a `.env.local` file with your project values.

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

Add any other environment variables required by your current implementation before running locally.

### Run the app
```bash
npm run dev
```

Open `http://localhost:3000`.

## Database and schema

Supabase migrations live in:

```bash
supabase/migrations/
```

Apply your schema changes before testing features that depend on new tables or columns.

## Automation

The system includes an automation queue for background work such as:

- `score_job`
- `generate_assets`
- `schedule_followups`
- `generate_followup_assets`

A worker route currently exists for processing queued jobs. In its current form, automation infrastructure is real, but continuous scheduling still needs to be fully wired for production.

## PDF generation

Resume and cover letter PDFs are rendered from HTML using Playwright. For production, make sure your deployment target supports the browser runtime requirements needed for Playwright-based rendering.

## Deployment notes for Vercel

If you deploy this app to Vercel:

### 1. Add environment variables
Set all required values in the Vercel project settings, including Supabase and OpenAI keys.

### 2. Confirm Playwright compatibility
If PDF generation runs inside a serverless function, verify the runtime has everything required for Playwright to launch reliably. If not, move PDF generation to a compatible runtime or alternate rendering strategy.

### 3. Add scheduled automation
Wire your automation worker to Vercel Cron or another scheduler so queued jobs are processed automatically.

### 4. Protect secrets
Do not commit dump files, secrets, or environment files to the repo.

### 5. Validate server routes
Test these areas after deploy:
- application status updates
- automation run route
- asset generation
- PDF generation
- authenticated Supabase flows

## Documentation

Primary architecture notes live in:

- `docs/project-snapshot.md`

Recommended supporting docs:

- `docs/automation.md`
- `docs/data-model.md`
- `docs/roadmap.md`

## Source-of-truth rule

Use the repo implementation as the operational source of truth.
Use `docs/project-snapshot.md` as the architecture model.
If code and docs diverge, update the docs unless the code is mid-refactor and the intended architecture is explicitly documented.

## Security note

Before each deployment:
- verify environment variables are set correctly
- remove any sensitive exports or dump files
- rotate credentials if anything sensitive was ever committed

## Roadmap direction

Near-term priorities:

1. Make automation always-on
2. Complete follow-up scheduling and asset generation
3. Strengthen apply-queue prioritization
4. Add reporting and funnel metrics

## License

No license has been added yet. If this will remain public, add an explicit license file.
