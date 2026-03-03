alter table storage.objects enable row level security;

drop policy if exists "storage_admin_select" on storage.objects;
create policy "storage_admin_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and public.is_admin()
);

drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and public.is_admin()
);

drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-files'
  and public.is_admin()
);

drop policy if exists "storage_client_select" on storage.objects;
create policy "storage_client_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and (storage.foldername(name))[1] = public.my_client_id()::text
);
