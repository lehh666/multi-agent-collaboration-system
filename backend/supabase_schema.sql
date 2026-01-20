-- Create table for storing world states
create table if not exists public.world_states (
  room_id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.world_states enable row level security;

-- Create policy to allow anonymous access (for demo purposes)
-- In production, you should restrict this to authenticated users
create policy "Allow public access"
  on public.world_states
  for all
  using (true)
  with check (true);