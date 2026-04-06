# ApplyEngine – Project Snapshot

## Current State

Auth cutover completed:

* Supabase auth fully integrated (email/password)
* Server-side session handling in App Router
* Middleware enforces protected routes
* Legacy “site password” auth removed

Routing model:

* `/` → marketing / landing page
* `/login` → auth entry
* `/dashboard` → pipeline overview
* `/today` → execution view
* `/jobs` → record management
* `/follow-ups` → follow-up management

## What Works

* Signup / login flow (email confirmation fixed)
* Auth-aware header (logged-in vs logged-out)
* Protected routes via middleware
* Dashboard metrics (user-scoped)
* Today view (user-scoped workflow)
* Jobs CRUD + application linkage

## Known Issues

### 1. Follow-up generation inconsistency

* Follow-up items do not always reflect:

  * generated assets
  * current application state
* Likely mismatch between:

  * asset generation step
  * follow-up scheduling logic
* Needs alignment between workflow + UI expectations

### 2. Dashboard vs Today data model drift

* Dashboard uses derived counts
* Today uses actionable queue
* Minor inconsistencies in how:

  * follow-ups are interpreted
  * readiness is determined

### 3. Workflow model fragmentation

* Legacy workflow helper removed (admin-based)
* New helper is user-scoped but simpler
* Missing:

  * snoozing
  * unified “next action” abstraction

## Technical Debt

* Duplicate workflow logic across:

  * dashboard
  * today
  * follow-ups
* Follow-up dates stored as multiple fields (`follow_up_1_due`, etc.)
* No single “next_action_at” or “next_action_type”

## Immediate To-Dos

### High Priority

* [ ] Fix follow-up generation not reflecting assets on `/follow-ups`
* [ ] Ensure follow-ups update after:

  * asset generation
  * status changes
* [ ] Align Dashboard + Today logic for:

  * overdue
  * due today
  * ready

### Medium Priority

* [ ] Introduce unified workflow model:

  * next_action_at
  * next_action_type
* [ ] Refactor follow-up fields into structured model
* [ ] Remove remaining legacy workflow assumptions

### Low Priority

* [ ] Improve landing page → product fidelity
* [ ] Add onboarding / empty states
* [ ] Improve visual consistency across views

## Next Focus

Stabilize workflow correctness before adding features.

The system should answer clearly:

* What should the user do next?
* Why is it surfaced?
* Is the data consistent across views?

Until that is solid, avoid expanding feature surface area.
