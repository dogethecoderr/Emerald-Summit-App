-- Emerald Summit: users table and row-level security
-- Spec fields: id, name, role, email, phone, profile_visibility, checked_in_at

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.user_role as enum (
  'participant',
  'ambassador',
  'expert',
  'admin',
  'visitor'
);

comment on type public.user_role is
  'App role chosen at sign-in; enforced by RLS across all tables.';

-- ---------------------------------------------------------------------------
-- Generic trigger helper (no table dependencies)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role public.user_role not null,
  email text not null,
  phone text,
  profile_visibility jsonb not null default '{}'::jsonb,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint users_email_unique unique (email),
  constraint users_name_not_empty check (char_length(trim(name)) > 0),
  constraint users_profile_visibility_object
    check (jsonb_typeof(profile_visibility) = 'object')
);

comment on table public.users is
  'All app users across every role (participant, ambassador, expert, admin, visitor).';

comment on column public.users.role is
  'Role selected at sign-in; ambassador/expert elevated by admin as needed.';

comment on column public.users.profile_visibility is
  'Per-field, per-audience visibility (public, ambassadors-only, private).';

comment on column public.users.checked_in_at is
  'Set by admins during front-desk check-in on summit day.';

create index users_role_idx on public.users (role);
create index users_email_idx on public.users (email);
create index users_checked_in_at_idx on public.users (checked_in_at)
  where checked_in_at is not null;

-- ---------------------------------------------------------------------------
-- Helpers (must be created after public.users exists)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'Returns true when the authenticated user has the admin role.';

-- Prevent non-admins from escalating privileges or self check-in.
create or replace function public.enforce_users_update_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = new.id and not public.is_admin() then
    if new.role = 'admin'::public.user_role then
      raise exception 'Cannot self-assign admin role';
    end if;

    if new.role is distinct from old.role then
      raise exception 'Cannot change role; contact an admin';
    end if;

    if new.checked_in_at is distinct from old.checked_in_at then
      raise exception 'Cannot self check-in; see an admin at the front desk';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

create trigger users_enforce_update_rules
  before update on public.users
  for each row
  execute function public.enforce_users_update_rules();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;

-- Sign-up: user creates their own profile with a non-admin role.
create policy "users_insert_own"
  on public.users
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and role in (
      'participant'::public.user_role,
      'ambassador'::public.user_role,
      'expert'::public.user_role,
      'visitor'::public.user_role
    )
  );

-- Users can read their own full record.
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

-- Admins can read every user (check-in dashboard, people management).
create policy "users_select_admin"
  on public.users
  for select
  to authenticated
  using (public.is_admin());

-- Authenticated users can browse the directory (team formation, contact cards).
-- Sensitive fields are gated by profile_visibility in the app layer.
create policy "users_select_directory"
  on public.users
  for select
  to authenticated
  using (auth.uid() is not null);

-- Users can update their own profile (name, phone, profile_visibility).
-- Role and check-in changes are blocked by enforce_users_update_rules trigger.
create policy "users_update_own"
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can update any user (check-in, role promotion, corrections).
create policy "users_update_admin"
  on public.users
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete users when needed (e.g. duplicate accounts).
create policy "users_delete_admin"
  on public.users
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants (expose table to Supabase Data API / Table Editor)
-- Required when "Automatically expose new tables" is disabled.
-- RLS policies still enforce access for anon/authenticated roles.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.users to anon, authenticated, service_role;
