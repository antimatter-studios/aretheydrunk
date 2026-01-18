"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { hasCapability } from "@/lib/authz"
import { sendTeamInvitationEmail } from "@/lib/email/resend"
import { randomBytes } from "crypto"

export async function sendTeamInvitations(teamId: string, emails: string[]) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: dbUser } = await supabase.from("users").select("id, full_name").eq("auth_id", user.id).single()

    if (!dbUser) {
      return { success: false, error: "User not found" }
    }

    // Verify user is an active member
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

    // And has team_admin capability for this team
    const isAdmin = await hasCapability({ userId: dbUser.id, name: "team_admin", scopeType: "team", scopeId: teamId })
    if (!isAdmin) return { success: false, error: "Not authorized" }

    const { data: team } = await supabase.from("team").select("name").eq("id", teamId).single()

    if (!team) {
      return { success: false, error: "Team not found" }
    }

    // Create pending memberships for each email (no role column in schema v2)
    const invitations = emails.map((email) => ({
      team_id: teamId,
      email: email.toLowerCase().trim(),
      status: "pending",
      invited_by: dbUser.id,
      invited_at: new Date().toISOString(),
      invite_code: randomBytes(16).toString("hex"),
    }))

    const { error: insertError, data: createdInvitations } = await supabase
      .from("team_memberships")
      .insert(invitations)
      .select("email, invite_code")

    if (insertError) {
      console.error("[v0] Failed to create invitations:", insertError)
      return { success: false, error: "Failed to create invitations" }
    }

    const emailResults = await Promise.all(
      createdInvitations.map(async (invitation) => {
        return sendTeamInvitationEmail({
          to: invitation.email,
          invitedByName: dbUser.full_name || "A team member",
          teamName: team.name,
          inviteCode: invitation.invite_code,
        })
      }),
    )

    const failedEmails = emailResults.filter((result) => !result.success)
    if (failedEmails.length > 0) {
      console.error("[v0] Some emails failed to send:", failedEmails)
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending invitations:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
