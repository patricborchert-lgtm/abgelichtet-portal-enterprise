create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_label text not null,
  event_type text not null check (
    event_type in ('comment', 'update', 'approval_requested', 'approved', 'changes_requested', 'milestone')
  ),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'changes_requested')),
  request_message text,
  response_comment text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_approvals_single_pending_per_project
  on public.approvals (project_id)
  where status = 'pending';

create index if not exists idx_milestones_project_id on public.milestones (project_id, sort_order, created_at);
create index if not exists idx_timeline_events_project_id on public.timeline_events (project_id, created_at desc);
create index if not exists idx_approvals_project_id on public.approvals (project_id, created_at desc);

create or replace function public.respond_to_project_approval(
  p_approval_id uuid,
  p_status text,
  p_response_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if p_status not in ('approved', 'changes_requested') then
    raise exception 'Invalid approval status.';
  end if;

  if p_status = 'changes_requested' and coalesce(trim(p_response_comment), '') = '' then
    raise exception 'Kommentar ist erforderlich.';
  end if;

  select project_id
  into v_project_id
  from public.approvals
  where id = p_approval_id
    and status = 'pending';

  if v_project_id is null then
    raise exception 'Approval request was not found.';
  end if;

  if not exists (
    select 1
    from public.projects
    where id = v_project_id
      and client_id = public.my_client_id()
  ) then
    raise exception 'Not allowed.';
  end if;

  update public.approvals
  set reviewed_by = auth.uid(),
      status = p_status,
      response_comment = nullif(trim(p_response_comment), ''),
      decided_at = now()
  where id = p_approval_id
    and status = 'pending';

  if not found then
    raise exception 'Approval request is no longer pending.';
  end if;
end;
$$;

revoke all on function public.respond_to_project_approval(uuid, text, text) from public;
grant execute on function public.respond_to_project_approval(uuid, text, text) to authenticated;
