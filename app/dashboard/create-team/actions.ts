"use server"

import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { slugifyWithSuffix } from "@/lib/slug"

export async function createNewTeam(formData: FormData) {
  const teamName = formData.get("teamName") as string

  if (!teamName || teamName.trim().length === 0) {
    return { error: "Team name is required" }
  }

  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: "You must be logged in to create a team" }
  }

  const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single()

  if (!dbUser) {
    return { error: "User not found" }
  }

  const teamSlug = slugifyWithSuffix(teamName)

  const { data: team, error: teamError } = await supabase
    .from("team")
    .insert({ name: teamName, slug: teamSlug })
    .select("id, slug")
    .single()

  if (teamError || !team) {
    console.error("[SERVER] Failed to create team:", teamError)
    return { error: "Failed to create team. Please try again." }
  }

  const { error: membershipError } = await supabase.from("team_memberships").insert({
    team_id: team.id,
    user_id: dbUser.id,
    status: "active",
    accepted_at: new Date().toISOString(),
    joined_at: new Date().toISOString(),
  })

  if (membershipError) {
    console.error("[SERVER] Failed to create team membership:", membershipError)
    return { error: "Failed to create team membership. Please try again." }
  }

  redirect(`/dashboard/team/${team.slug}`)
}
