import { createServerComponentClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { hasCapability } from "@/lib/authz"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { Header } from "@/components/header"

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/auth/login")
  }

  // Get the user from our users table
  const { data: dbUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single()

  if (!dbUser) {
    redirect("/auth/login")
  }

  // Get the team by slug
  const { data: team } = await supabase.from("team").select("*").eq("slug", slug).single()

  if (!team) {
    notFound()
  }

  // Check user's membership in this team (status-based, role removed)
  const { data: membership } = await supabase
    .from("team_memberships")
    .select("id")
    .eq("team_id", team.id)
    .eq("user_id", dbUser.id)
    .eq("status", "active")
    .single()

  if (!membership) {
    redirect("/dashboard")
  }

  // Determine admin via capability helper
  const adminClient = getAdminClient()
  const isAdmin = await hasCapability({ userId: dbUser.id, name: "team_admin", scopeType: "team", scopeId: team.id })
  // Load team memberships for sidebar using authed client (RLS now allows same-team reads)
  const { data: membershipsData } = await supabase
    .from("team_memberships")
    .select("id, user_id, status")
    .eq("team_id", team.id)
    .eq("status", "active")

  const userIds = (membershipsData || []).map((m) => m.user_id).filter(Boolean)
  const { data: usersData } = await adminClient
    .from("users")
    .select("id, full_name, display_name, email")
    .in("id", userIds)

  // Build set of admin user_ids based on capability grants
  let adminUserIds = new Set<string>()
  if (userIds.length > 0) {
    const teamAdminId = await (async () => {
      // cache via hasCapability helper is not exposed, so fetch directly once
      const { data: cap } = await adminClient.from("capabilities").select("id").eq("name", "team_admin").single()
      return cap?.id as string | undefined
    })()

    if (teamAdminId) {
      const { data: adminCaps } = await adminClient
        .from("user_capabilities")
        .select("user_id")
        .eq("capability_id", teamAdminId)
        .eq("scope_type", "team")
        .eq("scope_id", team.id)
        .in("user_id", userIds as string[])
      adminUserIds = new Set((adminCaps || []).map((r: { user_id: string }) => r.user_id))
    }
  }

  const teamMembers = (membershipsData || []).map((membership) => ({
    id: membership.id,
    role: adminUserIds.has(membership.user_id) ? "admin" : "member",
    user_id: membership.user_id,
    user: usersData?.find((u) => u.id === membership.user_id),
  }))

  // Get team's parties
  const { data: partyList } = await supabase
    .from("party")
    .select(`
      *,
      party_attendees(id, drunk_votes, sober_votes, user:users(id, display_name, full_name))
    `)
    .eq("team_id", team.id)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-brutal-cream">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <div className="mb-8">
          <div className="sticker-badge inline-block mb-4">
            <span className="font-display text-xl text-black">TEAM DASHBOARD</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-black pop-text" data-text={team.name}>
            {team.name}
          </h1>
          <p className="text-lg text-black/70 mt-2">
            You are {isAdmin ? "an" : "a"}{" "}
            <span className={`font-bold ${isAdmin ? "text-brutal-pink" : ""}`}>{isAdmin ? "ADMIN" : "MEMBER"}</span> of{" "}
            <span className="font-bold">{team.name}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Parties */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-black">PARTIES</h2>
              <Link href={`/dashboard/team/${slug}/create`}>
                <BrutalButton className="bg-white">+ NEW PARTY</BrutalButton>
              </Link>
            </div>

            {partyList && partyList.length > 0 ? (
              <div className="space-y-4">
                {partyList.map((party) => {
                  const attendees = party.party_attendees || []
                  const totalPeople = attendees.length
                  const totalVotes = attendees.reduce(
                    (sum: number, a: { drunk_votes: number | null; sober_votes: number | null }) =>
                      sum + (a.drunk_votes || 0) + (a.sober_votes || 0),
                    0,
                  )

                  return (
                    <BrutalCard key={party.id} className="bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-black">{party.name}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-black/70">
                            <span>{totalPeople} people</span>
                            <span>{totalVotes} votes</span>
                          </div>
                          <p className="text-xs text-black/50 mt-1">
                            {party.is_active ? "LIVE NOW" : "Ended"} - Created{" "}
                            {new Date(party.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/party/${party.slug}`}>
                            <BrutalButton className="bg-brutal-teal text-sm">VIEW</BrutalButton>
                          </Link>
                          <Link href={`/party/${party.slug}/manage`}>
                            <BrutalButton className="bg-brutal-yellow text-sm">MANAGE</BrutalButton>
                          </Link>
                        </div>
                      </div>
                    </BrutalCard>
                  )
                })}
              </div>
            ) : (
              <BrutalCard className="bg-white text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-display text-2xl text-black mb-2">NO PARTIES YET!</h3>
                <p className="text-black/70 mb-6">Create your first party to start tracking drunkenness</p>
                <Link href={`/dashboard/team/${slug}/create`}>
                  <BrutalButton className="bg-brutal-green">CREATE YOUR FIRST PARTY</BrutalButton>
                </Link>
              </BrutalCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-black">TEAM MEMBERS</h2>
              {isAdmin && (
                <Link href={`/dashboard/team/${slug}/invite`}>
                  <BrutalButton className="bg-white text-sm">+ INVITE</BrutalButton>
                </Link>
              )}
            </div>

            <BrutalCard className="bg-white">
              <div className="space-y-3">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-2 border-b-2 border-black/10 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-black">
                          {member.user?.display_name || member.user?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-black/60">{member.user?.email}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 border-2 border-black ${
                          member.role === "admin" ? "bg-brutal-yellow" : "bg-brutal-cream"
                        }`}
                      >
                        {member.role?.toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-black/60 text-center py-4">No team members found</p>
                )}
              </div>
            </BrutalCard>

            {/* Admin Settings */}
            {isAdmin && (
              <BrutalCard className="bg-white">
                <h3 className="font-display text-xl text-black mb-2">ADMIN ZONE</h3>
                <p className="text-sm text-black/70 mb-4">Manage your team settings</p>
                <Link href={`/dashboard/team/${slug}/settings`}>
                  <BrutalButton className="bg-brutal-yellow w-full text-sm">TEAM SETTINGS</BrutalButton>
                </Link>
              </BrutalCard>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
