# Job Application Cockpit

Job Application Cockpit is a **pipeline-driven execution engine for job search**.

It evaluates opportunities, generates application assets, tracks execution, and continuously answers:

👉 **“What should I do next?”**

---

## What it does

- Capture job opportunities
- Score job fit using AI
- Generate tailored resume and cover letter assets
- Export application materials as PDFs
- Track application execution state
- Derive follow-up actions from timestamps (not statuses)
- Surface a prioritized execution queue
- Run automation jobs for scoring, assets, and follow-ups

---

## Core workflow

1. Add a job opportunity
2. Score the job against your candidate profile
3. Generate tailored assets for strong-fit roles
4. Review the prioritized execution queue
5. Download resume and cover letter PDFs
6. Apply externally
7. Mark the application as applied
8. Use the system to manage follow-ups and next actions

---

## Core concept

This is **not a CRUD tracker**.

The system is built around a single idea:

👉 **Derived decisions over manual tracking**

Instead of managing state manually, the system derives:

- follow-ups
- priorities
- next actions

from timestamps, scores, and pipeline state.

---

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (typed)
- OpenAI Responses API
- Playwright (PDF generation)
- markdown-it
- sanitize-html
- Zod

---

## Architecture overview

The system is composed of connected pipelines:

### 1. Jobs pipeline
Capture → score → prepare for execution

### 2. Application pipeline
Tracks execution state and timestamps

### 3. Asset pipeline
Generates resume, cover letter, and follow-ups using `candidate_profile`

### 4. Apply queue (decision engine)
Aggregates:
- job score
- readiness
- application state
- follow-up urgency

Outputs:
👉 prioritized execution list

### 5. Automation pipeline
Queues and processes background jobs:
- `score_job`
- `generate_assets`
- `schedule_followups`
- `generate_followup_assets`

---

## Follow-up model (important)

Follow-ups are **not statuses**.

They are derived from timestamps:

- `follow_up_1_due`
- `follow_up_2_due`
- `follow_up_1_sent_at`
- `follow_up_2_sent_at`

Rules:
- no follow-up statuses
- UI determines current state
- completion = set `sent_at`

---

## UI model

### Navigation

- Header = execution flows only
- Dashboard = command center
- Profile = configuration (not in main nav)
- Add Job = primary CTA

---

### Dashboard

- system overview
- punch list (top actions)
- pipeline snapshot
- recent jobs
- profile entry point

---

### Today page

Core execution surface:

👉 ranked list of actions

- due and overdue follow-ups
- ready applications
- follow-up timing windows

---

## Current product status

### Implemented

- End-to-end pipeline:
  job → score → generate assets → apply → follow-up

- AI job scoring
- Asset generation (resume + cover letter)
- HTML → PDF rendering (Playwright)
- Application tracking
- Derived follow-up system
- Prioritized execution queue
- Manual automation worker

---

### System characteristics

- Automation is manually triggered (intentional control model)
- All pipelines are idempotent
- No cron dependency
- Minimal abstraction layers

---

### Not yet implemented

- Resume import → auto-populate candidate profile
- Multi-profile support
- Decision transparency (why an item is prioritized)
- Reporting and outcome analytics

---

## Local development

### Prerequisites

- Node.js 20+
- npm
- Supabase project
- OpenAI API access

---

### Install

```bash
npm install