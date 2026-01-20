import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasCapability } from "@/lib/authz"
import { getAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"

export default async function SuperAdminUserTeamPage({ params }: { params: Promise<{ userId: string; teamId: string }> }) {
  const { userId, teamId } = await params
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

  const { data: team } = await admin.from("team").select("id, name, slug").eq("id", teamId).single()

  const { data: parties } = await admin
    .from("party")
    .select("id, name, slug, created_at, is_active")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen relative overflow-auto">
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-4">
          <Link href={`/superadmin/user/${userId}`}>
            <BrutalButton variant="outline" size="sm">← BACK</BrutalButton>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black text-black">
            Parties for {team?.name || teamId}
          </h1>
          <p className="text-sm text-black/60 break-all">User ID: {userId}</p>
        </div>

        <section>
          <div className="brutal-border-thick brutal-shadow bg-brutal-cream">
            <ul className="divide-y divide-black/10">
              {(parties || []).map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-xl font-black text-black truncate">{p.name}</div>
                    <div className="text-black/70 text-sm truncate">/{p.slug}</div>
                  </div>
                  <Link href={`/superadmin/user/${userId}/team/${teamId}/party/${p.id}`}>
                    <BrutalButton variant="accent" size="sm">VIEW</BrutalButton>
                  </Link>
                </li>
              ))}
              {(!parties || parties.length === 0) && (
                <li className="px-4 py-6 text-center font-bold text-black/70">No parties found for this team.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
