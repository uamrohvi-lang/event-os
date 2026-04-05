-- ============================================================
-- EVENT OS — Shift clash detection
-- ============================================================

-- Function: returns overlapping shifts for a person on a given date/time range
create or replace function get_shift_clashes(
  p_person_id  uuid,
  p_shift_date date,
  p_start_time time,
  p_end_time   time,
  p_exclude_id uuid default null
)
returns table (
  id         uuid,
  shift_date date,
  start_time time,
  end_time   time,
  role_note  text,
  event_id   uuid
)
language sql
stable
as $$
  select
    s.id,
    s.shift_date,
    s.start_time,
    s.end_time,
    s.role_note,
    s.event_id
  from shifts s
  where s.person_id   = p_person_id
    and s.shift_date  = p_shift_date
    and s.start_time  < p_end_time
    and s.end_time    > p_start_time
    and (p_exclude_id is null or s.id != p_exclude_id);
$$;