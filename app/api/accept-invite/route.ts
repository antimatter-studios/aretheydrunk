import { createServerComponentClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { inviteCode, fullName, email, password } = await request.json()

    if (!inviteCode || !fullName || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerComponentClient()
    const adminClient = getAdminClient()

    // Get the pending membership
    const { data: membership, error: membershipError } = await supabase
      .from("team_memberships")
      .select("id, team_id")
      .eq("invite_code", inviteCode)
      .eq("status", "pending")
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ success: false, error: "Invalid invitation" }, { status: 400 })
    }

    const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    let authUserId: string

    if (existingAuthUser) {
      // User already exists in Supabase auth, use their ID
      authUserId = existingAuthUser.id

      // Update their password and confirm email if needed
      await adminClient.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
      })
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      })

      if (authError || !authData.user) {
        console.error("Error creating auth user:", authError)
        return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
      }

      authUserId = authData.user.id
    }

    const { data: existingUser } = await adminClient.from("users").select("id").eq("auth_id", authUserId).single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id

      // Update user details
      await adminClient
        .from("users")
        .update({
          full_name: fullName,
          email: email.toLowerCase(),
          email_confirmed_at: new Date().toISOString(),
        })
        .eq("id", userId)
    } else {
      // Create new user record
      const { data: newUser, error: userError } = await adminClient
        .from("users")
        .insert({
          auth_id: authUserId,
          full_name: fullName,
          email: email.toLowerCase(),
          email_confirmed_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (userError) {
        console.error("Error creating user:", userError)
        return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
      }

      userId = newUser.id
    }

    // Update the membership to active and link to user
    const { error: updateError } = await adminClient
      .from("team_memberships")
      .update({
        user_id: userId,
        status: "active",
        accepted_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
        invite_code: null,
      })
      .eq("id", membership.id)

    if (updateError) {
      console.error("Error updating membership:", updateError)
      return NextResponse.json({ success: false, error: "Failed to accept invitation" }, { status: 500 })
    }

    // Grant team_member capability scoped to this team
    const { data: teamMemberCap } = await adminClient
      .from("capabilities")
      .select("id")
      .eq("name", "team_member")
      .single()
    if (!teamMemberCap) {
      return NextResponse.json({ success: false, error: "Capability not found" }, { status: 500 })
    }

    const { error: capError } = await adminClient
      .from("user_capabilities")
      .upsert(
        {
          user_id: userId,
          capability_id: teamMemberCap.id,
          scope_type: "team",
          scope_id: membership.team_id,
        },
        { onConflict: "user_id,capability_id,scope_type,scope_id", ignoreDuplicates: true }
      )
      .select("id")

    if (capError) {
      console.error("Error granting capability:", capError)
      return NextResponse.json({ success: false, error: "Failed to grant membership" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error accepting invite:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
