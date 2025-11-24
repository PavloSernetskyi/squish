-- Fix profile creation trigger with better error handling
-- Run this in your Supabase SQL Editor

-- Drop and recreate the function with better error handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id, 
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', null)
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    -- Log error but don't fail user creation
    raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Ensure the trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.user_sessions to anon, authenticated;

-- Enable RLS but allow inserts for authenticated users
alter table public.profiles enable row level security;
alter table public.user_sessions enable row level security;

-- Policy: Users can read their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy: Service role can insert profiles (for trigger)
drop policy if exists "Service role can insert profiles" on public.profiles;
create policy "Service role can insert profiles" on public.profiles
  for insert with check (true);

-- Policy: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Similar policies for user_sessions
drop policy if exists "Users can view own sessions" on public.user_sessions;
create policy "Users can view own sessions" on public.user_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own sessions" on public.user_sessions;
create policy "Users can insert own sessions" on public.user_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own sessions" on public.user_sessions;
create policy "Users can update own sessions" on public.user_sessions
  for update using (auth.uid() = user_id);

