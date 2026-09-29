-- Cascade schema for Supabase. Run once in the Supabase SQL editor.
-- Admin email below becomes the team admin when it first signs up.

create table teams (id uuid primary key default gen_random_uuid(), name text not null, admin_user_id uuid);
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null, email text not null,
  role text not null default 'member' check (role in ('member','admin')),
  team_id uuid references teams(id) on delete set null);
create table team_invites (email text primary key, team_id uuid not null references teams(id) on delete cascade);
create table projects (
  id uuid primary key default gen_random_uuid(), name text not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  color text default '#D8FF48', archived boolean not null default false);
create table goals (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text not null default '',
  level text not null check (level in ('yearly','monthly','weekly','daily')),
  parent_goal_id uuid references goals(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','done','blocked')),
  target_date date, progress int not null default 0,
  archived boolean not null default false, override boolean not null default false,
  completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on goals (owner_id); create index on goals (parent_goal_id);
create table checkins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  note text not null default '', confidence_rating int check (confidence_rating between 1 and 5),
  created_at timestamptz not null default now());
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  start_time timestamptz not null, end_time timestamptz,
  duration_minutes int not null, note text not null default '');
create index on time_entries (user_id, start_time);
create table templates (
  id uuid primary key default gen_random_uuid(), name text not null,
  owner_id uuid not null references profiles(id) on delete cascade, tree jsonb not null);
create table daily_stats (
  user_id uuid not null references profiles(id) on delete cascade, date date not null,
  total_minutes numeric not null default 0, tasks_completed int not null default 0, goals_touched int not null default 0,
  primary key (user_id, date));

-- helpers (security definer so policies can read profiles without recursion)
create function public.my_team() returns uuid language sql stable security definer set search_path = public
  as $$ select team_id from profiles where id = auth.uid() $$;
create function public.is_admin() returns boolean language sql stable security definer set search_path = public
  as $$ select coalesce((select role = 'admin' from profiles where id = auth.uid()), false) $$;
create function public.same_team(uid uuid) returns boolean language sql stable security definer set search_path = public
  as $$ select my_team() is not null and exists (select 1 from profiles where id = uid and team_id = my_team()) $$;

-- new-user hook: admin email creates/owns the team; invited emails join it
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare tid uuid; r text := 'member';
begin
  if lower(new.email) = 'ishitechagency.io@gmail.com' then
    r := 'admin';
    select id into tid from teams limit 1;
    if tid is null then insert into teams (name, admin_user_id) values ('Ishiaqtech', new.id) returning id into tid; end if;
  else
    select team_id into tid from team_invites where email = lower(new.email);
  end if;
  insert into profiles (id, name, email, role, team_id)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)), new.email, r, tid);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- invited after signing up? claim on next login
create function public.claim_team() returns void language sql security definer set search_path = public as $$
  update profiles p set team_id = i.team_id from team_invites i
  where p.id = auth.uid() and p.team_id is null and i.email = lower(p.email) $$;
create function public.remove_member(target uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if is_admin() and same_team(target) and target <> auth.uid() then
    delete from team_invites where email = (select lower(email) from profiles where id = target);
    update profiles set team_id = null where id = target;
  end if;
end $$;
revoke all on function my_team(), is_admin(), same_team(uuid), claim_team(), remove_member(uuid) from public;
grant execute on function my_team(), is_admin(), same_team(uuid), claim_team(), remove_member(uuid) to authenticated;

-- row level security
alter table teams enable row level security; alter table profiles enable row level security;
alter table team_invites enable row level security; alter table projects enable row level security;
alter table goals enable row level security; alter table checkins enable row level security;
alter table time_entries enable row level security; alter table templates enable row level security;
alter table daily_stats enable row level security;

create policy teams_read on teams for select to authenticated using (id = my_team());
create policy profiles_read on profiles for select to authenticated
  using (id = auth.uid() or (my_team() is not null and team_id = my_team()));
create policy invites_admin on team_invites for all to authenticated
  using (is_admin() and team_id = my_team()) with check (is_admin() and team_id = my_team());
create policy projects_read on projects for select to authenticated
  using (owner_id = auth.uid() or (team_id is not null and team_id = my_team()));
create policy projects_write on projects for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and (team_id is null or team_id = my_team()));
-- goals: owners see everything of theirs; team admin sees only yearly/monthly of team members (never weekly/daily)
create policy goals_read on goals for select to authenticated
  using (owner_id = auth.uid() or (is_admin() and level in ('yearly','monthly') and same_team(owner_id)));
create policy goals_write on goals for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy checkins_own on checkins for all to authenticated
  using (exists (select 1 from goals g where g.id = goal_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from goals g where g.id = goal_id and g.owner_id = auth.uid()));
create policy entries_read on time_entries for select to authenticated
  using (user_id = auth.uid() or (is_admin() and same_team(user_id)));
create policy entries_write on time_entries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy templates_own on templates for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy stats_read on daily_stats for select to authenticated
  using (user_id = auth.uid() or (is_admin() and same_team(user_id)));
create policy stats_write on daily_stats for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
