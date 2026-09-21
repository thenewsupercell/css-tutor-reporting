-- Trusted internal demo schema. Authentication and RLS are intentionally deferred.
-- Do not use these anonymous grants for production or sensitive data.

create table public.tutors (
  id text primary key,
  name text not null,
  email text not null unique
);

create table public.students (
  id text primary key,
  name text not null,
  tutoring_site text not null,
  status text not null check (status in ('active', 'stopped'))
);

create table public.assignments (
  id text primary key,
  tutor_id text not null references public.tutors(id),
  student_id text not null references public.students(id),
  term_label text not null,
  start_date date not null,
  end_date date,
  check (end_date is null or end_date >= start_date)
);

create table public.sessions (
  id text primary key,
  assignment_id text not null references public.assignments(id),
  session_date date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  notes text,
  created_at timestamptz not null default now()
);

create table public.goals (
  id text primary key,
  student_id text not null references public.students(id),
  title text not null,
  category text not null check (
    category in ('economic', 'educational', 'family', 'community', 'other')
  ),
  status text not null check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (
    (status = 'completed' and completed_at is not null)
    or (status = 'in_progress' and completed_at is null)
  )
);

create index assignments_tutor_id_idx on public.assignments(tutor_id);
create index assignments_student_id_idx on public.assignments(student_id);
create index sessions_assignment_id_idx on public.sessions(assignment_id);
create index sessions_session_date_idx on public.sessions(session_date);
create index goals_student_id_idx on public.goals(student_id);

alter table public.tutors disable row level security;
alter table public.students disable row level security;
alter table public.assignments disable row level security;
alter table public.sessions disable row level security;
alter table public.goals disable row level security;

revoke all on table public.tutors from anon, authenticated;
revoke all on table public.students from anon, authenticated;
revoke all on table public.assignments from anon, authenticated;
revoke all on table public.sessions from anon, authenticated;
revoke all on table public.goals from anon, authenticated;

grant select on table public.tutors to anon;
grant select on table public.students to anon;
grant select on table public.assignments to anon;
grant select, insert, delete on table public.sessions to anon;
grant select on table public.goals to anon;
