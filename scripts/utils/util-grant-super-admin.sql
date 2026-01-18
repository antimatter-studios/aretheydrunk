-- Utility: Grant super_admin to a user by UUID
-- Usage:
--   1) Set the USER_UUID_HERE below, or edit just this one line before running
--   2) Run this script via Supabase SQL editor or CLI

WITH vars AS (
  SELECT 'USER_UUID_HERE'::uuid AS user_id
)
INSERT INTO public.user_capabilities (user_id, capability_id, scope_type, scope_id)
SELECT vars.user_id, caps.id, NULL, NULL
FROM vars
JOIN public.capabilities caps ON caps.name = 'super_admin'
ON CONFLICT (user_id, capability_id, scope_type, scope_id) DO NOTHING;
