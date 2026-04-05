-- ============================================================
-- EVENT OS — Foundation Migration
-- Organisations, Users, Events, Phases, People
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ORGANISATIONS
-- ============================================================
create table organisations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  plan_tier   text not null default 'entry' check (plan_tier in ('entry', 'growth', 'enterprise')),
  logo_url    text,
  settings    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid references organisations(id) on delete cascade,
  email           text not null,
  full_name       text,
  avatar_url      text,
  role            text not null default 'member' check (role in ('owner', 'admin', 'pm', 'member')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- EVENTS
-- ============================================================
create table events (
  id              uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name            text not null,
  type            text not null default 'conference' check (type in ('conference', 'product_launch', 'summit', 'festival', 'gala', 'workshop', 'other')),
  venue           text,
  start_date      date,
  end_date        date,
  status          text not null default 'planning' check (status in ('planning', 'pre_production', 'build', 'rehearsal', 'live', 'strike', 'closed')),
  current_phase   text,
  description     text,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- PHASES (pre-populated from event archetypes)
-- ============================================================
create table phases (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events(id) on delete cascade,
  name        text not null,
  order_index integer not null default 0,
  start_date  date,
  end_date    date,
  status      text not null default 'pending' check (status in ('pending', 'active', 'complete')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- PEOPLE (team members, contractors, external)
-- ============================================================
create table people (
  id                 uuid primary key default uuid_generate_v4(),
  organisation_id    uuid not null references organisations(id) on delete cascade,
  user_id            uuid references users(id) on delete set null,
  full_name          text not null,
  email              text,
  phone              text,
  role               text,
  department         text check (department in ('stage', 'av', 'hospitality', 'security', 'media', 'ops', 'production', 'other')),
  accreditation_tier text,
  is_external        boolean not null default false,
  availability_notes text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references events(id) on delete cascade,
  phase_id      uuid references phases(id) on delete set null,
  title         text not null,
  description   text,
  owner_id      uuid references people(id) on delete set null,
  due_date      date,
  status        text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority      text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  is_critical_path boolean not null default false,
  depends_on    uuid references tasks(id) on delete set null,
  created_by    uuid references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- SHIFTS
-- ============================================================
create table shifts (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references events(id) on delete cascade,
  person_id     uuid not null references people(id) on delete cascade,
  department    text check (department in ('stage', 'av', 'hospitality', 'security', 'media', 'ops', 'production', 'other')),
  shift_date    date not null,
  start_time    time not null,
  end_time      time not null,
  role_note     text,
  zone_id       uuid, -- FK added in Module 4 migration
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint shifts_times_check check (end_time > start_time)
);

-- ============================================================
-- ACTIVITY THREADS
-- ============================================================
create table activity_threads (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references events(id) on delete cascade,
  owner_id      uuid not null references people(id) on delete cascade,
  title         text not null,
  status        text not null default 'in_progress' check (status in ('in_progress', 'waiting', 'blocked', 'resolved')),
  linked_task_id uuid references tasks(id) on delete set null,
  linked_vendor_id uuid, -- FK added in Module 2 migration
  urgency_level text not null default 'low' check (urgency_level in ('low', 'medium', 'high', 'critical')),
  sentiment     text not null default 'neutral' check (sentiment in ('escalating', 'neutral', 'resolving')),
  is_silent     boolean not null default false,
  last_entry_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- THREAD ENTRIES (log entries — triggers AI analysis)
-- ============================================================
create table thread_entries (
  id                  uuid primary key default uuid_generate_v4(),
  thread_id           uuid not null references activity_threads(id) on delete cascade,
  author_id           uuid references users(id) on delete set null,
  content             text not null,
  ai_urgency          text check (ai_urgency in ('low', 'medium', 'high', 'critical')),
  ai_sentiment        text check (ai_sentiment in ('escalating', 'neutral', 'resolving')),
  ai_suggested_action text,
  ai_risk_keywords    text[],
  ai_escalate         boolean,
  ai_processed        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- STANDUP ENTRIES
-- ============================================================
create table standup_entries (
  id              uuid primary key default uuid_generate_v4(),
  event_id        uuid not null references events(id) on delete cascade,
  person_id       uuid not null references people(id) on delete cascade,
  entry_date      date not null default current_date,
  yesterday_text  text,
  today_text      text,
  blocked_text    text,
  created_at      timestamptz not null default now(),
  unique (event_id, person_id, entry_date)
);

-- ============================================================
-- DOCUMENTS (polymorphic — links to task, person, event)
-- ============================================================
create table documents (
  id              uuid primary key default uuid_generate_v4(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  name            text not null,
  file_url        text not null,
  file_type       text,
  file_size_bytes bigint,
  version         integer not null default 1,
  entity_type     text not null check (entity_type in ('event', 'task', 'person', 'vendor', 'phase')),
  entity_id       uuid not null,
  uploaded_by     uuid references users(id),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_events_org on events(organisation_id);
create index idx_events_status on events(status);
create index idx_phases_event on phases(event_id);
create index idx_people_org on people(organisation_id);
create index idx_people_user on people(user_id);
create index idx_tasks_event on tasks(event_id);
create index idx_tasks_owner on tasks(owner_id);
create index idx_tasks_status on tasks(status);
create index idx_shifts_event on shifts(event_id);
create index idx_shifts_person on shifts(person_id);
create index idx_shifts_date on shifts(shift_date);
create index idx_threads_event on activity_threads(event_id);
create index idx_threads_owner on activity_threads(owner_id);
create index idx_threads_status on activity_threads(status);
create index idx_thread_entries_thread on thread_entries(thread_id);
create index idx_standup_event_date on standup_entries(event_id, entry_date);
create index idx_standup_person on standup_entries(person_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_organisations_updated before update on organisations for each row execute function update_updated_at();
create trigger trg_users_updated before update on users for each row execute function update_updated_at();
create trigger trg_events_updated before update on events for each row execute function update_updated_at();
create trigger trg_phases_updated before update on phases for each row execute function update_updated_at();
create trigger trg_people_updated before update on people for each row execute function update_updated_at();
create trigger trg_tasks_updated before update on tasks for each row execute function update_updated_at();
create trigger trg_shifts_updated before update on shifts for each row execute function update_updated_at();
create trigger trg_threads_updated before update on activity_threads for each row execute function update_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table organisations enable row level security;
alter table users enable row level security;
alter table events enable row level security;
alter table phases enable row level security;
alter table people enable row level security;
alter table tasks enable row level security;
alter table shifts enable row level security;
alter table activity_threads enable row level security;
alter table thread_entries enable row level security;
alter table standup_entries enable row level security;
alter table documents enable row level security;

-- Users can only see their own organisation's data
create policy "org_isolation_organisations" on organisations
  for all using (id = (select organisation_id from users where id = auth.uid()));

create policy "org_isolation_users" on users
  for all using (organisation_id = (select organisation_id from users where id = auth.uid()));

create policy "org_isolation_events" on events
  for all using (organisation_id = (select organisation_id from users where id = auth.uid()));

create policy "org_isolation_people" on people
  for all using (organisation_id = (select organisation_id from users where id = auth.uid()));

create policy "event_isolation_phases" on phases
  for all using (event_id in (select id from events where organisation_id = (select organisation_id from users where id = auth.uid())));

create policy "event_isolation_tasks" on tasks
  for all using (event_id in (select id from events where organisation_id = (select organisation_id from users where id = auth.uid())));

create policy "event_isolation_shifts" on shifts
  for all using (event_id in (select id from events where organisation_id = (select organisation_id from users where id = auth.uid())));

create policy "event_isolation_threads" on activity_threads
  for all using (event_id in (select id from events where organisation_id = (select organisation_id from users where id = auth.uid())));

create policy "thread_isolation_entries" on thread_entries
  for all using (thread_id in (
    select id from activity_threads where event_id in (
      select id from events where organisation_id = (select organisation_id from users where id = auth.uid())
    )
  ));

create policy "event_isolation_standups" on standup_entries
  for all using (event_id in (select id from events where organisation_id = (select organisation_id from users where id = auth.uid())));

create policy "org_isolation_documents" on documents
  for all using (organisation_id = (select organisation_id from users where id = auth.uid()));
