-- Allow active team members to update party rows (e.g., toggle public status)

ALTER TABLE IF EXISTS "public"."party" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "party_update_by_team_admin" ON "public"."party";

CREATE POLICY "party_update_by_team_admin" ON "public"."party" FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "public"."users" u
    JOIN "public"."user_capabilities" uc ON "uc"."user_id" = "u"."id"
    JOIN "public"."capabilities" c ON "c"."id" = "uc"."capability_id"
    WHERE "u"."auth_id" = auth.uid()
      AND "uc"."scope_type" = 'team'
      AND "uc"."scope_id" = "public"."party"."team_id"
      AND "c"."name" = 'team_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "public"."users" u
    JOIN "public"."user_capabilities" uc ON "uc"."user_id" = "u"."id"
    JOIN "public"."capabilities" c ON "c"."id" = "uc"."capability_id"
    WHERE "u"."auth_id" = auth.uid()
      AND "uc"."scope_type" = 'team'
      AND "uc"."scope_id" = "public"."party"."team_id"
      AND "c"."name" = 'team_admin'
  )
);
