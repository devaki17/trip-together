
-- TRIPS
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  budget text not null,
  depart_date date,
  return_date date,
  organizer_name text not null,
  organizer_email text not null,
  status text not null default 'collecting',
  itinerary jsonb,
  created_at timestamptz not null default now()
);

-- INVITEES
create table public.invitees (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  email text not null,
  display_name text,
  token_hash text not null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (trip_id, email)
);
create index on public.invitees(trip_id);

-- PREFERENCES (one per invitee per trip)
create table public.preferences (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  invitee_id uuid not null references public.invitees(id) on delete cascade,
  vibes text[] not null default '{}',
  energy numeric not null default 1,
  morning_schedule text,
  evening_schedule text,
  restrictions text,
  notes text,
  submitted_at timestamptz not null default now(),
  unique (invitee_id)
);
create index on public.preferences(trip_id);

-- MOODBOARD
create table public.moodboard_picks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  invitee_id uuid not null references public.invitees(id) on delete cascade,
  photo_ids int[] not null default '{}',
  submitted_at timestamptz not null default now(),
  unique (invitee_id)
);
create index on public.moodboard_picks(trip_id);

-- CONFLICT RESOLUTIONS
create table public.conflict_resolutions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  invitee_id uuid not null references public.invitees(id) on delete cascade,
  conflict_id text not null,
  choice text not null,
  submitted_at timestamptz not null default now(),
  unique (invitee_id, conflict_id)
);
create index on public.conflict_resolutions(trip_id);

-- VOTES
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  invitee_id uuid not null references public.invitees(id) on delete cascade,
  approved boolean not null,
  voted_at timestamptz not null default now(),
  unique (invitee_id)
);
create index on public.votes(trip_id);

-- RLS: public read (anyone with trip id can see), no client writes
alter table public.trips enable row level security;
alter table public.invitees enable row level security;
alter table public.preferences enable row level security;
alter table public.moodboard_picks enable row level security;
alter table public.conflict_resolutions enable row level security;
alter table public.votes enable row level security;

create policy "trips_public_read" on public.trips for select using (true);
create policy "invitees_public_read" on public.invitees for select using (true);
create policy "preferences_public_read" on public.preferences for select using (true);
create policy "moodboard_public_read" on public.moodboard_picks for select using (true);
create policy "conflicts_public_read" on public.conflict_resolutions for select using (true);
create policy "votes_public_read" on public.votes for select using (true);

-- Hide invitee token_hash from public reads via a view-like column policy:
-- restrict select on invitees to safe columns by revoking and re-granting
revoke select on public.invitees from anon, authenticated;
grant select (id, trip_id, email, display_name, joined_at, created_at) on public.invitees to anon, authenticated;
