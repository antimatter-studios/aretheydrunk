SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE OR REPLACE FUNCTION "public"."current_user_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    SET "row_security" TO 'off'
    AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid();
$$;

ALTER FUNCTION "public"."current_user_id"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."generate_party_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_slug TEXT;
  random_suffix TEXT;
BEGIN
  -- Generate base slug from party name
  base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Explicitly ensure random suffix is lowercase
  random_suffix := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
  
  -- Combine base slug with random suffix
  NEW.slug := base_slug || '-' || random_suffix;
  
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."generate_party_slug"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."generate_team_slug"("team_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_slug TEXT;
  random_suffix TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(team_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Explicitly ensure random suffix is lowercase
  random_suffix := lower(substr(md5(random()::text), 1, 6));
  
  RETURN base_slug || '-' || random_suffix;
END;
$$;

ALTER FUNCTION "public"."generate_team_slug"("team_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_team_members"("p_team_id" "uuid") RETURNS TABLE("membership_id" "uuid", "user_id" "uuid", "role" "text", "full_name" "text", "display_name" "text", "email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id as membership_id,
    tm.user_id,
    tm.role,
    u.full_name,
    u.display_name,
    u.email
  FROM team_memberships tm
  INNER JOIN users u ON u.id = tm.user_id
  WHERE tm.team_id = p_team_id 
    AND tm.status = 'active'
  ORDER BY tm.created_at;
END;
$$;

ALTER FUNCTION "public"."get_team_members"("p_team_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_team_id UUID;
  team_name_val TEXT;
  confirm_code_val TEXT;
BEGIN
  -- Get team name and confirm code from user metadata
  team_name_val := COALESCE(NEW.raw_user_meta_data->>'team_name', 'My Team');
  confirm_code_val := NEW.raw_user_meta_data->>'confirm_code';
  
  -- Create a new team
  INSERT INTO team (name)
  VALUES (team_name_val)
  RETURNING id INTO new_team_id;
  
  -- Create the user with confirm_code
  INSERT INTO users (id, auth_id, email, full_name, confirm_code)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    confirm_code_val
  );
  
  -- Create the team membership as admin
  INSERT INTO team_memberships (team_id, user_id, role, status, accepted_at)
  VALUES (new_team_id, (SELECT id FROM users WHERE auth_id = NEW.id), 'admin', 'active', NOW());
  
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increment_attendee_votes"("p_attendee_id" "uuid", "p_column_name" "text", "p_voter_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert the vote record
  INSERT INTO public.votes (attendee_id, is_drunk, voter_id, created_at)
  VALUES (
    p_attendee_id, 
    p_column_name = 'drunk_votes',
    p_voter_id,
    NOW()
  );
  
  -- Update the count
  IF p_column_name = 'drunk_votes' THEN
    UPDATE public.party_attendees SET drunk_votes = COALESCE(drunk_votes, 0) + 1 WHERE id = p_attendee_id;
  ELSIF p_column_name = 'sober_votes' THEN
    UPDATE public.party_attendees SET sober_votes = COALESCE(sober_votes, 0) + 1 WHERE id = p_attendee_id;
  END IF;
END;
$$;

ALTER FUNCTION "public"."increment_attendee_votes"("p_attendee_id" "uuid", "p_column_name" "text", "p_voter_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increment_votes"("person_id" "uuid", "column_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF column_name = 'drunk_votes' THEN
    UPDATE people SET drunk_votes = drunk_votes + 1 WHERE id = person_id;
  ELSIF column_name = 'sober_votes' THEN
    UPDATE people SET sober_votes = sober_votes + 1 WHERE id = person_id;
  END IF;
END;
$$;

ALTER FUNCTION "public"."increment_votes"("person_id" "uuid", "column_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_current_user_team_member"("team" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    SET "row_security" TO 'off'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_memberships tm
    WHERE tm.team_id = team
      AND tm.status = 'active'
      AND tm.user_id = public.current_user_id()
  );
$$;

ALTER FUNCTION "public"."is_current_user_team_member"("team" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_same_party_attendee"("voter_user_id" "uuid", "target_attendee_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.party_attendees voter_pa
    JOIN public.party_attendees target_pa ON voter_pa.party_id = target_pa.party_id
    WHERE voter_pa.user_id = voter_user_id 
    AND target_pa.id = target_attendee_id
  );
END;
$$;

ALTER FUNCTION "public"."is_same_party_attendee"("voter_user_id" "uuid", "target_attendee_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_team_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_team_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."set_team_slug"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."capabilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."capabilities" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."party" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "created_by" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_public" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."party" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."party_attendees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "party_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "display_name" "text",
    "drunk_votes" integer DEFAULT 0 NOT NULL,
    "sober_votes" integer DEFAULT 0 NOT NULL,
    "is_guest" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."party_attendees" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."party_join_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "party_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "email" "text",
    "full_name" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    CONSTRAINT "party_join_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);

ALTER TABLE "public"."party_join_requests" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."team" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."team" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."team_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "email" "text",
    "invite_code" "text",
    "invited_by" "uuid",
    "invited_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "joined_at" timestamp with time zone,
    "left_at" timestamp with time zone,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "team_memberships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'left'::"text", 'suspended'::"text"])))
);

ALTER TABLE "public"."team_memberships" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_capabilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "capability_id" "uuid" NOT NULL,
    "scope_type" "text",
    "scope_id" "uuid",
    "expires_at" timestamp with time zone,
    "granted_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_capabilities" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_id" "uuid",
    "email" "text",
    "full_name" "text",
    "display_name" "text",
    "avatar_url" "text",
    "confirm_code" "text",
    "email_confirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attendee_id" "uuid" NOT NULL,
    "voter_id" "uuid",
    "is_drunk" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."votes" OWNER TO "postgres";

ALTER TABLE ONLY "public"."capabilities"
    ADD CONSTRAINT "capabilities_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."capabilities"
    ADD CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."party_attendees"
    ADD CONSTRAINT "party_attendees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."party_attendees"
    ADD CONSTRAINT "party_attendees_unique_party_user" UNIQUE ("party_id", "user_id");

ALTER TABLE ONLY "public"."party_join_requests"
    ADD CONSTRAINT "party_join_requests_party_id_email_key" UNIQUE ("party_id", "email");

ALTER TABLE ONLY "public"."party_join_requests"
    ADD CONSTRAINT "party_join_requests_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."party"
    ADD CONSTRAINT "party_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."party"
    ADD CONSTRAINT "party_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."team_memberships"
    ADD CONSTRAINT "team_memberships_invite_code_key" UNIQUE ("invite_code");

ALTER TABLE ONLY "public"."team_memberships"
    ADD CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "team_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."user_capabilities"
    ADD CONSTRAINT "user_capabilities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_capabilities"
    ADD CONSTRAINT "user_capabilities_user_id_capability_id_scope_type_scope_id_key" UNIQUE ("user_id", "capability_id", "scope_type", "scope_id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_confirm_code_key" UNIQUE ("confirm_code");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_capabilities_name" ON "public"."capabilities" USING "btree" ("name");
CREATE INDEX "idx_party_join_requests_party_id" ON "public"."party_join_requests" USING "btree" ("party_id");
CREATE INDEX "idx_party_join_requests_status" ON "public"."party_join_requests" USING "btree" ("status");
CREATE INDEX "idx_party_slug" ON "public"."party" USING "btree" ("slug");
CREATE INDEX "idx_party_team_id" ON "public"."party" USING "btree" ("team_id");
CREATE INDEX "idx_team_memberships_email" ON "public"."team_memberships" USING "btree" ("email");
CREATE INDEX "idx_team_memberships_invite_code" ON "public"."team_memberships" USING "btree" ("invite_code");
CREATE INDEX "idx_team_memberships_team_id" ON "public"."team_memberships" USING "btree" ("team_id");
CREATE INDEX "idx_team_memberships_user_id" ON "public"."team_memberships" USING "btree" ("user_id");
CREATE INDEX "idx_team_slug" ON "public"."team" USING "btree" ("slug");
CREATE INDEX "idx_user_capabilities_capability_id" ON "public"."user_capabilities" USING "btree" ("capability_id");
CREATE INDEX "idx_user_capabilities_scope" ON "public"."user_capabilities" USING "btree" ("scope_type", "scope_id");
CREATE INDEX "idx_user_capabilities_user_id" ON "public"."user_capabilities" USING "btree" ("user_id");
CREATE INDEX "idx_users_auth_id" ON "public"."users" USING "btree" ("auth_id");
CREATE INDEX "idx_users_confirm_code" ON "public"."users" USING "btree" ("confirm_code");
CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");
CREATE UNIQUE INDEX "uq_active_pending_membership" ON "public"."team_memberships" USING "btree" ("team_id", "user_id") WHERE ("status" = ANY (ARRAY['pending'::"text", 'active'::"text"]));
CREATE INDEX "votes_attendee_idx" ON "public"."votes" USING "btree" ("attendee_id");

ALTER TABLE ONLY "public"."party_attendees"
    ADD CONSTRAINT "party_attendees_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."party"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."party_attendees"
    ADD CONSTRAINT "party_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."party"
    ADD CONSTRAINT "party_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."party"
    ADD CONSTRAINT "party_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_memberships"
    ADD CONSTRAINT "team_memberships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."team_memberships"
    ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_memberships"
    ADD CONSTRAINT "team_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_capabilities"
    ADD CONSTRAINT "user_capabilities_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_capabilities"
    ADD CONSTRAINT "user_capabilities_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_capabilities"
    ADD CONSTRAINT "user_capabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "public"."party_attendees"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

CREATE POLICY "cap_select_all" ON "public"."capabilities" FOR SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."capabilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."party" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."party_attendees" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "party_attendees_modify_members" ON "public"."party_attendees" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."party" "p"
     JOIN "public"."team_memberships" "tm" ON (("tm"."team_id" = "p"."team_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "tm"."user_id")))
  WHERE (("p"."id" = "party_attendees"."party_id") AND ("tm"."status" = 'active'::"text") AND ("u"."auth_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."party" "p"
     JOIN "public"."team_memberships" "tm" ON (("tm"."team_id" = "p"."team_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "tm"."user_id")))
  WHERE (("p"."id" = "party_attendees"."party_id") AND ("tm"."status" = 'active'::"text") AND ("u"."auth_id" = "auth"."uid"())))));

CREATE POLICY "party_attendees_select_public" ON "public"."party_attendees" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."party" "p"
  WHERE (("p"."id" = "party_attendees"."party_id") AND (COALESCE("p"."is_public", false) = true)))));

CREATE POLICY "party_insert_auth" ON "public"."party" FOR INSERT TO "authenticated" WITH CHECK (true);

ALTER TABLE "public"."party_join_requests" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "party_select_all" ON "public"."party" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "party_select_public" ON "public"."party" FOR SELECT USING ((COALESCE("is_public", false) = true));

ALTER TABLE "public"."team" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_insert_auth" ON "public"."team" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "team_select_all" ON "public"."team" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "ucap_select_self" ON "public"."user_capabilities" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));

ALTER TABLE "public"."user_capabilities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_modify_team" ON "public"."votes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."party_attendees" "pa"
     JOIN "public"."party" "p" ON (("p"."id" = "pa"."party_id")))
     JOIN "public"."team_memberships" "tm" ON (("tm"."team_id" = "p"."team_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "tm"."user_id")))
  WHERE (("pa"."id" = "votes"."attendee_id") AND ("tm"."status" = 'active'::"text") AND ("u"."auth_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."party_attendees" "pa"
     JOIN "public"."party" "p" ON (("p"."id" = "pa"."party_id")))
     JOIN "public"."team_memberships" "tm" ON (("tm"."team_id" = "p"."team_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "tm"."user_id")))
  WHERE (("pa"."id" = "votes"."attendee_id") AND ("tm"."status" = 'active'::"text") AND ("u"."auth_id" = "auth"."uid"())))));

CREATE POLICY "votes_select_public" ON "public"."votes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."party_attendees" "pa"
     JOIN "public"."party" "p" ON (("p"."id" = "pa"."party_id")))
  WHERE (("pa"."id" = "votes"."attendee_id") AND (COALESCE("p"."is_public", false) = true)))));

CREATE POLICY "votes_select_team" ON "public"."votes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."party_attendees" "pa"
     JOIN "public"."party" "p" ON (("p"."id" = "pa"."party_id")))
     JOIN "public"."team_memberships" "tm" ON (("tm"."team_id" = "p"."team_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "tm"."user_id")))
  WHERE (("pa"."id" = "votes"."attendee_id") AND ("tm"."status" = 'active'::"text") AND ("u"."auth_id" = "auth"."uid"())))));

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_id"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_party_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_party_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_party_slug"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_team_slug"("team_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_team_slug"("team_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_team_slug"("team_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_team_members"("p_team_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_members"("p_team_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_members"("p_team_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."increment_attendee_votes"("p_attendee_id" "uuid", "p_column_name" "text", "p_voter_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_attendee_votes"("p_attendee_id" "uuid", "p_column_name" "text", "p_voter_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_attendee_votes"("p_attendee_id" "uuid", "p_column_name" "text", "p_voter_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."increment_votes"("person_id" "uuid", "column_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_votes"("person_id" "uuid", "column_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_votes"("person_id" "uuid", "column_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."is_current_user_team_member"("team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_team_member"("team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_team_member"("team" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."is_same_party_attendee"("voter_user_id" "uuid", "target_attendee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_same_party_attendee"("voter_user_id" "uuid", "target_attendee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_same_party_attendee"("voter_user_id" "uuid", "target_attendee_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."set_team_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_team_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_team_slug"() TO "service_role";

GRANT ALL ON FUNCTION "public"."sign"("payload" json, "secret" "text", "algorithm" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sign"("payload" json, "secret" "text", "algorithm" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sign"("payload" json, "secret" "text", "algorithm" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sign"("payload" json, "secret" "text", "algorithm" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."try_cast_double"("inp" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."try_cast_double"("inp" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."try_cast_double"("inp" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."try_cast_double"("inp" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."url_decode"("data" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."url_decode"("data" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."url_decode"("data" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."url_decode"("data" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."url_encode"("data" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."url_encode"("data" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."url_encode"("data" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."url_encode"("data" "bytea") TO "service_role";

GRANT ALL ON FUNCTION "public"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "service_role";

GRANT ALL ON TABLE "public"."capabilities" TO "anon";
GRANT ALL ON TABLE "public"."capabilities" TO "authenticated";
GRANT ALL ON TABLE "public"."capabilities" TO "service_role";

GRANT ALL ON TABLE "public"."party" TO "anon";
GRANT ALL ON TABLE "public"."party" TO "authenticated";
GRANT ALL ON TABLE "public"."party" TO "service_role";

GRANT ALL ON TABLE "public"."party_attendees" TO "anon";
GRANT ALL ON TABLE "public"."party_attendees" TO "authenticated";
GRANT ALL ON TABLE "public"."party_attendees" TO "service_role";

GRANT ALL ON TABLE "public"."party_join_requests" TO "anon";
GRANT ALL ON TABLE "public"."party_join_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."party_join_requests" TO "service_role";

GRANT ALL ON TABLE "public"."team" TO "anon";
GRANT ALL ON TABLE "public"."team" TO "authenticated";
GRANT ALL ON TABLE "public"."team" TO "service_role";

GRANT ALL ON TABLE "public"."team_memberships" TO "anon";
GRANT ALL ON TABLE "public"."team_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."team_memberships" TO "service_role";

GRANT ALL ON TABLE "public"."user_capabilities" TO "anon";
GRANT ALL ON TABLE "public"."user_capabilities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_capabilities" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
