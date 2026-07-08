-- Track whether the user finished the profile-setup screen.
-- Existing rows (e.g. from the old auto-insert on sign-in) default to false
-- so those users are prompted to complete setup before the home view.

alter table public.users
  add column profile_setup_complete boolean not null default false;

comment on column public.users.profile_setup_complete is
  'Set true when the user submits the profile-setup form; gates the signed-in home view.';
