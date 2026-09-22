-- Final security posture for the public, unauthenticated take-home demo.
-- RLS limits each operation explicitly. Column privileges prevent anonymous
-- goal updates from changing fields other than status and completed_at.

begin;

alter table public.tutors enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.sessions enable row level security;
alter table public.goals enable row level security;

-- Reset privileges granted by earlier migrations and any Supabase defaults.
revoke all privileges on table public.tutors from anon, authenticated;
revoke all privileges on table public.students from anon, authenticated;
revoke all privileges on table public.assignments from anon, authenticated;
revoke all privileges on table public.sessions from anon, authenticated;
revoke all privileges on table public.goals from anon, authenticated;

-- Explicitly remove possible column-level goal mutation grants before adding
-- back only the two fields used by the completion toggle.
revoke update (
  id,
  student_id,
  title,
  category,
  status,
  created_at,
  completed_at
) on table public.goals from anon, authenticated;

grant select on table public.tutors to anon;
grant select on table public.students to anon;
grant select on table public.assignments to anon;
grant select, insert, delete on table public.sessions to anon;
grant select on table public.goals to anon;
grant update (status, completed_at) on table public.goals to anon;

drop policy if exists "demo anon read tutors" on public.tutors;
create policy "demo anon read tutors"
  on public.tutors
  for select
  to anon
  using (true);

drop policy if exists "demo anon read students" on public.students;
create policy "demo anon read students"
  on public.students
  for select
  to anon
  using (true);

drop policy if exists "demo anon read assignments" on public.assignments;
create policy "demo anon read assignments"
  on public.assignments
  for select
  to anon
  using (true);

drop policy if exists "demo anon read sessions" on public.sessions;
create policy "demo anon read sessions"
  on public.sessions
  for select
  to anon
  using (true);

drop policy if exists "demo anon create sessions" on public.sessions;
create policy "demo anon create sessions"
  on public.sessions
  for insert
  to anon
  with check (true);

drop policy if exists "demo anon delete sessions" on public.sessions;
create policy "demo anon delete sessions"
  on public.sessions
  for delete
  to anon
  using (true);

drop policy if exists "demo anon read goals" on public.goals;
create policy "demo anon read goals"
  on public.goals
  for select
  to anon
  using (true);

drop policy if exists "demo anon toggle goals" on public.goals;
create policy "demo anon toggle goals"
  on public.goals
  for update
  to anon
  using (true)
  with check (
    (status = 'completed' and completed_at is not null)
    or (status = 'in_progress' and completed_at is null)
  );

commit;
