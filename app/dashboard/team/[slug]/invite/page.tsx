import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import InviteForm from "./invite-form"

export default async function TeamInvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await getSupabaseServerClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user from our users table
  const { data: dbUser } = await supabase.from("users").select("*").eq("auth_id", user.id).single()

  if (!dbUser) {
    redirect("/auth/login")
  }

  // Get team by slug
  const { data: team } = await supabase.from("team").select("*").eq("slug", slug).single()

  if (!team) {
    redirect("/dashboard")
  }

  // Check if user is an admin of this team
  const { data: membership } = await supabase
    .from("team_memberships")
    .select("role")
    .eq("team_id", team.id)
    .eq("user_id", dbUser.id)
    .eq("status", "active")
    .single()

  if (!membership || membership.role !== "admin") {
    redirect(`/dashboard/team/${slug}`)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-6">
        <div
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{
            background: `repeating-conic-gradient(from 0deg at 50% 50%, 
              #fbbf24 0deg 10deg, 
              #f472b6 10deg 20deg, 
              #60a5fa 20deg 30deg)`,
          }}
        />

        <div
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, black 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          <div className="mb-8">
            <a
              href={`/dashboard/team/${slug}`}
              className="inline-flex items-center gap-2 text-2xl font-black font-display text-black hover:text-brutal-yellow transition-colors"
            >
              ← BACK TO TEAM
            </a>
          </div>

          <div className="bg-white border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 -rotate-1">
            <div className="rotate-1">
              <h1
                className="font-display text-6xl font-black text-black mb-2"
                style={{ textShadow: "4px 4px 0px #fbbf24" }}
              >
                INVITE PEOPLE
              </h1>
              <p className="text-xl font-bold mb-8">TO {team.name.toUpperCase()}</p>

              <InviteForm teamId={team.id} teamSlug={slug} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
