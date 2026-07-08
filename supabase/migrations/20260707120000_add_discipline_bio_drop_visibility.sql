-- Emerald Summit: capture discipline + bio on the profile-setup page,
-- and drop the never-used profile_visibility column.

create type public.user_discipline as enum (
  'techverse',
  'biosphere',
  'imaginex',
  'novasphere',
  'ventureverse',
  'civicverse'
);

comment on type public.user_discipline is
  'One of the six summit disciplines, chosen on the profile-setup page.';

alter table public.users
  add column discipline public.user_discipline,
  add column bio text;

comment on column public.users.discipline is
  'Discipline chosen on the profile-setup page; optional.';

comment on column public.users.bio is
  'Short self-bio from the profile-setup page (client-enforced 30-word limit); optional.';

alter table public.users
  drop constraint users_profile_visibility_object;

alter table public.users
  drop column profile_visibility;
