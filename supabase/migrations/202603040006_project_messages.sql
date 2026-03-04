create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_label text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_project_id on public.messages (project_id, created_at desc);
