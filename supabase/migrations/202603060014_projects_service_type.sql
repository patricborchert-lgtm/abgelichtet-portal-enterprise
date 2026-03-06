alter table if exists public.projects
add column if not exists service_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_service_type_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_service_type_check
      check (
        service_type is null
        or service_type in (
          'webdesign',
          'seo',
          'fotografie',
          'branding',
          'marketing',
          'social_media',
          'video'
        )
      );
  end if;
end
$$;

comment on column public.projects.service_type is
  'Optional service type for template-driven project setup.';
