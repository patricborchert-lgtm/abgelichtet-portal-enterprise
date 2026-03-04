alter table public.approvals
  add column if not exists step_key text not null default 'final_project'
    check (step_key in ('design_proposal', 'revision_round', 'pre_go_live', 'final_project')),
  add column if not exists step_label text,
  add column if not exists step_round integer not null default 1
    check (step_round > 0);

update public.approvals
set step_label = case step_key
  when 'design_proposal' then 'Design-Vorschlag'
  when 'revision_round' then 'Änderungsrunde'
  when 'pre_go_live' then 'Vor Go Live'
  else 'Finale Projektabnahme'
end
where coalesce(trim(step_label), '') = '';

create index if not exists idx_approvals_project_step_status
  on public.approvals (project_id, step_key, status, created_at desc);
