"use server"

import { createServerComponentClient } from "@/lib/supabase/server"
import { slugifyWithSuffix } from "@/lib/slug"

export async function createParty(partyName: string, teamSlug: string, isPublic: boolean) {
  const supabase = await createServerComponentClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a party" }
  }

  // Get team by slug
  const { data: team, error: teamError } = await supabase.from("team").select("id").eq("slug", teamSlug).single()

  if (teamError || !team) {
    return { error: "Team not found" }
  }

  // Get user from our users table
  const { data: dbUser, error: userError } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

  if (userError || !dbUser) {
    return { error: "User not found" }
  }

  // Verify user is a member of this team (membership role removed; status must be active)
  const { data: membership } = await supabase
    .from("team_memberships")
    .select("id")
    .eq("team_id", team.id)
    .eq("user_id", dbUser.id)
    .eq("status", "active")
    .single()

  if (!membership) {
    return { error: "You are not a member of this team" }
  }

  // Generate party slug in code (DB trigger removed)
  const partySlug = slugifyWithSuffix(partyName)

  // Create party
  const { data: party, error: partyError } = await supabase
    .from("party")
    .insert({
      name: partyName,
      team_id: team.id,
      created_by: dbUser.id,
      slug: partySlug,
    })
    .select("slug")
    .single()

  if (partyError) {
    console.error("[SERVER] Failed to create party:", partyError)
    return { error: "Failed to create party. Please try again." }
  }

  return { partySlug: party.slug }
}
