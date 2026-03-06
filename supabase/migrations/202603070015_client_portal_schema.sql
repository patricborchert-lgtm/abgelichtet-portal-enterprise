begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: extend with display metadata used by client portal UI
-- ---------------------------------------------------------------------------
alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists name text,
  add column if not exists avatar_url text;

update public.profiles p
set
  email = coalesce(nullif(trim(p.email), ''), u.email),
  name = coalesce(nullif(trim(p.name), ''), split_part(u.email, '@', 1))
from auth.users u
where u.id = p.id
  and (
    p.email is null
    or trim(p.email) = ''
    or p.name is null
    or trim(p.name) = ''
  );

create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_role on public.profiles (role);

-- ---------------------------------------------------------------------------
-- projects: add progress and support both legacy + new status vocabulary
-- ---------------------------------------------------------------------------
alter table if exists public.projects
  add column if not exists progress integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_progress_check'
  ) then
    alter table public.projects
      add constraint projects_progress_check
      check (progress between 0 and 100);
  end if;
end
$$;

do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.projects'::regclass
      and c.contype = 'c'
      and exists (
        select 1
        from unnest(c.conkey) as ck(attnum)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = ck.attnum
        where a.attname = 'status'
      )
      and c.conname <> 'projects_status_check_v2'
  loop
    execute format('alter table public.projects drop constraint if exists %I', v_constraint.conname);
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_status_check_v2'
  ) then
    alter table public.projects
      add constraint projects_status_check_v2
      check (
        status in (
          'planning',
          'planned',
          'active',
          'review',
          'completed',
          'delivered',
          'archived'
        )
      );
  end if;
end
$$;

create index if not exists idx_projects_service_type on public.projects (service_type);
create index if not exists idx_projects_status on public.projects (status);

-- ---------------------------------------------------------------------------
-- project_members: explicit project access mapping
-- ---------------------------------------------------------------------------
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'client')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists idx_project_members_project_id on public.project_members (project_id);
create index if not exists idx_project_members_user_id on public.project_members (user_id);

-- ---------------------------------------------------------------------------
-- milestones: align with requested model while preserving existing columns
-- ---------------------------------------------------------------------------
alter table if exists public.milestones
  add column if not exists order_index integer,
  add column if not exists due_date timestamptz;

update public.milestones
set order_index = coalesce(order_index, sort_order, 0)
where order_index is null;

alter table if exists public.milestones
  alter column order_index set default 0;

alter table if exists public.milestones
  alter column order_index set not null;

do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.milestones'::regclass
      and c.contype = 'c'
      and exists (
        select 1
        from unnest(c.conkey) as ck(attnum)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = ck.attnum
        where a.attname = 'status'
      )
      and c.conname <> 'milestones_status_check_v2'
  loop
    execute format('alter table public.milestones drop constraint if exists %I', v_constraint.conname);
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.milestones'::regclass
      and conname = 'milestones_status_check_v2'
  ) then
    alter table public.milestones
      add constraint milestones_status_check_v2
      check (status in ('pending', 'active', 'in_progress', 'completed'));
  end if;
end
$$;

create or replace function public.sync_milestone_order_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.order_index := coalesce(new.order_index, new.sort_order, 0);
    new.sort_order := coalesce(new.sort_order, new.order_index, 0);
    return new;
  end if;

  if new.order_index is distinct from old.order_index then
    new.sort_order := coalesce(new.order_index, 0);
  elsif new.sort_order is distinct from old.sort_order then
    new.order_index := coalesce(new.sort_order, 0);
  else
    new.order_index := coalesce(new.order_index, new.sort_order, 0);
    new.sort_order := coalesce(new.sort_order, new.order_index, 0);
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_sync_milestone_order_fields'
      and tgrelid = 'public.milestones'::regclass
  ) then
    create trigger trg_sync_milestone_order_fields
    before insert or update of order_index, sort_order
    on public.milestones
    for each row
    execute function public.sync_milestone_order_fields();
  end if;
end
$$;

create index if not exists idx_milestones_project_order_index
  on public.milestones (project_id, order_index, created_at);

-- ---------------------------------------------------------------------------
-- project_folders: folder system for project file workspaces
-- ---------------------------------------------------------------------------
create table if not exists public.project_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (project_id, name)
);

create index if not exists idx_project_folders_project_id on public.project_folders (project_id);

-- ---------------------------------------------------------------------------
-- files: structured file records per project/folder
-- ---------------------------------------------------------------------------
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid references public.project_folders(id) on delete set null,
  name text not null,
  file_url text not null,
  file_type text,
  size integer,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (size is null or size >= 0)
);

create index if not exists idx_files_project_id on public.files (project_id, created_at desc);
create index if not exists idx_files_folder_id on public.files (folder_id, created_at desc);
create index if not exists idx_files_uploaded_by on public.files (uploaded_by);

-- ---------------------------------------------------------------------------
-- file_requests: client upload request lifecycle
-- ---------------------------------------------------------------------------
create table if not exists public.file_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  folder_id uuid references public.project_folders(id) on delete set null,
  required boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'uploaded', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_file_requests_project_id on public.file_requests (project_id, created_at desc);
create index if not exists idx_file_requests_status on public.file_requests (status, created_at desc);

-- ---------------------------------------------------------------------------
-- approvals: extend existing table with deliverable-specific metadata
-- ---------------------------------------------------------------------------
alter table if exists public.approvals
  add column if not exists file_id uuid references public.files(id) on delete set null,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists approved_at timestamptz;

update public.approvals
set approved_by = reviewed_by
where approved_by is null
  and reviewed_by is not null;

update public.approvals
set approved_at = decided_at
where approved_at is null
  and decided_at is not null;

create index if not exists idx_approvals_file_id on public.approvals (file_id);
create index if not exists idx_approvals_project_status_created
  on public.approvals (project_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- activity_events: human-readable project activity stream
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  type text not null check (
    type in (
      'project_created',
      'file_uploaded',
      'approval_requested',
      'approval_approved',
      'approval_changes',
      'milestone_completed',
      'comment_added'
    )
  ),
  entity_id uuid,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_project_created
  on public.activity_events (project_id, created_at desc);
create index if not exists idx_activity_events_user_created
  on public.activity_events (user_id, created_at desc);
create index if not exists idx_activity_events_type_created
  on public.activity_events (type, created_at desc);

-- ---------------------------------------------------------------------------
-- notifications: preserve existing columns and add requested fields
-- ---------------------------------------------------------------------------
alter table if exists public.notifications
  add column if not exists link text,
  add column if not exists read boolean not null default false;

update public.notifications
set read = is_read
where read is distinct from is_read;

create or replace function public.sync_notifications_read_columns()
returns trigger
language plpgsql
as $$
declare
  v_read boolean;
begin
  v_read := coalesce(new.read, new.is_read, false);
  new.read := v_read;
  new.is_read := v_read;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_notifications_sync_read_columns'
      and tgrelid = 'public.notifications'::regclass
  ) then
    create trigger trg_notifications_sync_read_columns
    before insert or update of read, is_read
    on public.notifications
    for each row
    execute function public.sync_notifications_read_columns();
  end if;
end
$$;

create index if not exists idx_notifications_user_read_created
  on public.notifications (user_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- comments: polymorphic comments on project entities
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null check (entity_type in ('file', 'milestone', 'approval', 'project')),
  entity_id uuid,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_project_created
  on public.comments (project_id, created_at desc);
create index if not exists idx_comments_entity
  on public.comments (entity_type, entity_id, created_at desc);
create index if not exists idx_comments_user_created
  on public.comments (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Client portal access helper + RLS for newly introduced tables
-- ---------------------------------------------------------------------------
create or replace function public.can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.projects p
      where p.id = p_project_id
        and p.client_id = public.my_client_id()
    )
    or exists (
      select 1
      from public.project_members pm
      where pm.project_id = p_project_id
        and pm.user_id = auth.uid()
    );
$$;

alter table public.project_members enable row level security;
alter table public.project_folders enable row level security;
alter table public.files enable row level security;
alter table public.file_requests enable row level security;
alter table public.activity_events enable row level security;
alter table public.comments enable row level security;

drop policy if exists "project_members_admin_all" on public.project_members;
create policy "project_members_admin_all"
on public.project_members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "project_members_select_own" on public.project_members;
create policy "project_members_select_own"
on public.project_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "project_folders_admin_all" on public.project_folders;
create policy "project_folders_admin_all"
on public.project_folders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "project_folders_select_access" on public.project_folders;
create policy "project_folders_select_access"
on public.project_folders
for select
to authenticated
using (public.can_access_project(project_id));

drop policy if exists "files_admin_all" on public.files;
create policy "files_admin_all"
on public.files
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "files_select_access" on public.files;
create policy "files_select_access"
on public.files
for select
to authenticated
using (public.can_access_project(project_id));

drop policy if exists "files_insert_access" on public.files;
create policy "files_insert_access"
on public.files
for insert
to authenticated
with check (public.can_access_project(project_id));

drop policy if exists "file_requests_admin_all" on public.file_requests;
create policy "file_requests_admin_all"
on public.file_requests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "file_requests_select_access" on public.file_requests;
create policy "file_requests_select_access"
on public.file_requests
for select
to authenticated
using (public.can_access_project(project_id));

drop policy if exists "file_requests_update_access" on public.file_requests;
create policy "file_requests_update_access"
on public.file_requests
for update
to authenticated
using (public.can_access_project(project_id))
with check (public.can_access_project(project_id));

drop policy if exists "activity_events_admin_all" on public.activity_events;
create policy "activity_events_admin_all"
on public.activity_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "activity_events_select_access" on public.activity_events;
create policy "activity_events_select_access"
on public.activity_events
for select
to authenticated
using (public.can_access_project(project_id));

drop policy if exists "activity_events_insert_access" on public.activity_events;
create policy "activity_events_insert_access"
on public.activity_events
for insert
to authenticated
with check (public.can_access_project(project_id));

drop policy if exists "comments_admin_all" on public.comments;
create policy "comments_admin_all"
on public.comments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "comments_select_access" on public.comments;
create policy "comments_select_access"
on public.comments
for select
to authenticated
using (public.can_access_project(project_id));

drop policy if exists "comments_insert_access" on public.comments;
create policy "comments_insert_access"
on public.comments
for insert
to authenticated
with check (public.can_access_project(project_id));

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own"
on public.comments
for update
to authenticated
using (user_id = auth.uid() and public.can_access_project(project_id))
with check (user_id = auth.uid() and public.can_access_project(project_id));

-- ---------------------------------------------------------------------------
-- Storage bucket: ensure project-files bucket exists for structured uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do update set public = excluded.public;

-- Supports project-files/{project_id}/{folder_id}/file.ext in addition to legacy paths.
drop policy if exists "storage_client_select_by_project" on storage.objects;
create policy "storage_client_select_by_project"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and (storage.foldername(name))[1] is not null
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_access_project(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_client_insert_by_project" on storage.objects;
create policy "storage_client_insert_by_project"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and (storage.foldername(name))[1] is not null
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_access_project(((storage.foldername(name))[1])::uuid)
);

commit;
