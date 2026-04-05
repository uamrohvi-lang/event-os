-- ============================================================
-- EVENT OS — Auth trigger: create org + user row on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id  uuid;
  v_org_name text;
begin
  -- Pull org name from user metadata (set during signUp)
  v_org_name := coalesce(
    new.raw_user_meta_data->>'org_name',
    split_part(new.email, '@', 2)
  );

  -- Create organisation
  insert into public.organisations (name)
  values (v_org_name)
  returning id into v_org_id;

  -- Create user profile row
  insert into public.users (id, organisation_id, email, full_name, role)
  values (
    new.id,
    v_org_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'owner'
  );

  return new;
end;
$$;

-- Drop if exists then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();