# Project Snapshot — Job Application Cockpit

## Purpose
Job Application Cockpit is a Next.js application for managing a job-search pipeline: capturing jobs, scoring fit with AI, generating tailored application assets, tracking applications and follow-ups, and surfacing a prioritized apply queue. The codebase uses Next.js 16.1.7, React 19, Supabase, the OpenAI SDK, Tailwind 4, Playwright, markdown-it, and sanitize-html.

## Stack
- App framework: Next.js App Router
- UI: React 19
- Styling: Tailwind CSS 4
- Backend/data: Supabase
- AI: OpenAI Responses API
- PDF/export: Playwright
- Content rendering: markdown-it + sanitize-html
- Validation/utilities: Zod

## Repo Structure
- `src/` — application code
- `src/app/` — routes, pages, and API handlers
- `src/lib/` — domain logic and shared utilities
- `supabase/` — migrations and database evolution
- `public/` — static assets
- `docs/` — architecture and project documentation

## High-Level Architecture
The system is built around five connected pipelines:

1. **Jobs pipeline**
   - A job is captured in the database.
   - The job is scored against the candidate profile and experience.
   - If the score is strong enough, asset generation can be queued.
   - The job progresses through job statuses such as `captured`, `scored`, `assets_generated`, and `ready_to_apply`.

2. **Application pipeline**
   - An application record is created or updated for a job.
   - When the status becomes `applied`, the system records `applied_at`.
   - Follow-up dates are scheduled for later outreach.
   - Active applications feed the apply queue.

3. **Asset pipeline**
   - Candidate profile, experience, and job data are sent to the model.
   - The model returns tailored resume and cover-letter content.
   - Assets are stored, rendered to HTML, and exported as PDFs.

4. **Apply-mode pipeline**
   - The system aggregates jobs, applications, scores, asset readiness, and follow-up urgency.
   - A prioritized queue is returned to the UI so the user can work highest-value items first.

5. **Automation pipeline**
   - Work is queued in `automation_jobs`.
   - The worker processes due jobs, marks progress, retries failures, and chains follow-up work.

## Package/Runtime Notes
The project is private and currently exposes the usual Next scripts: `dev`, `build`, `start`, and `lint`. Key dependencies include `next@16.1.7`, `react@19.2.3`, `@supabase/supabase-js`, `openai`, `markdown-it`, `sanitize-html`, `zod`, and `playwright`.

## Status Model

### Job statuses
Defined job statuses:
- `captured`
- `scored`
- `assets_generated`
- `ready_to_apply`
- `archived`

### Application statuses
Defined application statuses:
- `ready`
- `applied`
- `follow_up_due`
- `interviewing`
- `rejected`
- `closed`

### Active application statuses
The app currently treats these as active:
- `ready`
- `applied`
- `follow_up_due`
- `interviewing`

## Core Domain Areas

### 1. Job scoring
The scoring service:
- loads the target job from `jobs`
- loads the primary candidate profile from `candidate_profile`
- loads structured experience from `candidate_experience`
- sends that context to the OpenAI Responses API using model `gpt-5.4`
- expects a JSON schema result containing:
  - `score`
  - `matched_skills`
  - `missing_skills`
  - `reasons`
- stores the result in `job_scores`
- updates the job status to `scored`

This means job fit is not a vague summary step; it is a structured decision point that feeds later automation.

### 2. Asset generation
The asset-generation service uses job data plus candidate profile/experience to generate tailored application materials. The system is designed to create:
- resume content
- cover letter content
- recruiter note content

Generated assets are stored in `application_assets`, and the job can progress to a ready-to-apply state.

### 3. Application creation/update
The applications API accepts values such as `jobId`, `status`, and `notes`. It validates status values against the application status model. When a record is marked `applied`, the route also sets application timing fields and follow-up dates, which makes this route the operational handoff from “ready” to “real application in progress.”

### 4. Apply-mode queue
Apply mode is not just a list of applications. It is intended to be an operational queue that combines:
- active application statuses
- most recent scoring context
- asset readiness
- urgency such as overdue follow-ups

This is one of the highest-leverage areas in the app because it decides what the user should do next.

## Automation System

### Overview
Automation is backed by an `automation_jobs` table introduced through a Supabase migration. The migration defines job types including:
- `score_job`
- `generate_assets`
- `schedule_followups`
- `generate_followup_assets`

It also defines job statuses including:
- `pending`
- `processing`
- `completed`
- `failed`
- `cancelled`

A uniqueness rule prevents duplicate pending/processing work for the same combination of `job_type`, `entity_type`, and `entity_id`.

### Queue behavior
The queue layer:
- inserts jobs into `automation_jobs`
- deduplicates active work
- supports delayed execution through `scheduled_for`
- fetches due jobs in scheduled order
- marks jobs as processing
- marks jobs as completed
- retries failed jobs with increasing delay up to max attempts

### Worker behavior
The worker currently processes due jobs and handles these flows:
- `score_job`
  - runs the scoring service
  - if the resulting score is at least `75`, queues `generate_assets`
- `generate_assets`
  - runs the asset-generation service
- `schedule_followups`
  - currently stubbed
- `generate_followup_assets`
  - currently stubbed

This means the automation system is real and active, but not yet fully built out end-to-end for follow-up workflows.

### Trigger surface
A dedicated API route exists at `src/app/api/automation/run/route.ts` to run the worker, with support for an optional limit.

## Source-of-Truth Files

### High-leverage files
- `src/lib/statuses.ts`
- `src/lib/services/score-job.ts`
- `src/lib/services/generate-assets.ts`
- `src/lib/automation/queue.ts`
- `src/lib/automation/worker.ts`
- `src/app/api/applications/route.ts`

### Important folders
- `src/app/api/`
- `src/lib/automation/`
- `src/lib/services/`
- `supabase/migrations/`

## Current Rules and Behavior Encoded in Code
- Job scoring is structured and stored, not just displayed.
- Asset generation is tied to job/candidate context.
- Automation deduplicates pending/processing jobs for the same entity.
- A score threshold of `75` currently gates automatic asset generation after scoring.
- Application statuses are strictly validated against shared constants.

## Known Gaps / Things Not Fully Encoded Yet
These are the biggest places where chat history may still matter:
- why certain prompts were chosen
- any UI workflow conventions not encoded in code
- intended behavior for `schedule_followups`
- intended behavior for `generate_followup_assets`
- any future business rules around recruiter notes, application ranking, or agent behavior

## Recommended Documentation Strategy
Keep this file short enough to stay current. Then add adjacent files if needed:
- `docs/project-snapshot.md` — high-level architecture and flows
- `docs/automation.md` — queue/job types/worker behavior
- `docs/data-model.md` — table-level notes and status meanings
- `docs/roadmap.md` — next planned features and unfinished systems

## Practical Rule for Future Chats
Use the repo as the primary source of truth.
Use this snapshot as the architectural summary.
Use chat history only for intent or decisions that are not yet reflected in code.



## Product Workflow Coverage (Reality vs Target)

### 1. Job Input
Status: Complete  
Users manually input job data which feeds the pipeline.

### 2. AI Scrubbing / Background Agent
Status: Partial  
Automation exists but is not yet scheduled or continuously running.

### 3. AI Application + Asset Generation
Status: Mostly Complete  
Jobs are scored and high-scoring jobs trigger asset generation automatically.

### 4. Apply Dashboard
Status: Complete  
Apply-mode queue prioritizes work based on score, urgency, and readiness.

### 5. Asset Download
Status: Complete  
Resume and cover letter PDFs are generated and downloadable.

### 6. Manual Application
Status: Complete (intentional)  
User applies externally using generated assets.

### 7. Application Tracking
Status: Complete  
Applications can be updated and tracked with statuses and timestamps.

### 8. Follow-up Scheduling
Status: Partial  
Basic scheduling exists, but automation jobs are not fully implemented.

### 9. Follow-up Assistance (AI-generated)
Status: Partial  
Follow-ups are surfaced, but AI-generated follow-up content is not implemented.

### 10. Reporting / Analytics
Status: Not Implemented  
No tracking of application success rates or funnel metrics yet.


---

# Architecture Model (Operational)

## Core Principle

The system is not a CRUD app.  
It is a **pipeline-driven decision engine** designed to:

1. Identify high-value job opportunities
2. Generate tailored application assets
3. Guide the user through execution (apply + follow-up)
4. Continuously improve outcomes through feedback

Every feature must support **throughput (more applications)** or **quality (better outcomes)**.

---

## System Model

The system operates as a set of **state-driven pipelines connected by automation jobs**.

### Entities

- `jobs` — raw opportunity data
- `job_scores` — structured AI evaluation of fit
- `applications` — user execution state
- `application_assets` — generated materials (resume, cover letter, etc.)
- `automation_jobs` — orchestration layer

---

## State Machines

### Job State Machine


**Rules:**
- `scored` requires a persisted `job_scores` record
- `assets_generated` requires at least one asset bundle
- `ready_to_apply` requires assets + passing score threshold

---

### Application State Machine



**Rules:**
- `applied` sets `applied_at`
- `applied` triggers follow-up scheduling
- `follow_up_due` is time-based, not manual-only

---

## Pipeline Contracts

Each pipeline has a **clear contract** and must be independently reliable.

---

### 1. Scoring Pipeline

**Input:**
- job
- candidate_profile
- candidate_experience

**Output:**
- `job_scores` record
- job status → `scored`

**Contract:**
- Must return structured JSON (not free text)
- Must be deterministic enough to compare scores across jobs

---

### 2. Asset Generation Pipeline

**Input:**
- job
- candidate_profile
- candidate_experience
- job_score

**Output:**
- `application_assets` records
- job status → `assets_generated`

**Contract:**
- Assets must be usable without editing
- Content must be specific to job context (no generic output)

---

### 3. Application Pipeline

**Input:**
- job_id
- status updates

**Output:**
- application record
- follow-up dates

**Contract:**
- `applied` is the key transition event
- must be idempotent (safe to retry)

---

### 4. Apply Queue (Decision Engine)

**Input:**
- jobs
- applications
- scores
- assets
- follow-up timing

**Output:**
- prioritized list of actionable items

**Contract:**
- Must always answer: **“What should the user do next?”**
- Must bias toward:
  - high score
  - ready assets
  - overdue follow-ups

---

### 5. Automation Pipeline

**Input:**
- `automation_jobs`

**Output:**
- executed work
- chained jobs

**Contract:**
- No duplicate active jobs for same entity/action
- Must support retries and delayed execution
- Must be safe to run repeatedly

---

## Automation Model

### Job Types

- `score_job`
- `generate_assets`
- `schedule_followups`
- `generate_followup_assets`

---

### Execution Flow


---

### Current Reality

- `score_job` ✅ implemented
- `generate_assets` ✅ implemented
- `schedule_followups` ⚠️ stubbed
- `generate_followup_assets` ⚠️ stubbed

---

## System Gaps (Critical Path)

These are not “nice to have”—they are **blocking full system behavior**:

### 1. Continuous Automation
- No cron/scheduler running worker automatically
- System is not yet autonomous

---

### 2. Follow-up System
- No real scheduling logic
- No generated follow-up content
- No escalation rules

---

### 3. Decision Engine Maturity
- Apply queue lacks explicit scoring/prioritization formula
- No visibility into *why* something is prioritized

---

### 4. Feedback Loop (Analytics)
- No tracking of:
  - applications sent
  - interviews received
  - conversion rates

---

## Design Rules (Non-Negotiable)

### 1. State is the Source of Truth
- Never infer state from UI
- Always persist transitions explicitly

---

### 2. Automation Must Be Idempotent
- Jobs can run multiple times without breaking data

---

### 3. No Hidden Logic
- All business rules must live in:
  - services
  - automation worker
  - shared constants

---

### 4. Pipelines Over Components
- Think in flows, not pages
- UI reflects system state—it does not define it

---

## Near-Term Build Priorities

### Priority 1 — Make the System “Always On”
- Add cron trigger for `/api/automation/run`
- Ensure safe repeated execution

---

### Priority 2 — Complete Follow-up System
- Implement `schedule_followups`
- Implement `generate_followup_assets`
- Surface follow-ups clearly in apply queue

---

### Priority 3 — Strengthen Apply Decision Engine
- Introduce explicit prioritization scoring
- Combine:
  - job score
  - time urgency
  - application state

---

### Priority 4 — Add Feedback Loop
- Track outcomes (interview, rejection, etc.)
- Build basic reporting matrix

---

## Practical Interpretation

If a feature does not:
- increase application volume
- improve application quality
- or improve follow-up consistency

…it is not a priority.

---

## Repository Reference Baseline

Primary implementation reference:
- GitHub repo: `error411/job-application-cockpit`

Interpretation rule:
- The repo implementation is the operational source of truth for routes, services, automation behavior, and schema usage.
- `docs/project-snapshot.md` is the architectural model and should describe the system as it actually exists in the repo, not as originally imagined.
- If snapshot and implementation disagree, update the snapshot unless the repo is mid-refactor and the intended architecture is explicitly documented.

### Repo-grounded documentation rule
When updating this file, verify against:
- `src/app/` for route and page structure
- `src/app/api/` for system behavior and trigger surfaces
- `src/lib/services/` for business logic
- `src/lib/automation/` for orchestration behavior
- `supabase/` for schema and migrations

### Operational warning
Do not treat placeholder docs, default README content, or planned features as implemented behavior.
Only document behavior that is:
1. present in code,
2. reachable through current routes/services, or
3. explicitly stubbed with identified gaps.