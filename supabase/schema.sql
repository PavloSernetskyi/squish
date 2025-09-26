-- Profiles live in public schema; auth.users is managed by Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  timezone text default 'UTC',
  default_duration_min int default 10,
  created_at timestamptz default now()
);

-- Voice call logs (web-only)
create table if not exists public.voice_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vapi_call_id text unique not null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_sec int,
  transcript text,
  summary text,
  intent text
);

-- Optional: sessions table if you later add on-device audio tracking
create table if not exists public.sessions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  progress_sec int default 0,
  rating int,
  summary text
);
