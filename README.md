# Job Application Cockpit

A focused, data-driven system for managing job applications, generating tailored assets, and executing a consistent application workflow.

---

## Overview

Job Application Cockpit is built to help you:

- Capture and organize job opportunities
- Score roles against your experience
- Generate tailored resumes and cover letters
- Track applications and interview progression
- Stay consistent with structured follow-ups and action queues

This is a **private, single-user productivity system** designed for real daily use.

---

## Current Status

The system is now transitioning from **feature-complete → workflow-consistent**.

Key capabilities:

- Job pipeline management
- Resume + cover letter generation (HTML + PDF)
- Interview tracking (event-based model)
- Follow-up tracking (derived, not status-based)
- Centralized action-item system (Today / Dashboard)
- Soft archive system for jobs
- Supabase-backed data model
- Shared-password authentication

---

## Core Concepts

### 1. Job vs Application

- `jobs` = opportunity source of truth
- `applications` = workflow state tied to a job

---

### 2. Pipeline Model (Applications)

Applications move through:
ready → applied → interviewing → closed


Notes:

- **Follow-ups are NOT a status**
- Follow-up state is derived from timestamps via shared logic
- Interview progression is event-based (no fixed columns)

---

### 3. Follow-Up System

- Driven by shared helper: `getFollowUpState`
- Based on:
  - `applied_at`
  - `last_follow_up_at`
- Produces:
  - due / overdue / upcoming states
- Used across:
  - Today page
  - Dashboard
  - Apply mode

---

### 4. Action Item System

- Centralized via shared builders (e.g. `buildActionItems`)
- Powers:
  - Dashboard punch list
  - Today view
- Prevents duplication of queue logic across pages

---

### 5. Archive Model (Soft Delete)

Jobs are never hard-deleted during normal use.

Instead:

- `jobs.archived_at`
- `jobs.archived_reason`

Rules:

- Archived jobs are **excluded from all active workflow surfaces**
  - Today
  - Apply
  - Follow-ups
  - Dashboard
- Archive is reversible (restore supported)

---

## Authentication

- Lightweight shared-password protection
- Edge proxy enforcement
- Signed cookie session (Web Crypto / HMAC)

No user accounts required.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Postgres + server client)
- Tailwind CSS
- React PDF Renderer

---

## Project Structure (High-Level)
src/
app/
(routes)
api/
lib/
applications/
apply-mode/
resume/
cover-letter/
supabase/


---

## Roadmap

### Near-Term

- User onboarding flow (first-run experience)
- Resume import + parsing → seed candidate profile (Phase 2)
- Guided “Add Job” experience
- Empty-state → active-state transitions

---

### Mid-Term

- Multi-candidate configuration
- Improved job ingestion (URL parsing, email parsing)
- Smarter scoring + asset generation

---

### UX Improvements

- Mobile responsiveness improvements
- Navigation optimization for small screens
- Reduce keyboard-heavy UX on mobile

---

## Development Notes

System direction:

- Prefer **shared helpers over page-specific logic**
- Keep workflow logic **centralized and deterministic**
- Treat UI as a **projection of system state**, not a source of truth

Avoid:

- Duplicated queue logic
- Status-driven follow-ups
- Hidden or implicit workflow transitions

---

## Current Focus

> Making the system fast, consistent, and reliable for daily application execution.