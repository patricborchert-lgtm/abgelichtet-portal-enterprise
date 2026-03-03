create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text,
  phone text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'client')),
  client_id uuid references public.clients(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  description text,
  status text not null check (status in ('planned', 'active', 'review', 'delivered', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique,
  filename text not null,
  mime_type text,
  size bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_client_id on public.profiles (client_id);
create index if not exists idx_projects_client_id on public.projects (client_id);
create index if not exists idx_project_files_project_id on public.project_files (project_id);
create index if not exists idx_activity_log_actor_id on public.activity_log (actor_id);
create index if not exists idx_activity_log_entity on public.activity_log (entity_type, entity_id);
create index if not exists idx_audit_log_actor_id on public.audit_log (actor_id);

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;
