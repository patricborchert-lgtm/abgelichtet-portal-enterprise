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
  v_step_key text;
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

  select project_id, step_key
  into v_project_id, v_step_key
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

  if p_status = 'approved' and v_step_key = 'final_project' then
    update public.projects
    set status = 'archived'
    where id = v_project_id;
  end if;
end;
$$;

revoke all on function public.respond_to_project_approval(uuid, text, text) from public;
grant execute on function public.respond_to_project_approval(uuid, text, text) to authenticated;
