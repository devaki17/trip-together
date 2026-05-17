## Backend plan — Whatever group trip planning

### 1. Enable Lovable Cloud
Turn on the integrated backend (Postgres + storage + server functions). No login required for users — they identify themselves with just a display name on each invite link.

### 2. Database schema

```text
trips
  id (uuid, pk)              -- the tripId in the URL
  name, destination, budget
  depart_date, return_date
  organizer_name
  organizer_email
  status                     -- 'collecting' | 'voting' | 'finalized'
  itinerary (jsonb, null)    -- AI-generated, filled when all submit
  created_at

invitees
  id (uuid, pk)
  trip_id (fk -> trips)
  email                      -- from organizer's list
  display_name (null until they join)
  joined_at

preferences                  -- one row per invitee submission
  id, trip_id, invitee_id
  vibes (text[])             -- max 2
  energy (numeric)           -- 0..2
  morning_schedule (text)    -- 'early' | 'late' | 'flex'
  evening_schedule (text)
  restrictions (text)
  notes (text)
  submitted_at

moodboard_picks
  id, trip_id, invitee_id
  photo_ids (int[])          -- the 5 picsum seeds chosen

conflict_resolutions
  id, trip_id, invitee_id
  conflict_id (text)         -- e.g. 'start-time'
  choice (text)
  submitted_at

votes
  id, trip_id, invitee_id
  approved (bool)
  voted_at
```

RLS: trips/invitees/etc. are readable by anyone with the tripId (anonymous link model). Writes are scoped per invitee via a short-lived `invitee_token` stored in localStorage so each person can only edit their own submission.

### 3. Server functions (`src/lib/*.functions.ts`)

- `createTrip(name, destination, budget, dates, organizer, emails[])` → inserts trip + invitee rows, queues invite emails, returns `tripId`.
- `getTrip(tripId)` → trip + invitees with submission status (for the organizer dashboard / context bar).
- `joinTrip(tripId, email)` → returns/creates an `invitee_token` for that email, stored in localStorage.
- `submitPreferences(token, data)` / `submitMoodboard(token, photoIds)` / `submitConflictResolution(token, conflictId, choice)` / `submitVote(token, approved)`.
- `generateItinerary(tripId)` — calls the Lovable AI Gateway (Google Gemini, free during promo) with the aggregated preferences + conflict resolutions, returns a 3-day itinerary JSON, persists it to `trips.itinerary`. Triggered automatically once all invitees have submitted.

### 4. AI itinerary generation

Uses the Lovable AI Gateway (no API key needed — already wired). Prompt summarises:
- Destination, dates, budget
- Aggregated vibes (top 2-3)
- Average energy level
- Schedule preferences (majority + minority noted)
- Restrictions per person
- How each conflict was resolved

Returns structured JSON: `{ days: [{ date, activities: [{ time, title, description, vibe, compromiseTag? }] }], satisfactionScore, memberScores }`. The itinerary screen renders directly from this.

### 5. Invite emails

Use Lovable's built-in email system (no external service to configure):
- Set up email infrastructure + transactional template `trip-invite` with the trip name, organizer, and invite link `https://<app>/trip/{tripId}/preferences?token={inviteeToken}`.
- On trip creation, enqueue one email per invitee.
- Requires you to verify an email subdomain (e.g. `notify.yourdomain.com`) — I'll walk you through the DNS step when we get there.

### 6. Frontend wiring

- `/create` → calls `createTrip`, redirects organizer to `/trip/$tripId/preferences?token=...`.
- Invite links carry `?token=...`; each screen reads token + tripId, fetches trip context (replacing current URL-param placeholders), submits via the matching server function.
- `/itinerary` waits until `trips.itinerary` is populated, polls every few seconds (or shows "Waiting for X people").

### Out of scope for this pass

- Realtime updates (will use polling; can upgrade to Supabase realtime later)
- Organizer dashboard to track who's submitted (can add after)
- Editing a submission after sending it

### Order of work

1. Enable Cloud
2. Create schema + RLS
3. Server functions + token model
4. Wire `/create` → `createTrip` and rebuild context bar from real data
5. Wire preferences / moodboard / conflicts / vote screens to their submit functions
6. AI itinerary generation + `/itinerary` data binding
7. Email infrastructure + invite template + DNS guidance

Approve and I'll start at step 1.
