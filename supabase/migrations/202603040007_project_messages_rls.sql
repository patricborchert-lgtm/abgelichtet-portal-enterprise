alter table public.messages enable row level security;

drop policy if exists "messages_admin_all" on public.messages;
create policy "messages_admin_all"
on public.messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
on public.messages
for select
to authenticated
using (
  project_id in (
    select id
    from public.projects
    where client_id = public.my_client_id()
  )
);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
on public.messages
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
