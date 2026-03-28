# Job Application Cockpit — Project Snapshot

## Overview

This is a **pipeline-driven execution engine**, not a CRUD app.

The system answers one core question:

👉 *“What should I do next?”*

It transforms job search into a structured system:
- evaluate opportunities
- generate assets
- track execution
- surface next actions

---

## Core Principles

- Pipelines over forms
- Derived state over manual state
- Execution > tracking
- Minimal user input, maximum system leverage
- Single source of truth per domain

---

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase (typed)
- OpenAI Responses API
- Playwright (PDF generation)
- Vercel deployment

---

## Core Data Model

### Tables

- `jobs` — source opportunities
- `job_scores` — AI evaluation results
- `applications` — execution state + timing
- `application_assets` — generated materials
- `automation_jobs` — queued background work
- `candidate_profile` — canonical user data

---

## Pipelines

### 1. Job Scoring
AI evaluates job fit → stored in `job_scores`

---

### 2. Asset Generation
Generates:
- resume
- cover letter
- follow-ups

Driven by:
👉 `candidate_profile` (single source of truth)

---

### 3. Application Execution
Tracks:
- `status`
- `applied_at`
- `notes`

Triggers follow-up scheduling on apply.

---

### 4. Follow-Up System (Derived)

Follow-ups are **not statuses**

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

### 5. Apply Queue (Decision Engine)

Combines:
- job score
- readiness
- application state
- follow-up urgency

Outputs:
👉 prioritized execution list

---

### 6. Automation System

Job types:
- `score_job`
- `generate_assets`
- `schedule_followups`
- `generate_followup_assets`

Characteristics:
- idempotent
- manually triggered
- no cron dependency

---

## UI System

### Navigation Model

- Header = execution flows only
- Dashboard = command center
- Profile = configuration (not in primary nav)
- Add Job = primary CTA (not navigation)

---

### Dashboard

- system overview
- punch list (top actions)
- pipeline snapshot
- recent activity
- profile entry point

---

### Today Page

Core execution surface:

👉 ranked list of actions

- follow-ups due/overdue
- ready applications
- follow-up timing windows

---

### Apply System

- prioritized queue
- decision-driven execution
- no manual sorting

---

## Rendering System

### Resume / Cover Letter

- HTML = source of truth
- PDF generated from HTML (no drift)
- driven by `candidate_profile`

---

For reporting, I also want to support interview progression.

Behavior:
- user manually records application updates
- if user sets application status to `interviewing`, they can enter interview date and note
- this should update `applications.status` to `interviewing`
- and create an interview-round record
- if the employer later schedules another interview, the user manually adds another round
- if the employer rejects or hires, the user manually records that too

Important:
- keep this user-driven
- no automatic hiring workflow inference
- no interview_1 / interview_2 columns on applications
- use a repeatable interview event model
- keep implementation minimal and reporting-friendly

## Constraints (Strict)

- ❌ No follow-up statuses
- ❌ No cron dependency (manual trigger system)
- ❌ No redundant state
- ✅ Derived state only
- ✅ Minimal abstractions
- ✅ Type-safe system

---

## Current State

✅ End-to-end pipeline working  
✅ Decision engine active  
✅ UI aligned with system model  
✅ Automation functional (manual trigger)  
🚀 Entering leverage phase

---

## Active To-Dos

### High Leverage

- Resume import → auto-populate `candidate_profile`

---

### System Expansion

- Multi-profile support (`is_active`)
- Profile switching UI
- Context awareness across pipelines

---

## Near-Term Direction

### 1. Resume Import

Goal:
👉 eliminate manual setup

Flow:
- upload/paste resume
- AI extraction
- populate profile
- regenerate assets

---

### 2. System Leverage

- auto-refresh assets
- improve scoring
- reduce friction to near-zero

---

## Status

✅ Stable  
✅ Cohesive system  
🚀 Moving toward automation + leverage