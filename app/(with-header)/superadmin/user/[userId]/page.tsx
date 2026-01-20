import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasCapability } from "@/lib/authz"
import { getAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"

export default async function SuperAdminUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect("/")

  const { data: dbUser } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single()
  if (!dbUser) redirect("/")

  const isSuperAdmin = await hasCapability({ userId: dbUser.id, name: "super_admin" })
  if (!isSuperAdmin) redirect("/")

  const admin = getAdminClient()
  const { data: targetUser } = await admin
    .from("users")
    .select("id, email, display_name, full_name")
    .eq("id", userId)
    .single()
  const { data: memberships } = await admin
    .from("team_memberships")
    .select(`
      team:team(id, name, slug)
    `)
    .eq("user_id", userId)

  const teams = (memberships ?? []).map((m: any) => (Array.isArray(m.team) ? m.team[0] : m.team)).filter(Boolean)

  return (
    <div className="min-h-screen relative overflow-auto">
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-4">
          <Link href="/superadmin">
            <BrutalButton variant="outline" size="sm">← BACK</BrutalButton>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black text-black">
            Teams for {targetUser?.display_name || targetUser?.full_name || targetUser?.email || userId}
          </h1>
          <p className="font-bold text-black/70 break-all">User ID: {userId}</p>
        </div>

        <section>
          <div className="brutal-border-thick brutal-shadow bg-brutal-cream">
            <ul className="divide-y divide-black/10">
              {teams.map((t: any) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-xl font-black text-black truncate">{t.name}</div>
                    <div className="text-black/70 text-sm truncate">/{t.slug}</div>
                  </div>
                  <Link href={`/superadmin/user/${userId}/team/${t.id}`}>
                    <BrutalButton variant="accent" size="sm">VIEW</BrutalButton>
                  </Link>
                </li>
              ))}
              {teams.length === 0 && (
                <li className="px-4 py-6 text-center font-bold text-black/70">No teams found for this user.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
