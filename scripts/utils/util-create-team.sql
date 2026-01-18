-- Utility: Create a team with provided name and slug
-- Usage:
--   1) Set TEAM_NAME_HERE and TEAM_SLUG_HERE below
--   2) Run this script via Supabase SQL editor or CLI

WITH vars AS (
  SELECT 'TEAM_NAME_HERE'::text AS team_name,
         'TEAM_SLUG_HERE'::text AS team_slug
)
INSERT INTO public.team (name, slug)
SELECT vars.team_name, vars.team_slug
FROM vars
RETURNING *;
