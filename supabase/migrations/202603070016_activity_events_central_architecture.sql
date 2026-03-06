begin;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  type text not null,
  entity_type text,
  entity_id uuid,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table if exists public.activity_events
  add column if not exists entity_type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.activity_events
set metadata = '{}'::jsonb
where metadata is null;

do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.activity_events'::regclass
      and c.contype = 'c'
      and exists (
        select 1
        from unnest(c.conkey) as ck(attnum)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = ck.attnum
        where a.attname = 'type'
      )
      and c.conname <> 'activity_events_type_check_v2'
  loop
    execute format('alter table public.activity_events drop constraint if exists %I', v_constraint.conname);
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.activity_events'::regclass
      and conname = 'activity_events_type_check_v2'
  ) then
    alter table public.activity_events
      add constraint activity_events_type_check_v2
      check (
        type in (
          'project_created',
          'file_uploaded',
          'file_request_created',
          'file_request_uploaded',
          'approval_requested',
          'approval_approved',
          'approval_changes_requested',
          'approval_changes',
          'milestone_completed',
          'comment_added',
          'client_invited'
        )
      );
  end if;
end
$$;

create index if not exists idx_activity_events_project_created
  on public.activity_events (project_id, created_at desc);
create index if not exists idx_activity_events_user_created
  on public.activity_events (user_id, created_at desc);
create index if not exists idx_activity_events_type_created
  on public.activity_events (type, created_at desc);
create index if not exists idx_activity_events_entity_lookup
  on public.activity_events (entity_type, entity_id, created_at desc);

commit;
