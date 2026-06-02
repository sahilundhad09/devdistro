-- ================================================================
-- DevDistro — Supabase PostgreSQL Schema
-- ================================================================
-- Copy and paste this script into the Supabase SQL Editor
-- to initialize the database tables, triggers, and functions.
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro')),
  plans_used_this_month int not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Projects Table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  target_audience text not null,
  landing_url text,
  scraped_content text,
  mode text not null default 'app' check (mode in ('app', 'freelance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Plans Table
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  quick_wins jsonb default '[]',
  producthunt_checklist jsonb default '[]',
  version int not null default 1,
  created_at timestamptz not null default now()
);

-- 4. Plan Channels Table
create table public.plan_channels (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  channel_type text not null check (channel_type in (
    'reddit', 'facebook', 'twitter', 'newsletter', 'directory', 'linkedin'
  )),
  sort_order int not null default 0
);

-- 5. Plan Items Table
create table public.plan_items (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.plan_channels(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  url text,
  audience_size text,
  angle text,
  template_title text,
  template_body text,
  status text not null default 'pending' check (status in ('pending', 'done', 'skipped', 'saved')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 6. Subscriptions Table
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  lemon_customer_id text,
  lemon_subscription_id text unique,
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  plan_name text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ── INDEXES FOR OPTIMAL PERFORMANCE ───────────────────────────
create index idx_projects_user on public.projects(user_id);
create index idx_plans_project on public.plans(project_id);
create index idx_plan_items_plan on public.plan_items(plan_id);
create index idx_plan_items_user_status on public.plan_items(user_id, status);
create index idx_subscriptions_user on public.subscriptions(user_id);

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.plans enable row level security;
alter table public.plan_channels enable row level security;
alter table public.plan_items enable row level security;
alter table public.subscriptions enable row level security;

-- RLS Policies
create policy "Users read own" on public.users for select using (auth.uid() = id);
create policy "Users update own" on public.users for update using (auth.uid() = id);

create policy "Projects CRUD own" on public.projects for all using (auth.uid() = user_id);
create policy "Plans CRUD own" on public.plans for all using (auth.uid() = user_id);

create policy "Channels CRUD own" on public.plan_channels for all
  using (plan_id in (select id from public.plans where user_id = auth.uid()))
  with check (plan_id in (select id from public.plans where user_id = auth.uid()));

create policy "Items CRUD own" on public.plan_items for all using (auth.uid() = user_id);
create policy "Subs read own" on public.subscriptions for select using (auth.uid() = user_id);

-- ── TRIGGER: AUTO-CREATE USER PROFILE ON SIGNUP ───────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url, plan_tier, plans_used_this_month)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'free',
    0
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── RPC FUNCTION: INCREMENT PLANS USED ─────────────────────────
create or replace function public.increment_plans_used(user_id_input uuid)
returns void as $$
begin
  update public.users
  set plans_used_this_month = plans_used_this_month + 1
  where id = user_id_input;
end;
$$ language plpgsql security definer;
