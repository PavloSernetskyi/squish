-- Simple fix for new user signups
-- This ensures new users get profiles created automatically

-- 1. Update the trigger function to handle errors better
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
    -- Don't fail user creation if profile creation fails
    raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- 2. Make sure the trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Allow profile creation (RLS policies)
alter table public.profiles enable row level security;

-- Allow the trigger to insert profiles
drop policy if exists "Allow profile creation" on public.profiles;
create policy "Allow profile creation" on public.profiles
  for insert with check (true);

-- Allow users to read their own profile
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Allow users to update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 4. Allow session creation (RLS policies)
alter table public.user_sessions enable row level security;

-- Allow users to insert their own sessions
drop policy if exists "Users can insert own sessions" on public.user_sessions;
create policy "Users can insert own sessions" on public.user_sessions
  for insert with check (auth.uid() = user_id);

-- Allow users to read their own sessions
drop policy if exists "Users can read own sessions" on public.user_sessions;
create policy "Users can read own sessions" on public.user_sessions
  for select using (auth.uid() = user_id);

-- Allow users to update their own sessions
drop policy if exists "Users can update own sessions" on public.user_sessions;
create policy "Users can update own sessions" on public.user_sessions
  for update using (auth.uid() = user_id);

