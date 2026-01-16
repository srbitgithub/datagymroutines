-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  weight_unit text default 'kg' check (weight_unit in ('kg', 'lbs')),
  language text default 'es',
  gender text default 'male' check (gender in ('male', 'female', 'other')),

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);


-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth
-- Note: Remember to run this in the SQL Editor of your Supabase Dashboard
create function public.handle_new_user()
returns trigger as $$
declare
  user_lang text;
begin
  -- Get language from metadata or default to 'es'
  user_lang := coalesce(new.raw_user_meta_data->>'language', 'es');

  insert into public.profiles (id, full_name, avatar_url, username, language)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email, user_lang);

  -- Seed initial exercises for the user from the catalog
  insert into public.exercises (user_id, name, muscle_group)
  select 
    new.id, 
    (name->>user_lang), 
    (muscle_group->>user_lang)
  from public.base_exercises;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
