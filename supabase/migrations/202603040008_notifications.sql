create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null check (type in ('chat_message', 'file_uploaded', 'approval_requested', 'approved', 'changes_requested')),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created_at on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_unread on public.notifications (user_id, is_read, created_at desc);
create index if not exists idx_notifications_project_id on public.notifications (project_id);

create or replace function public.create_project_notification(
  p_project_id uuid,
  p_type text,
  p_title text,
  p_message text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role text;
  v_actor_active boolean;
  v_actor_client_id uuid;
  v_client_id uuid;
  v_inserted_count integer := 0;
begin
  if v_actor_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_type not in ('chat_message', 'file_uploaded', 'approval_requested', 'approved', 'changes_requested') then
    raise exception 'Invalid notification type.';
  end if;

  if coalesce(trim(p_title), '') = '' or coalesce(trim(p_message), '') = '' then
    raise exception 'Notification title and message are required.';
  end if;

  select role, is_active, client_id
  into v_actor_role, v_actor_active, v_actor_client_id
  from public.profiles
  where id = v_actor_id;

  if v_actor_role is null or v_actor_active is not true then
    raise exception 'Profile not active.';
  end if;

  select client_id
  into v_client_id
  from public.projects
  where id = p_project_id;

  if v_client_id is null then
    raise exception 'Project not found.';
  end if;

  if v_actor_role = 'admin' then
    insert into public.notifications (user_id, project_id, type, title, message)
    select p.id, p_project_id, p_type, trim(p_title), trim(p_message)
    from public.profiles p
    where p.role = 'client'
      and p.is_active = true
      and p.client_id = v_client_id;
  elsif v_actor_role = 'client' then
    if v_actor_client_id is null or v_actor_client_id <> v_client_id then
      raise exception 'Not allowed.';
    end if;

    insert into public.notifications (user_id, project_id, type, title, message)
    select p.id, p_project_id, p_type, trim(p_title), trim(p_message)
    from public.profiles p
    where p.role = 'admin'
      and p.is_active = true;
  else
    raise exception 'Unsupported role.';
  end if;

  get diagnostics v_inserted_count = row_count;
  return v_inserted_count;
end;
$$;

revoke all on function public.create_project_notification(uuid, text, text, text) from public;
grant execute on function public.create_project_notification(uuid, text, text, text) to authenticated;
