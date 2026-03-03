alter table public.milestones enable row level security;
alter table public.timeline_events enable row level security;
alter table public.approvals enable row level security;

drop policy if exists "milestones_admin_all" on public.milestones;
create policy "milestones_admin_all"
on public.milestones
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "milestones_select_own" on public.milestones;
create policy "milestones_select_own"
on public.milestones
for select
to authenticated
using (
  project_id in (
    select id
    from public.projects
    where client_id = public.my_client_id()
  )
);

drop policy if exists "timeline_events_admin_all" on public.timeline_events;
create policy "timeline_events_admin_all"
on public.timeline_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "timeline_events_select_own" on public.timeline_events;
create policy "timeline_events_select_own"
on public.timeline_events
for select
to authenticated
using (
  project_id in (
    select id
    from public.projects
    where client_id = public.my_client_id()
  )
);

drop policy if exists "timeline_events_insert_own" on public.timeline_events;
create policy "timeline_events_insert_own"
on public.timeline_events
for insert
to authenticated
with check (
  author_id = auth.uid()
  and project_id in (
    select id
    from public.projects
    where client_id = public.my_client_id()
  )
);

drop policy if exists "approvals_admin_all" on public.approvals;
create policy "approvals_admin_all"
on public.approvals
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "approvals_select_own" on public.approvals;
create policy "approvals_select_own"
on public.approvals
for select
to authenticated
using (
  project_id in (
    select id
    from public.projects
    where client_id = public.my_client_id()
  )
);
