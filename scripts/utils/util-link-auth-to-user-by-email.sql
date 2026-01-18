-- Utility: Link an existing Supabase auth user to an app user by email and mark confirmed
-- Notes:
-- - Create the auth user via Supabase Dashboard or Admin API first (recommended)
-- - This script links auth.users.id to public.users.auth_id and sets email_confirmed_at
-- Usage:
--   1) Set EMAIL_HERE in the vars CTE
--   2) Run this script in Supabase SQL editor or CLI

WITH vars AS (
  SELECT 'user@example.com'::text AS email
), auth_row AS (
  SELECT id
  FROM auth.users
  WHERE email = (SELECT email FROM vars)
  LIMIT 1
), app_user AS (
  SELECT id
  FROM public.users
  WHERE email = (SELECT email FROM vars)
  LIMIT 1
)
UPDATE public.users u
SET auth_id = (SELECT id FROM auth_row),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE u.id = (SELECT id FROM app_user)
RETURNING *;
