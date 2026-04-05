-- ============================================================
-- Fix infinite recursion in users RLS policy
-- The original policy queries `users` to find org_id, which
-- recurses infinitely. Use a SECURITY DEFINER helper function
-- that bypasses RLS to break the cycle.
-- ============================================================

-- Helper: get current user's org_id without triggering RLS
create or replace function get_my_organisation_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id from public.users where id = auth.uid() limit 1;
$$;

-- Drop and recreate the recursive policies
drop policy if exists "org_isolation_organisations" on organisations;
drop policy if exists "org_isolation_users" on users;
drop policy if exists "org_isolation_events" on events;
drop policy if exists "org_isolation_people" on people;
drop policy if exists "event_isolation_phases" on phases;
drop policy if exists "event_isolation_tasks" on tasks;
drop policy if exists "event_isolation_shifts" on shifts;
drop policy if exists "event_isolation_threads" on activity_threads;
drop policy if exists "thread_isolation_entries" on thread_entries;
drop policy if exists "event_isolation_standups" on standup_entries;
drop policy if exists "org_isolation_documents" on documents;

-- Organisations: can see own org
create policy "org_isolation_organisations" on organisations
  for all using (id = get_my_organisation_id());

-- Users: can see own row + others in same org
create policy "org_isolation_users" on users
  for all using (
    id = auth.uid()
    or organisation_id = get_my_organisation_id()
  );

-- Events
create policy "org_isolation_events" on events
  for all using (organisation_id = get_my_organisation_id());

-- People
create policy "org_isolation_people" on people
  for all using (organisation_id = get_my_organisation_id());

-- Phases
create policy "event_isolation_phases" on phases
  for all using (
    event_id in (
      select id from events where organisation_id = get_my_organisation_id()
    )
  );

-- Tasks
create policy "event_isolation_tasks" on tasks
  for all using (
    event_id in (
      select id from events where organisation_id = get_my_organisation_id()
    )
  );

-- Shifts
create policy "event_isolation_shifts" on shifts
  for all using (
    event_id in (
      select id from events where organisation_id = get_my_organisation_id()
    )
  );

-- Activity threads
create policy "event_isolation_threads" on activity_threads
  for all using (
    event_id in (
      select id from events where organisation_id = get_my_organisation_id()
    )
  );

-- Thread entries
create policy "thread_isolation_entries" on thread_entries
  for all using (
    thread_id in (
      select id from activity_threads
      where event_id in (
        select id from events where organisation_id = get_my_organisation_id()
      )
    )
  );

-- Standup entries
create policy "event_isolation_standups" on standup_entries
  for all using (
    event_id in (
      select id from events where organisation_id = get_my_organisation_id()
    )
  );

-- Documents
create policy "org_isolation_documents" on documents
  for all using (organisation_id = get_my_organisation_id());