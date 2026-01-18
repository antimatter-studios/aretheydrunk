import { redirect, notFound } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase/server"
import { hasCapability } from "@/lib/authz"
import { ManagePartyClient } from "./client"

export default async function ManagePartyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/party/${slug}/manage`)
  }

  const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", user.id).single()

  if (!dbUser) {
    redirect(`/auth/login?redirect=/party/${slug}/manage`)
  }

  const { data: party, error: partyError } = await supabase
    .from("party")
    .select("id, name, slug, team_id, is_public, team:team_id (id, name, slug)")
    .eq("slug", slug)
    .or("is_active.is.true,is_active.is.null")
    .single()

  if (partyError) {
    console.error("party_manage: failed to load party", { slug, error: partyError })
    redirect(`/party/${slug}`)
  }

  if (!party) {
    console.error("party_manage: party not found after query", { slug })
    redirect(`/party/${slug}`)
  }

  const teamRelation = party.team as { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null
  const team = Array.isArray(teamRelation) ? teamRelation[0] : teamRelation
  if (!team) {
    console.error("party_manage: missing team relation", { slug })
    redirect(`/party/${slug}`)
  }

  // Require team_admin capability to manage
  const isAdmin = await hasCapability({ userId: dbUser.id, name: "team_admin", scopeType: "team", scopeId: party.team_id })
  if (!isAdmin) {
    redirect(`/party/${slug}`)
  }

  // Load active team members (authed client)
  const { data: memberships } = await supabase
    .from("team_memberships")
    .select("user_id")
    .eq("team_id", party.team_id)
    .eq("status", "active")

  const userIds = memberships?.map((m) => m.user_id).filter(Boolean) || []
  const { data: users } =
    userIds.length > 0
      ? await supabase.from("users").select("id, full_name, display_name, email").in("id", userIds)
      : { data: [] }

  // Get current party attendees
  const { data: attendees } = await supabase
    .from("party_attendees")
    .select("*, user:users(id, display_name, full_name)")
    .eq("party_id", party.id)
    .order("created_at", { ascending: true })

  const attendeeUserIds = new Set(attendees?.map((a) => a.user_id) || [])

  const teamMembers =
    users?.map((u) => ({
      id: u.id,
      full_name: u.full_name || "",
      display_name: u.display_name,
      email: u.email || "",
      is_in_party: attendeeUserIds.has(u.id),
    })) || []

  // Transform attendees for the UI
  const people = (attendees || []).map((a) => ({
    id: a.id,
    user_id: a.user_id,
    name: a.user?.display_name || a.user?.full_name || "Unknown",
    photo_url: null,
    drunk_votes: a.drunk_votes,
    sober_votes: a.sober_votes,
    is_guest: false, // TODO: determine if user is a guest
  }))

  return <ManagePartyClient party={party} teamName={team.name} initialPeople={people} teamMembers={teamMembers} />
}
