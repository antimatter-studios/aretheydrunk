import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { TeamSettingsForm } from "./settings-form"

export default async function TeamSettingsPage({
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

  // Check user's membership and admin status
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
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href={`/dashboard/team/${slug}`} className="inline-block mb-6 text-black hover:text-black/70 font-bold">
          ← BACK TO TEAM
        </Link>

        <div className="mb-8">
          <div className="sticker-badge inline-block mb-4">
            <span className="font-display text-xl text-black">ADMIN ZONE</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-black pop-text" data-text="TEAM SETTINGS">
            TEAM SETTINGS
          </h1>
          <p className="text-lg text-black/70 mt-2">Manage settings for {team.name}</p>
        </div>

        <TeamSettingsForm team={team} slug={slug} />
      </div>
    </main>
  )
}
