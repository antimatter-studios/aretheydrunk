"use server"

import { createServerComponentClient } from "@/lib/supabase/server"
import { hasCapability } from "@/lib/authz"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateTeamName(teamId: string, newName: string) {
  try {
    const supabase = await createServerComponentClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify user is admin of this team: active membership + team_admin capability
    const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

    if (!dbUser) {
      return { success: false, error: "User not found" }
    }

    const { data: membership } = await supabase
      .from("team_memberships")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", dbUser.id)
      .eq("status", "active")
      .single()

    if (!membership) {
      return { success: false, error: "Not authorized" }
    }

    const isAdmin = await hasCapability({ userId: dbUser.id, name: "team_admin", scopeType: "team", scopeId: teamId })
    if (!isAdmin) {
      return { success: false, error: "Not authorized" }
    }

    // Update team name
    const { error } = await supabase.from("team").update({ name: newName }).eq("id", teamId)

    if (error) {
      console.error("[v0] Error updating team name:", error)
      return { success: false, error: "Failed to update team name" }
    }

    // Get the team slug for revalidation
    const { data: team } = await supabase.from("team").select("slug").eq("id", teamId).single()

    if (team) {
      revalidatePath(`/dashboard/team/${team.slug}`)
      revalidatePath(`/dashboard/team/${team.slug}/settings`)
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateTeamName:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const supabase = await createServerComponentClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify user is admin of this team: active membership + team_admin capability
    const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

    if (!dbUser) {
      return { success: false, error: "User not found" }
    }

    const { data: membership } = await supabase
      .from("team_memberships")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", dbUser.id)
      .eq("status", "active")
      .single()

    if (!membership) {
      return { success: false, error: "Not authorized" }
    }

    const isAdmin = await hasCapability({ userId: dbUser.id, name: "team_admin", scopeType: "team", scopeId: teamId })
    if (!isAdmin) {
      return { success: false, error: "Not authorized" }
    }

    const { error } = await supabase.from("team").delete().eq("id", teamId)

    if (error) {
      console.error("[v0] Error deleting team:", error)
      return { success: false, error: "Failed to delete team" }
    }

    revalidatePath("/dashboard")
  } catch (error) {
    console.error("[v0] Error in deleteTeam:", error)
    return { success: false, error: "An unexpected error occurred" }
  }

  // redirect() must be outside try-catch as it throws
  redirect("/dashboard")
}
