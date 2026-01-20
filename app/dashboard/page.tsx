export const dynamic = "force-dynamic"

import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BrutalCard } from "@/components/brutal-card"
import { Header } from "@/components/header"
import { hasCapability } from "@/lib/authz"

export default async function DashboardPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    console.error("[dashboard] no authUser; redirecting to login")
    redirect("/auth/login")
  }

  const { data: dbUser, error: userError } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single()

  if (userError || !dbUser) {
    console.error("[dashboard] user fetch failed or missing", userError)
    redirect("/auth/login")
  }

  const isSuperAdmin = await hasCapability({ userId: dbUser.id, name: "super_admin" })

  const { data: memberships } = await supabase
    .from("team_memberships")
    .select(`
      id,
      team:team(id, name, slug, created_at)
    `)
    .eq("user_id", dbUser.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const normalizedMemberships = (memberships ?? []).map((membership) => {
    const teamRelation =
      membership.team as
        | { id: string; name: string; slug: string; created_at: string }
        | { id: string; name: string; slug: string; created_at: string }[]
        | null
    const team = Array.isArray(teamRelation) ? teamRelation[0] : teamRelation
    return { ...membership, team }
  })

  return (
    <>
      <Header />
      <div className="min-h-screen relative overflow-auto">
        {/* Sunburst background */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-conic-gradient(
                from 0deg,
                transparent 0deg 10deg,
                rgba(255, 255, 255, 0.1) 10deg 20deg
              )`,
            }}
          />
        </div>

        {/* Halftone overlay */}
        <div
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.15) 1px, transparent 1px)`,
            backgroundSize: "10px 10px",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1
              className="font-display text-6xl font-black text-black mb-4"
              style={{ textShadow: "6px 6px 0 #FFE55C" }}
            >
              YOUR TEAMS
            </h1>
            <p className="text-2xl font-bold">
              Welcome back, {dbUser.display_name || dbUser.full_name || dbUser.email}!
            </p>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedMemberships.map((membership) => {
              if (!membership.team) return null
              return (
                <Link key={membership.id} href={`/dashboard/team/${membership.team.slug}`}>
                  <BrutalCard className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-display text-3xl font-black text-black leading-tight">
                          {membership.team.name}
                        </h3>
                      </div>
                      <p className="text-lg font-bold mb-4">/{membership.team.slug}</p>
                      <div className="flex items-center gap-2 text-black/70">
                        <span className="text-4xl">👥</span>
                        <span className="font-bold">View Team Dashboard →</span>
                      </div>
                    </div>
                  </BrutalCard>
                </Link>
              )
            })}
            {/* Create New Team Card */}
            <Link href="/dashboard/create-team">
              <BrutalCard className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer bg-white">
                <div className="p-6 flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                  <div className="text-8xl mb-4">➕</div>
                  <h3 className="font-display text-3xl font-black text-black mb-2">CREATE NEW TEAM</h3>
                  <p className="text-lg font-bold">Start a new party crew!</p>
                </div>
              </BrutalCard>
            </Link>
          </div>

          {/* No teams message */}
          {!memberships || memberships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl font-bold mb-6">You're not part of any teams yet!</p>
              <Link
                href="/dashboard/create-team"
                className="inline-block bg-brutal-yellow text-black px-8 py-4 text-2xl font-black border-6 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                CREATE YOUR FIRST TEAM
              </Link>
            </div>
          ) : null}

          {/* User settings and logout */}
          <div className="mt-12 flex flex-row flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard/settings">
              <BrutalCard className="inline-block hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer bg-white">
                <div className="px-8 py-6 flex items-center gap-4">
                  <span className="text-4xl">⚙️</span>
                  <span className="font-display text-2xl font-black text-black">USER SETTINGS</span>
                </div>
              </BrutalCard>
            </Link>
            {isSuperAdmin ? (
              <Link href="/superadmin">
                <BrutalCard className="inline-block hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer bg-white">
                  <div className="px-8 py-6 flex items-center gap-4">
                    <span className="text-4xl">🛡️</span>
                    <span className="font-display text-2xl font-black text-black">SUPERADMIN</span>
                  </div>
                </BrutalCard>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
