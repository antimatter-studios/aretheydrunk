-- Utility: Grant team_member to a user for a specific team by UUIDs
-- Usage:
--   1) Set USER_UUID_HERE, TEAM_UUID_HERE, and CAP_NAME below
--   2) Run this script via Supabase SQL editor or CLI

-- Note: CTEs (WITH ...) are scoped per statement in Postgres. To have
-- script-wide variables without duplication, we chain both inserts into a
-- single statement using multiple CTEs.

WITH
  vars AS (
    SELECT 'USER_UUID_HERE'::uuid AS user_id,
           'TEAM_UUID_HERE'::uuid AS team_id
  ),
  cap AS (
    SELECT id AS capability_id FROM public.capabilities WHERE name = 'CAP_NAME'
  ),
  ins_membership AS (
    INSERT INTO public.team_memberships (team_id, user_id, status, accepted_at, joined_at)
    SELECT v.team_id, v.user_id, 'active', NOW(), NOW()
    FROM vars v
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
INSERT INTO public.user_capabilities (user_id, capability_id, scope_type, scope_id)
SELECT v.user_id, c.capability_id, 'team', v.team_id
FROM vars v, cap c
ON CONFLICT (user_id, capability_id, scope_type, scope_id) DO NOTHING;
