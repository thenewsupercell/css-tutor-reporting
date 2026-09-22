-- Milestone 5: allow the trusted anonymous demo client to toggle goal status.
-- Authentication and RLS remain intentionally deferred for this take-home.

grant update on table public.goals to anon;
