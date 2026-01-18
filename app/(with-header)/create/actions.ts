"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export async function getUserTeams() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { teams: [] }
  }

  // Get user from users table
  const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

  if (!dbUser) {
    return { teams: [] }
  }

  // Get all teams the user belongs to
  const { data: memberships } = await supabase
    .from("team_memberships")
    .select(`
      team_id,
      team:team (
        id,
        name,
        slug
      )
    `)
    .eq("user_id", dbUser.id)
    .eq("status", "active")

  if (!memberships) {
    return { teams: [] }
  }

  const teams = memberships
    .map((m) => {
      const teamRelation = m.team as { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null
      const team = Array.isArray(teamRelation) ? teamRelation[0] : teamRelation
      return team
    })
    .filter((t): t is { id: string; name: string; slug: string } => !!t)

  return { teams }
}

export async function createParty(name: string, teamId: string, isPublic = false) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a party" }
  }

  // Get the user's user_id from users table
  const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

  if (!dbUser) {
    return { error: "User not found. Please contact support." }
  }

  // Verify user is a member of the selected team
  const { data: membership } = await supabase
    .from("team_memberships")
    .select("team_id")
    .eq("user_id", dbUser.id)
    .eq("team_id", teamId)
    .eq("status", "active")
    .single()

  if (!membership) {
    return { error: "You don't have access to this team." }
  }

  // Generate a unique slug
  const slug = `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 20)}-${nanoid(6)}`

  const { data, error } = await supabase
    .from("party")
    .insert({
      name,
      slug,
      team_id: teamId,
      created_by: dbUser.id,
      is_public: isPublic,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating party:", error)
    return { error: "Failed to create party. Try again!" }
  }

  return { slug: data.slug }
}
