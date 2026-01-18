"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function castVote(attendeeId: string, isDrunk: boolean) {
  const supabase = await getSupabaseServerClient()

  const { error: voteError } = await supabase.from("votes").insert({
    attendee_id: attendeeId,
    is_drunk: isDrunk,
  })

  if (voteError) {
    console.error("Error recording vote:", voteError)
    return { error: "Failed to record vote" }
  }

  const column = isDrunk ? "drunk_votes" : "sober_votes"

  const { error: updateError } = await supabase.rpc("increment_attendee_votes", {
    attendee_id: attendeeId,
    column_name: column,
  })

  if (updateError) {
    // Fallback: fetch current count and increment
    const { data: attendee } = await supabase.from("party_attendees").select(column).eq("id", attendeeId).single()

    if (attendee) {
      await supabase
        .from("party_attendees")
        .update({ [column]: (attendee[column] || 0) + 1 })
        .eq("id", attendeeId)
    }
  }

  return { success: true }
}
