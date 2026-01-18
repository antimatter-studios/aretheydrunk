-- ============================================
-- DROP ALL TABLES - Run this to reset the database
-- ============================================
-- WARNING: This will delete ALL data!

-- Drop RLS policies (for compatibility when dropping tables)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'votes',
        'party_attendees',
        'party_join_requests',
        'party',
        'team_memberships',
        'users',
        'team',
        'capabilities',
        'user_capabilities'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END$$;

-- Disable RLS on these tables to avoid dependency issues
ALTER TABLE IF EXISTS public.votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.party_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.party_join_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.party DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.capabilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_capabilities DISABLE ROW LEVEL SECURITY;

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.party_attendees CASCADE;
DROP TABLE IF EXISTS public.party_join_requests CASCADE;
DROP TABLE IF EXISTS public.party CASCADE;
DROP TABLE IF EXISTS public.team_memberships CASCADE;
DROP TABLE IF EXISTS public.user_capabilities CASCADE;
DROP TABLE IF EXISTS public.capabilities CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.team CASCADE;
