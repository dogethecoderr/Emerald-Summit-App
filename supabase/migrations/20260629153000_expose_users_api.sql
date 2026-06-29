-- Expose public.users to the Supabase Data API / Table Editor.
-- Required when "Automatically expose new tables" is disabled (recommended).

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.users to anon, authenticated, service_role;

-- Future tables in public still need explicit grants unless auto-expose is enabled.
