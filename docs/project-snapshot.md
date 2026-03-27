# Job Application Cockpit — Project Snapshot

## Overview

This is a **pipeline-driven job application system**, not a CRUD app.

The system answers one core question:

👉 *“What should I do next?”*

It orchestrates job discovery, scoring, asset generation, application tracking, and follow-ups into a single decision engine.

---

## Tech Stack

* Next.js 16 (App Router)
* React 19
* Tailwind CSS 4
* Supabase (typed)
* OpenAI Responses API
* Playwright (PDF generation)
* Deployed on Vercel

---

## Core Data Model

### Tables

* `jobs` — source opportunities
* `job_scores` — AI scoring results
* `applications` — application state + follow-up timing
* `application_assets` — resume, cover letter, follow-ups
* `automation_jobs` — background job queue
* `candidate_profile` — single source of truth for candidate data

---

## Pipelines

### 1. Job Scoring

* AI evaluates job fit
* Results stored in `job_scores`
* Structured + repeatable

---

### 2. Asset Generation

* Generates:

  * Resume
  * Cover Letter
  * Follow-up messages
* Stored in `application_assets`
* Now fully driven by `candidate_profile`

---

### 3. Application Tracking

* Tracks:

  * status
  * applied_at
  * notes
* Schedules follow-ups on apply

---

### 4. Follow-Up System (Derived)

Follow-ups are **NOT status-based**

They are derived from timestamps:

* `follow_up_1_due`
* `follow_up_2_due`
* `follow_up_1_sent_at`
* `follow_up_2_sent_at`

Rules:

* No follow-up statuses
* UI determines current stage
* Marking complete sets `sent_at`

---

### 5. Apply Queue (Decision Engine)

Combines:

* job score
* asset readiness
* application status
* follow-up urgency

Outputs:

👉 prioritized execution list

---

### 6. Automation System

Job types:

* `score_job`
* `generate_assets`
* `schedule_followups`
* `generate_followup_assets`

Characteristics:

* idempotent
* manually triggered (no cron)
* processed via API worker

---

## Current State

### Fully Working

* End-to-end pipeline:
  job → score → generate assets → apply → follow-up

* Follow-up system:

  * scheduling
  * generation
  * UI preview + mark sent

* Apply mode:

  * prioritized queue
  * decision-driven execution

* Automation:

  * manual worker trigger
  * secure API route

* Local ↔ hosted Supabase:

  * schema synced
  * data synced

---

## UI / UX

### Global Navigation

* Persistent header navigation across all pages
* Dashboard added as primary entry point

---

### Dashboard (Home)

* Summary metrics:

  * due follow-ups
  * ready applications
  * pipeline counts

* “Today’s Punch List”

* Recent jobs

* Pipeline snapshot

---

### Follow-Ups Page

* Derived “Due Now” and “Upcoming”
* Action button:
  👉 run follow-up worker when items are due

---

### Candidate Profile

* Stores:

  * full_name
  * email
  * phone
  * location
  * title
  * summary
  * strengths
  * experience

* Now drives:

  * resume generation
  * cover letter generation

---

## Rendering System (Stabilized)

### Resume

* Injected header from `candidate_profile`
* Removes duplicate name/contact from markdown
* HTML = source of truth
* PDF generated from HTML (no drift)

---

### Cover Letter

* Uses unified `location` field (no city/state split)
* Header + signoff driven by profile
* HTML = source of truth
* PDF generated from HTML

---

## Constraints (Strict)

* No follow-up statuses
* Follow-ups derived from timestamps only
* No cron jobs
* Minimal abstractions
* Maintain type safety
* Avoid overengineering

---

## Active To-Dos

### Pipeline / UX

* Resume import + parsing → seed candidate profile

---

### Candidate Profiles (multi-profile support)

* Add `is_active` flag to `candidate_profile`
* Ensure only one active profile at a time
* Update all profile fetches to use active profile
* Add UI to view and switch profiles
* Display active profile context in UI

---

## Near-Term Direction

### 1. Resume Import (Next Step)

Goal:

👉 eliminate manual profile setup

Flow:

* paste/upload resume
* extract structured data via AI
* populate `candidate_profile`
* regenerate assets

---

### 2. System Leverage

After import:

* auto-refresh assets
* improve scoring accuracy
* reduce friction to near-zero

---

## Design Philosophy

* Pipelines over forms
* Derived state over manual state
* Single source of truth per domain
* HTML as rendering source for PDFs
* Minimal surface area, high leverage

---

## Status

✅ Stable
✅ Consistent across environments
✅ Ready for scale improvements
🚀 Entering leverage phase (automation + input simplification)

---
