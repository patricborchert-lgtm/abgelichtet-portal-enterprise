create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.my_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id
  from public.profiles
  where id = auth.uid();
$$;

alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.activity_log enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
on public.clients
for select
to authenticated
using (id = public.my_client_id());

drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_admin_all"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
to authenticated
using (client_id = public.my_client_id());

drop policy if exists "project_files_admin_all" on public.project_files;
create policy "project_files_admin_all"
on public.project_files
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "project_files_select_own" on public.project_files;
create policy "project_files_select_own"
on public.project_files
for select
to authenticated
using (
  project_id in (
    select id
    from public.projects
    where client_id = public.my_client_id()
  )
);

drop policy if exists "activity_log_admin_select" on public.activity_log;
create policy "activity_log_admin_select"
on public.activity_log
for select
to authenticated
using (public.is_admin());

drop policy if exists "activity_log_client_select" on public.activity_log;
create policy "activity_log_client_select"
on public.activity_log
for select
to authenticated
using (
  actor_id = auth.uid()
  or metadata ->> 'client_id' = public.my_client_id()::text
);

drop policy if exists "audit_log_admin_select" on public.audit_log;
create policy "audit_log_admin_select"
on public.audit_log
for select
to authenticated
using (public.is_admin());
