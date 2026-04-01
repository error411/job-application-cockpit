# Project Snapshot

## Current Focus

Shifting from feature development → **workflow consistency and system clarity**

Primary goals:

- eliminate duplicated logic
- centralize workflow rules
- ensure all pages reflect the same system state

---

## System Overview

### Core Tables

- `jobs`
- `applications`
- `application_assets`
- `candidate_profile`
- `candidate_experience`
- `job_scores`
- `interview_rounds`

---

## Pipeline Model

Applications use a **minimal status model**:

- `ready`
- `applied`
- `interviewing`
- `closed`

Notes:

- `follow_up_due` is legacy and being phased out
- follow-ups are derived from timestamps, not stored as status

---

## Follow-Up System

Single source of truth:

- `getFollowUpState`

Inputs:

- `applied_at`
- `last_follow_up_at`

Outputs:

- due
- overdue
- upcoming

This logic is shared across:

- Today page
- Dashboard
- Apply mode

---

## Action Item System

- Built via shared helpers (e.g. `buildActionItems`)
- Produces normalized "what should I do next"

Used by:

- Dashboard (punch list)
- Today page

Goal:

- eliminate page-specific queue logic

---

## Archive System

Soft delete model:

- `jobs.archived_at`
- `jobs.archived_reason`

Behavior:

- archived jobs are excluded from:
  - Today
  - Apply
  - Follow-ups
  - Dashboard
- restore is supported
- hard delete is secondary

---

## Current Capabilities

- Job capture and tracking
- Resume + cover letter generation (HTML + PDF)
- Interview round logging (event-based)
- Follow-up scheduling (derived logic)
- Action-item driven workflow
- Private site authentication

---

## Known Inconsistencies (In Progress)

- Apply mode still has partially duplicated follow-up logic
- Some pages independently filter archived jobs instead of using shared helpers
- Legacy `follow_up_due` status still present in type system

---

## Next Cleanup Targets

### 1. Shared Application Loader

- [ ] Create `getActiveWorkflowApplications`
  - [ ] filter active statuses
  - [ ] exclude archived jobs
  - [ ] normalize job joins

---

### 2. Apply Mode Alignment

- [ ] Refactor `getApplyItems`
  - [ ] use shared follow-up logic
  - [ ] remove custom overdue calculations
  - [ ] align priority with action-item system

---

### 3. Archive Consistency

- [ ] Ensure ALL workflow surfaces exclude archived jobs via shared helper
- [ ] Remove page-level filtering

---

### 4. Status Cleanup

- [ ] Remove `follow_up_due` from:
  - [ ] type definitions
  - [ ] constants
  - [ ] any remaining usage

---

## TODO / Next Work

### Onboarding

- [ ] First-time user onboarding flow
  - [ ] Intro / how-it-works screen
  - [ ] Resume upload (PDF / DOCX)
  - [ ] Candidate profile seeding
  - [ ] Guided first job entry
  - [ ] Transition to dashboard with CTA

---

### Candidate System

- [ ] Multi-candidate configuration
  - [ ] Profile switcher (UI)
  - [ ] Scoped applications per candidate
  - [ ] Asset generation per candidate

---

### Mobile Improvements

- [ ] Improve navigation for mobile
- [ ] Reduce dashboard density
- [ ] Improve input + focus behavior
- [ ] Ensure pipeline readability on small screens

---

### UX / Product

- [ ] Improve empty states
- [ ] Add guided actions (CTAs, prompts)
- [ ] Refine pipeline visualization

---

### Tech / System

- [ ] Resume import + parsing (Phase 2)
- [ ] Normalize asset generation pipeline
- [ ] Improve error handling + logging

---

## Principles

Keep the system:

- minimal
- explicit
- user-driven
- easy to reason about

Avoid:

- implicit workflow logic
- duplicated business rules
- status bloat