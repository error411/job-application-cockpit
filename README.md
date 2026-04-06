# ApplyEngine

ApplyEngine is a focused job search workspace that helps you track opportunities, manage follow-ups, and execute your search like a system—not a scramble.

## Overview

Job searches break down when they’re spread across tabs, notes, and memory.

ApplyEngine brings everything into one place:

* Track jobs and application status
* Work the right next actions from a centralized “Today” view
* Stay on top of follow-ups
* Understand pipeline health with a dashboard

## Core Features

### Dashboard

* Snapshot of pipeline state (Ready, Applied, Interviewing, Overdue)
* Recent activity across jobs
* Quick navigation into execution views

### Today

* Action-oriented queue of what needs attention now
* Highlights:

  * Overdue follow-ups
  * Due-today follow-ups
  * Ready-to-apply opportunities

### Jobs

* Central record of all opportunities
* Track:

  * Company, role, location
  * Status and progression
  * Application history

### Follow-ups

* Dedicated view for managing outreach and follow-through
* Surfaces follow-up timing based on application state

## Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind
* **Backend / Data:** Supabase (PostgreSQL, Auth, RLS)
* **Auth:** Supabase email/password with server-side session handling
* **Hosting:** Vercel

## Architecture Notes

* Server Components + Supabase SSR for auth-aware rendering
* Middleware enforces route protection for authenticated areas
* Row Level Security (RLS) ensures user-scoped data access
* Dashboard and Today derive state from application workflow data

## Local Development

```bash
npm install
npm run dev
```

Set environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Production

Ensure:

* Supabase Site URL is set to your domain
* Redirect URLs include:

  * `/auth/confirm`
  * `/login`
* Environment variables are configured in Vercel

## Status

Active development.

Core auth, dashboard, and workflow views are functional. Follow-up logic and workflow refinement are in progress.
