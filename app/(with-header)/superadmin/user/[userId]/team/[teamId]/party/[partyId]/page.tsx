import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasCapability } from "@/lib/authz"
import { getAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"

export default async function SuperAdminPartyDetailPage({
  params,
}: {
  params: Promise<{ userId: string; teamId: string; partyId: string }>
}) {
  const { userId, teamId, partyId } = await params
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

  const { data: party } = await admin
    .from("party")
    .select("id, name, slug, team_id, created_at, is_active")
    .eq("id", partyId)
    .single()

  return (
    <div className="min-h-screen relative overflow-auto">
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-4">
          <Link href={`/superadmin/user/${userId}/team/${teamId}`}>
            <BrutalButton variant="outline" size="sm">← BACK</BrutalButton>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black text-black">Party Detail</h1>
          <p className="font-bold text-black/70 break-all">Party ID: {partyId}</p>
          <p className="text-sm text-black/60 break-all">Team ID: {teamId}</p>
          <p className="text-sm text-black/60 break-all">User ID: {userId}</p>
        </div>

        <section className="mb-8">
          <div className="brutal-border-thick brutal-shadow bg-white p-4">
            {party ? (
              <div className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 items-baseline">
                <div className="font-bold text-black text-sm md:text-base">Name:</div>
                <div className="text-black font-bold">{party.name}</div>

                <div className="font-bold text-black text-sm md:text-base">Slug:</div>
                <div className="text-black break-all">{party.slug}</div>

                <div className="font-bold text-black text-sm md:text-base">Active:</div>
                <div className="text-black">{party.is_active ? "Yes" : "No"}</div>

                <div className="font-bold text-black text-sm md:text-base">Created:</div>
                <div className="text-black">{new Date(party.created_at).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-black/70 font-bold">Party not found.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
