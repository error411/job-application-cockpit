# Project Snapshot

## Current Focus

Transitioning from core functionality → usable daily system.

Key priorities:
- onboarding experience
- first-run usability
- reducing friction to first application

---

## System Overview

### Core Entities

- jobs
- applications
- application_assets
- candidate_profile
- candidate_experience
- job_scores

---

## Pipeline Model

Applications move through:

- ready
- applied
- follow_up_due
- interviewing
- rejected / closed

Interview tracking is event-based (no fixed columns).

---

## Current Capabilities

- Job capture and tracking
- Resume + cover letter generation
- PDF export (React PDF)
- Interview round logging
- Follow-up scheduling
- Private site authentication

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
  - [ ] Support multiple candidate profiles
  - [ ] Profile switcher (UI)
  - [ ] Scoped applications per candidate
  - [ ] Asset generation per candidate context

---

### Mobile Improvements

- [ ] Improve navigation for mobile
  - [ ] Bottom nav or simplified header
  - [ ] Reduce density of dashboard UI
- [ ] Suppress keyboard-heavy interactions
  - [ ] Avoid hotkeys on mobile
  - [ ] Improve input focus behavior
- [ ] Optimize layout responsiveness
  - [ ] Cards stack cleanly
  - [ ] Metrics + pipeline readable on small screens

---

### UX / Product

- [ ] Improve empty states across app
- [ ] Add guided actions (hotspots / banners)
- [ ] Refine pipeline visualization clarity

---

### Tech / System

- [ ] Resume import + parsing (Phase 2)
- [ ] Normalize asset generation pipeline
- [ ] Improve error handling + logging

---

## Notes

Keep implementation:
- minimal
- user-driven
- easy to reason about

Avoid:
- over-automation
- hidden state
- rigid workflows