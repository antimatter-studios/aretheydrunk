"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function addTeamMemberToParty(partyId: string, userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: attendee, error } = await supabase
    .from("party_attendees")
    .insert({
      party_id: partyId,
      user_id: userId,
    })
    .select("*, user:users(id, display_name, full_name)")
    .single()

  if (error) {
    console.error("[v0] Error adding team member to party:", error)
    return { error: "Failed to add team member to party." }
  }

  return {
    person: {
      id: attendee.id,
      user_id: attendee.user_id,
      name: attendee.user?.display_name || attendee.user?.full_name || "Unknown",
      photo_url: null,
      drunk_votes: attendee.drunk_votes,
      sober_votes: attendee.sober_votes,
      is_guest: false,
    },
  }
}

export async function inviteGuest(partyId: string, teamId: string, email: string, name: string) {
  const supabase = await getSupabaseServerClient()

  // Create user for guest (without auth)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      full_name: name,
      email: email,
    })
    .select()
    .single()

  if (userError) {
    console.error("[v0] Error creating guest user:", userError)
    return { error: "Failed to create guest account." }
  }

  // Create team membership as guest for this specific party
  const { error: membershipError } = await supabase.from("team_memberships").insert({
    team_id: teamId,
    user_id: newUser.id,
    role: "guest",
    status: "active",
    party_id: partyId, // Guest is tied to this party only
    accepted_at: new Date().toISOString(),
  })

  if (membershipError) {
    console.error("[v0] Error creating guest membership:", membershipError)
    await supabase.from("users").delete().eq("id", newUser.id)
    return { error: "Failed to add guest to team." }
  }

  // Add guest to party attendees
  const { data: attendee, error: attendeeError } = await supabase
    .from("party_attendees")
    .insert({
      party_id: partyId,
      user_id: newUser.id,
    })
    .select("*, user:users(id, display_name, full_name)")
    .single()

  if (attendeeError) {
    console.error("[v0] Error adding guest to party:", attendeeError)
    await supabase.from("team_memberships").delete().eq("user_id", newUser.id)
    await supabase.from("users").delete().eq("id", newUser.id)
    return { error: "Failed to add guest to party." }
  }

  return {
    person: {
      id: attendee.id,
      user_id: newUser.id,
      name: name,
      photo_url: null,
      drunk_votes: attendee.drunk_votes,
      sober_votes: attendee.sober_votes,
      is_guest: true,
    },
  }
}

export async function removePersonFromParty(partyId: string, attendeeIdOrUserId: string) {
  const supabase = await getSupabaseServerClient()

  // Find attendee by party + (attendee id or user id)
  const { data: attendee, error: attendeeError } = await supabase
    .from("party_attendees")
    .select("id, user_id, user:users(auth_id)")
    .eq("party_id", partyId)
    .or(`user_id.eq.${attendeeIdOrUserId},id.eq.${attendeeIdOrUserId}`)
    .single()

  if (attendeeError || !attendee) {
    console.error("[v0] Error finding attendee for removal:", attendeeError)
    return { error: "Could not find attendee to remove." }
  }

  // Delete party attendee
  const { error } = await supabase.from("party_attendees").delete().eq("id", attendee.id)

  if (error) {
    console.error("[v0] Error removing person from party:", error)
    return { error: "Failed to remove person from party." }
  }

  // If guest (no auth_id), delete guest team membership and user
  const userRecord = Array.isArray(attendee?.user) ? attendee.user[0] : attendee?.user

  if (attendee && !userRecord?.auth_id) {
    await supabase.from("team_memberships").delete().eq("user_id", attendee.user_id).eq("role", "guest")
    await supabase.from("users").delete().eq("id", attendee.user_id)
  }

  return { success: true, attendeeId: attendee?.id, userId: attendee?.user_id }
}

// Legacy functions for backwards compatibility
export async function addPerson(partyId: string, name: string) {
  return inviteGuest(partyId, "", "", name)
}

export async function removePerson(attendeeId: string) {
  return removePersonFromParty("", attendeeId)
}

export async function togglePartyVisibility(partyId: string, isPublic: boolean, partySlug: string) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("party")
    .update({ is_public: isPublic })
    .eq("id", partyId)
    .select("id, is_public")
    .single()

  if (error || !data) {
    console.error("[v0] Error updating party visibility:", error)
    return { error: "Failed to update party visibility." }
  }

  return { success: true, is_public: data.is_public }
}
