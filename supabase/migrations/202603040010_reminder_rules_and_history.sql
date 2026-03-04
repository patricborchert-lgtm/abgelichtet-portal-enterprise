create table if not exists public.reminder_rules (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('approval_requested', 'feedback_requested')),
  days_after integer not null check (days_after > 0),
  send_to text not null check (send_to in ('client', 'admin')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_reminder_rules_unique_type_send_to
  on public.reminder_rules (type, send_to);

create table if not exists public.reminder_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  approval_id uuid not null references public.approvals(id) on delete cascade,
  type text not null check (type in ('approval_requested', 'feedback_requested')),
  sent_at timestamptz not null default now()
);

create unique index if not exists idx_reminder_history_unique_cycle
  on public.reminder_history (approval_id, type);

create index if not exists idx_reminder_history_project_id
  on public.reminder_history (project_id, sent_at desc);

insert into public.reminder_rules (type, days_after, send_to, enabled)
values
  ('approval_requested', 5, 'client', true),
  ('feedback_requested', 5, 'client', true)
on conflict (type, send_to)
do update set
  days_after = excluded.days_after,
  enabled = excluded.enabled;
