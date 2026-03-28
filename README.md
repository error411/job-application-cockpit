# Job Application Cockpit

A focused, data-driven system for managing job applications, generating tailored assets, and tracking progress through the hiring pipeline.

---

## Overview

Job Application Cockpit is designed to help you:

- Capture and organize job opportunities
- Score roles against your experience
- Generate tailored resumes and cover letters
- Track application status and interview progression
- Maintain momentum with structured follow-ups

This is a **private, single-user productivity tool** built for real daily use.

---

## Current Status

The app currently supports:

- Job tracking pipeline  
  `captured → scored → ready → applied → interviewing → closed`
- Resume + cover letter generation (HTML + PDF)
- Interview tracking (event-based model)
- Supabase-backed data model
- Private site access via shared password authentication

---

## Authentication

The application is protected by a lightweight shared-password gate.

- Edge proxy enforces access control
- Signed cookie session (Web Crypto / HMAC)
- No user accounts required

This is intended for private deployments and internal usage.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Postgres + server client)
- Tailwind CSS
- React PDF Renderer (PDF generation)

---

## Project Structure (High-Level)

src/
app/
api/
(routes)
lib/
resume/
cover-letter/
supabase/


---

## Roadmap

### Near-Term

- User onboarding flow (first-time experience)
- Resume import + parsing → seed candidate profile
- Guided “Add Job” experience
- Dashboard onboarding states (empty → active)

### Mid-Term

- Multi-candidate configuration
- Improved job ingestion (URL parsing, email parsing)
- Smarter scoring + asset generation

### UX Improvements

- Mobile responsiveness improvements
- Navigation optimization for small screens
- Suppress keyboard-heavy UI patterns on mobile

---

## Notes

This project is actively evolving.

Current focus:

> Turning this into a fast, reliable daily system for managing job applications end-to-end.