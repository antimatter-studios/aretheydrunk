"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

function generateInviteCode(): string {
  return randomBytes(16).toString("hex")
}

export async function inviteTeamMember(email: string, role: "member" | "admin") {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user's id from users table
  const { data: currentUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

  if (!currentUser) {
    return { error: "User not found" }
  }

  // Check if user is admin of their team
  const { data: membership } = await supabase
    .from("team_memberships")
    .select("team_id, role")
    .eq("user_id", currentUser.id)
    .eq("status", "active")
    .single()

  if (!membership || membership.role !== "admin") {
    return { error: "Only admins can invite team members" }
  }

  // Check if there's already a pending invite for this email
  const { data: existingInvite } = await supabase
    .from("team_memberships")
    .select("id")
    .eq("team_id", membership.team_id)
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .single()

  if (existingInvite) {
    return { error: "This email has already been invited" }
  }

  // Generate invite code
  const inviteCode = generateInviteCode()

  const { error } = await supabase.from("team_memberships").insert({
    team_id: membership.team_id,
    user_id: null, // No user yet - they'll be linked when they accept
    email: email.toLowerCase(),
    role,
    status: "pending",
    invited_by: currentUser.id,
    invited_at: new Date().toISOString(),
    invite_code: inviteCode,
  })

  if (error) {
    console.error("Error creating invitation:", error)
    return { error: "Failed to send invitation" }
  }

  return { success: true, inviteCode }
}
