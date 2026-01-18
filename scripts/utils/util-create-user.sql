-- Utility: Create an application user (public.users) marked as confirmed
-- Notes:
-- - This creates the app-level user row only. To enable login, also create an auth user via Supabase Admin API and link its id to public.users.auth_id (see util-link-auth-to-user-by-email.sql).
-- Usage:
--   1) Set the values in the vars CTE below
--   2) Run this script in Supabase SQL editor or CLI

WITH vars AS (
  SELECT
    'user@example.com'::text    AS email,
    'Full Name'::text           AS full_name,
    'DisplayName'::text         AS display_name,
    'https://example.com/a.png'::text AS avatar_url,
    NULL::uuid                  AS auth_id -- optionally paste an auth.users.id here if already created
)
INSERT INTO public.users (email, full_name, display_name, avatar_url, auth_id, email_confirmed_at)
SELECT
  vars.email,
  vars.full_name,
  vars.display_name,
  vars.avatar_url,
  vars.auth_id,
  NOW()
FROM vars
RETURNING *;
