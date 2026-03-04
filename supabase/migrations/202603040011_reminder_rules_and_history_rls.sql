alter table public.reminder_rules enable row level security;
alter table public.reminder_history enable row level security;

drop policy if exists "reminder_rules_admin_all" on public.reminder_rules;
create policy "reminder_rules_admin_all"
on public.reminder_rules
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reminder_history_admin_select" on public.reminder_history;
create policy "reminder_history_admin_select"
on public.reminder_history
for select
to authenticated
using (public.is_admin());
