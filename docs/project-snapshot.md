# Project Snapshot — Job Application Cockpit

## Purpose

Job Application Cockpit is a pipeline-driven system for managing a job search with a focus on:

- prioritization
- execution speed
- consistent follow-through

The system is designed to reduce friction between identifying opportunities and taking action.

---

## Core Principle

This is not a CRUD app.

It is a **decision engine + execution system** that answers:

> “What should I do next?”

---

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase (typed)
- OpenAI Responses API
- Playwright (PDF generation)
- markdown-it + sanitize-html
- Zod

---

## Core Data Model

- `jobs` — raw job opportunities
- `job_scores` — structured AI evaluation
- `applications` — user execution state + timing
- `application_assets` — generated materials (resume, cover letter, follow-ups)
- `automation_jobs` — orchestration layer

---

## System Architecture

The system is built from connected pipelines:

### 1. Scoring Pipeline
- evaluates job fit using AI
- stores structured results in `job_scores`
- updates job status

---

### 2. Asset Pipeline
- generates resume and cover letter
- stores assets in `application_assets`

---

### 3. Application Pipeline
- tracks application lifecycle
- sets `applied_at`
- schedules follow-ups

---

### 4. Follow-Up System (Critical)

Follow-ups are **state-derived**, not status-based.

Fields:
- `follow_up_1_due`
- `follow_up_2_due`
- `follow_up_1_sent_at`
- `follow_up_2_sent_at`

Content:
- stored in `application_assets`

Rules:
- no additional statuses for follow-ups
- UI derives active follow-up dynamically
- follow-up completion sets `sent_at` timestamps only

---

### 5. Apply Queue (Decision Engine)

Combines:
- job score
- asset readiness
- application status
- follow-up urgency

Outputs:
👉 prioritized actionable queue

This is the primary working surface of the app.

---

### 6. Automation Pipeline

Job types:
- `score_job`
- `generate_assets`
- `schedule_followups`
- `generate_followup_assets`

Worker:
- processes queued jobs
- chains dependent work
- retries failures
- idempotent by design

Execution:
- currently triggered manually via API
- safe to run repeatedly

---

## Current Capabilities

- End-to-end pipeline from job → apply → follow-up
- AI-generated resume and cover letter
- AI-generated follow-up emails
- Follow-up scheduling and completion workflow
- Action-oriented apply UI (priority + execution)
- Manual automation trigger (local + hosted)
- Local and hosted environments fully synced

---

## Current Gaps

- No continuous automation (cron not enabled)
- Limited visibility into prioritization logic
- No outcome tracking (responses, interviews)
- Home/dashboard page is underdeveloped
- Candidate profile is minimal

---

## Current Focus (Hardening + Polish)

The system is functional. Focus is now on:

- reducing friction
- improving clarity
- making execution faster and more intuitive

---

## Active To-Dos

### UI / Navigation
- Add header navigation on all pages
- Improve layout consistency and spacing
- Polish apply-mode visual hierarchy

---

### Follow-Up Operations
- Add action button to invoke follow-up worker when follow-ups are due
- Improve visibility of follow-up state and urgency in UI

---

### Home / Dashboard
- Convert home page into a dashboard
- Add reporting-style widgets
- Add “today’s punch list”
- Surface high-priority actions clearly

---

### Candidate Profile
- Add and support:
  - email
  - phone
  - location
- Improve usefulness for downstream generation

---

### Onboarding / Import
- Allow resume upload
- Parse resume content
- Seed candidate profile automatically

---

## Design Rules (Non-Negotiable)

### 1. State is the Source of Truth
- Do not derive state from UI
- Persist all meaningful transitions

---

### 2. Follow-Ups Are Derived
- Never introduce follow-up statuses
- Always compute from due + sent timestamps

---

### 3. Automation Must Be Idempotent
- Jobs must be safe to run repeatedly

---

### 4. Pipelines Over Components
- Think in flows, not pages
- UI reflects system state—it does not define it

---

## Practical Rule

If a change does not:
- increase execution speed
- improve prioritization
- or reduce friction

…it is not a priority.