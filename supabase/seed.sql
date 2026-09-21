-- Idempotent fictional data for the LVAEP demo.

begin;

insert into public.tutors (id, name, email) values
  ('tutor-elena', 'Elena Martínez', 'elena@example.org'),
  ('tutor-daniel', 'Daniel Kim', 'daniel@example.org'),
  ('tutor-nia', 'Nia Brooks', 'nia@example.org')
on conflict (id) do nothing;

insert into public.students (id, name, tutoring_site, status) values
  ('student-camila', 'Camila R.', 'Washington Heights Library', 'active'),
  ('student-malik', 'Malik T.', 'Harlem Community Center', 'active'),
  ('student-sofia', 'Sofía A.', 'Washington Heights Library', 'active'),
  ('student-james', 'James W.', 'Inwood Learning Hub', 'active'),
  ('student-ana', 'Ana P.', 'Harlem Community Center', 'stopped')
on conflict (id) do nothing;

insert into public.assignments
  (id, tutor_id, student_id, term_label, start_date, end_date)
values
  ('assignment-1', 'tutor-elena', 'student-camila', 'Fall term', (date_trunc('month', current_date) - interval '1 month' + interval '2 days')::date, null),
  ('assignment-2', 'tutor-elena', 'student-sofia', 'Fall term', (date_trunc('month', current_date) - interval '1 month' + interval '2 days')::date, null),
  ('assignment-3', 'tutor-daniel', 'student-malik', 'Fall term', (date_trunc('month', current_date) - interval '1 month' + interval '2 days')::date, null),
  ('assignment-4', 'tutor-nia', 'student-james', 'Fall term', (date_trunc('month', current_date) - interval '1 month' + interval '2 days')::date, null),
  ('assignment-5', 'tutor-daniel', 'student-ana', 'Fall term', (date_trunc('month', current_date) - interval '1 month' + interval '2 days')::date, (date_trunc('month', current_date) - interval '1 month' + interval '21 days')::date)
on conflict (id) do nothing;

insert into public.sessions
  (id, assignment_id, session_date, duration_minutes, notes, created_at)
values
  ('session-1', 'assignment-1', least(current_date, date_trunc('month', current_date)::date + 1), 90, 'Reading comprehension and vocabulary practice.', now() - interval '8 days'),
  ('session-2', 'assignment-3', least(current_date, date_trunc('month', current_date)::date + 3), 60, 'Reviewed fractions and word problems.', now() - interval '7 days'),
  ('session-3', 'assignment-2', least(current_date, date_trunc('month', current_date)::date + 6), 75, 'Conversation practice and school forms.', now() - interval '6 days'),
  ('session-4', 'assignment-4', least(current_date, date_trunc('month', current_date)::date + 8), 120, 'GED math preparation.', now() - interval '5 days'),
  ('session-5', 'assignment-1', least(current_date, date_trunc('month', current_date)::date + 10), 90, 'Drafted and revised a short essay.', now() - interval '4 days'),
  ('session-6', 'assignment-3', least(current_date, date_trunc('month', current_date)::date + 13), 60, 'Percentages and household budgeting.', now() - interval '3 days'),
  ('session-7', 'assignment-2', least(current_date, date_trunc('month', current_date)::date + 15), 75, 'Workplace vocabulary and pronunciation.', now() - interval '2 days'),
  ('session-8', 'assignment-4', least(current_date, date_trunc('month', current_date)::date + 17), 90, 'Practice test and review.', now() - interval '1 day'),
  ('session-9', 'assignment-1', (date_trunc('month', current_date) - interval '1 month' + interval '11 days')::date, 90, null, now() - interval '35 days'),
  ('session-10', 'assignment-5', (date_trunc('month', current_date) - interval '1 month' + interval '17 days')::date, 60, null, now() - interval '30 days'),
  ('session-11', 'assignment-3', (date_trunc('month', current_date) - interval '1 month' + interval '19 days')::date, 75, null, now() - interval '28 days')
on conflict (id) do nothing;

insert into public.goals
  (id, student_id, title, category, status, created_at, completed_at)
values
  ('goal-1', 'student-camila', 'Write a five-paragraph personal essay', 'educational', 'in_progress', now() - interval '45 days', null),
  ('goal-2', 'student-malik', 'Create and follow a monthly budget', 'economic', 'in_progress', now() - interval '45 days', null),
  ('goal-3', 'student-sofia', 'Complete school enrollment forms independently', 'family', 'completed', now() - interval '45 days', now() - interval '10 days'),
  ('goal-4', 'student-james', 'Pass the GED mathematics practice test', 'educational', 'in_progress', now() - interval '45 days', null),
  ('goal-5', 'student-camila', 'Join a neighborhood reading group', 'community', 'completed', now() - interval '45 days', now() - interval '7 days'),
  ('goal-6', 'student-ana', 'Build confidence using online services', 'other', 'in_progress', now() - interval '45 days', null)
on conflict (id) do nothing;

commit;
