-- Utility: Grant team_admin to a user for a specific team by UUIDs
-- Usage:
--   1) Set USER_UUID_HERE and TEAM_UUID_HERE below
--   2) Run this script via Supabase SQL editor or CLI

WITH vars AS (
  SELECT 'USER_UUID_HERE'::uuid AS user_id,
         'TEAM_UUID_HERE'::uuid AS team_id
), cap AS (
  SELECT id AS capability_id FROM public.capabilities WHERE name = 'team_admin'
)
INSERT INTO public.user_capabilities (user_id, capability_id, scope_type, scope_id)
SELECT vars.user_id, cap.capability_id, 'team', vars.team_id
FROM vars, cap
ON CONFLICT (user_id, capability_id, scope_type, scope_id) DO NOTHING;
