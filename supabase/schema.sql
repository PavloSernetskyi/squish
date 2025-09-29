-- Profiles live in public schema; auth.users is managed by Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  timezone text default 'UTC',
  default_duration_min int default 10,
  total_sessions int default 0,
  total_meditation_time_sec int default 0,
  last_session_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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

-- User meditation sessions
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_type text default 'voice_meditation',
  duration_min int not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'active', -- active, completed, abandoned
  rating int check (rating >= 1 and rating <= 5),
  notes text,
  created_at timestamptz default now()
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

-- Function to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update user stats when session completes
create or replace function public.update_user_stats()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update public.profiles 
    set 
      total_sessions = total_sessions + 1,
      total_meditation_time_sec = total_meditation_time_sec + (new.duration_min * 60),
      last_session_at = new.completed_at,
      updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update stats when session completes
create or replace trigger on_session_completed
  after update on public.user_sessions
  for each row execute procedure public.update_user_stats();
