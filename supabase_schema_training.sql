-- Exercise catalog for seeding new users
create table base_exercises (
  id uuid default gen_random_uuid() primary key,
  name jsonb not null,
  muscle_group jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed data for exercise catalog
insert into base_exercises (name, muscle_group) values
('{"en": "Bench Press", "es": "Press de Banca"}', '{"en": "Chest", "es": "Pecho"}'),
('{"en": "Squat", "es": "Sentadilla Libre"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "Deadlift", "es": "Peso Muerto"}', '{"en": "Back/Legs", "es": "Espalda/Piernas"}'),
('{"en": "Military Press", "es": "Press Militar"}', '{"en": "Shoulders", "es": "Hombros"}'),
('{"en": "Pull Ups", "es": "Dominadas"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "Barbell Row", "es": "Remo con Barra"}', '{"en": "Back", "es": "Espalda"}'),
('{"en": "Lunges", "es": "Zancadas"}', '{"en": "Legs", "es": "Piernas"}'),
('{"en": "French Press", "es": "Press Francés"}', '{"en": "Triceps", "es": "Tríceps"}'),
('{"en": "Bicep Curl", "es": "Curl de Bíceps"}', '{"en": "Biceps", "es": "Bíceps"}'),
('{"en": "Plank", "es": "Plancha Abdominal"}', '{"en": "Core", "es": "Core"}');

-- Exercise table
create table exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade, -- Null for global exercises
  name text not null,
  muscle_group text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for exercises
alter table exercises enable row level security;

create policy "Exercises are viewable by everyone if global or by owner." on exercises
  for select using (user_id is null or auth.uid() = user_id);

create policy "Users can insert their own exercises." on exercises
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own exercises." on exercises
  for update using (auth.uid() = user_id);

-- Routine (Template) table
create table routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  order_index int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Routine Exercises (Relation)
create table routine_exercises (
  id uuid default gen_random_uuid() primary key,
  routine_id uuid references routines on delete cascade not null,
  exercise_id uuid references exercises on delete cascade not null,
  order_index int not null,
  notes text
);

-- Training Sessions
create table training_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  routine_id uuid references routines on delete set null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  notes text
);

-- Exercise Sets (Logged data)
create table exercise_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references training_sessions on delete cascade not null,
  exercise_id uuid references exercises on delete cascade not null,
  weight numeric not null,
  reps int not null,
  type text default 'normal' check (type in ('normal', 'warmup', 'dropset', 'failure')),
  order_index int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Routines, Routine Exercises, Sessions, and Sets
-- (All linked to auth.uid() = user_id)
alter table routines enable row level security;
alter table routine_exercises enable row level security;
alter table training_sessions enable row level security;
alter table exercise_sets enable row level security;

create policy "Users can manage their own routines." on routines for all using (auth.uid() = user_id);
create policy "Users can manage their own routine exercises." on routine_exercises for all using (
  exists (select 1 from routines where id = routine_id and user_id = auth.uid())
);
create policy "Users can manage their own sessions." on training_sessions for all using (auth.uid() = user_id);
create policy "Users can manage their own sets." on exercise_sets for all using (
  exists (select 1 from training_sessions where id = session_id and user_id = auth.uid())
);

