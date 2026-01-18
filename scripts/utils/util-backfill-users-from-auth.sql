-- Utility: Backfill public.users from existing Supabase auth.users
-- Goal: Recreate app-level user entries for users that already exist in Supabase Auth
-- Notes:
-- - Links by auth_id and email. Skips rows that already exist.
-- - Pulls basic profile fields from auth.users metadata when available.
-- - Marks public.users.email_confirmed_at using auth.users.email_confirmed_at when available, falling back to NOW().
-- Usage:
--   1) Optionally set specific user UUIDs and/or emails in the vars CTE (leave arrays empty to backfill ALL)
--   2) Run this script in Supabase SQL editor or CLI

WITH vars AS (
  SELECT 
    ARRAY[]::uuid[] AS user_ids,          -- e.g., ARRAY['uuid-1'::uuid,'uuid-2'::uuid]
    ARRAY[]::text[] AS emails             -- e.g., ARRAY['alice@example.com','bob@example.com']
),
source AS (
  SELECT 
    u.id                                         AS auth_id,
    u.email                                      AS email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name'
    )                                            AS full_name,
    COALESCE(
      u.raw_user_meta_data->>'display_name',
      u.raw_user_meta_data->>'nickname',
      u.raw_user_meta_data->>'name'
    )                                            AS display_name,
    COALESCE(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    )                                            AS avatar_url,
    COALESCE(u.email_confirmed_at, NOW())        AS email_confirmed_at
  FROM auth.users u
  CROSS JOIN vars v
  WHERE 
    (cardinality(v.user_ids) = 0 OR EXISTS (
      SELECT 1 FROM unnest(v.user_ids) AS id WHERE id = u.id
    ))
    AND (cardinality(v.emails) = 0 OR EXISTS (
      SELECT 1 FROM unnest(v.emails) AS em WHERE em = u.email
    ))
),
filtered AS (
  SELECT s.*
  FROM source s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu
    WHERE pu.auth_id = s.auth_id
       OR (s.email IS NOT NULL AND pu.email = s.email)
  )
)
INSERT INTO public.users (auth_id, email, full_name, display_name, avatar_url, email_confirmed_at)
SELECT auth_id, email, full_name, display_name, avatar_url, email_confirmed_at
FROM filtered
RETURNING *;
