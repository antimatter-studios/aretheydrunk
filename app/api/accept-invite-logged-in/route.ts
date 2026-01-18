import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const inviteCode = formData.get("inviteCode") as string

    const supabase = await createServerComponentClient()
    const adminClient = getAdminClient()

    // Get current logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Find the invitation
    const { data: membership, error: membershipError } = await supabase
      .from("team_memberships")
      .select("id, email, team_id, team:team(slug)")
      .eq("invite_code", inviteCode)
      .eq("status", "pending")
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 404 })
    }

    // Verify email matches
    if (user.email !== membership.email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 })
    }

    // Get user from users table
    const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Activate the membership using admin client
    const { error: updateError } = await adminClient
      .from("team_memberships")
      .update({
        status: "active",
        user_id: dbUser.id,
        accepted_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
        invite_code: null,
      })
      .eq("id", membership.id)

    if (updateError) {
      console.error("[v0] Failed to activate membership:", updateError)
      return NextResponse.json({ error: "Failed to activate membership" }, { status: 500 })
    }

    // Grant team_member capability scoped to this team
    const { data: teamMemberCap } = await adminClient
      .from("capabilities")
      .select("id")
      .eq("name", "team_member")
      .single()
    if (!teamMemberCap) {
      return NextResponse.json({ error: "Capability not found" }, { status: 500 })
    }

    const { error: capError } = await adminClient
      .from("user_capabilities")
      .insert({
        user_id: dbUser.id,
        capability_id: teamMemberCap.id,
        scope_type: "team",
        scope_id: membership.team_id,
      })
      .select("id")

    if (capError) {
      console.error("[v0] Failed to grant team_member capability:", capError)
      return NextResponse.json({ error: "Failed to grant capability" }, { status: 500 })
    }

    const teamRelation = membership.team as { slug: string } | { slug: string }[] | null
    const team = Array.isArray(teamRelation) ? teamRelation[0] : teamRelation
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 500 })
    }

    // Redirect to team dashboard
    return NextResponse.redirect(new URL(`/dashboard/team/${team.slug}`, request.url))
  } catch (error) {
    console.error("[v0] Error accepting invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
