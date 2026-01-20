import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasCapability } from "@/lib/authz"
import { getAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"

export default async function SuperAdminPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/")
  }

  const { data: dbUser } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single()
  if (!dbUser) {
    redirect("/")
  }

  const isSuperAdmin = await hasCapability({ userId: dbUser.id, name: "super_admin" })
  if (!isSuperAdmin) {
    redirect("/")
  }

  // Fetch all users using admin client (bypass RLS for superadmin tools)
  const admin = getAdminClient()
  const { data: users, error: usersError } = await admin
    .from("users")
    .select("id, email, display_name, full_name, created_at")
    .order("created_at", { ascending: false })

  if (usersError) {
    console.error("[superadmin] failed to fetch users", usersError)
  }

  return (
    <div className="min-h-screen relative overflow-auto">
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-4">
          <Link href="/dashboard">
            <BrutalButton variant="outline" size="sm">← BACK TO DASHBOARD</BrutalButton>
          </Link>
        </div>
        <div className="mb-12">
          <h1
            className="font-display text-6xl font-black text-black mb-4"
            style={{ textShadow: "6px 6px 0 #FFE55C" }}
          >
            SUPERADMIN
          </h1>
          <p className="text-2xl font-bold">System management tools</p>
        </div>

        {/* Users list */}
        <section className="mb-12">
          <h2 className="font-display text-3xl font-black text-black mb-4">Users</h2>
          <div className="brutal-border-thick brutal-shadow bg-brutal-cream">
            <ul className="divide-y divide-black/10">
              {(users || []).map((u) => (
                <li key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-display text-xl font-black text-black truncate">
                      {u.display_name || u.full_name || u.email || u.id}
                    </div>
                    <div className="text-black/70 text-sm truncate">{u.email}</div>
                  </div>
                  <Link href={`/superadmin/user/${u.id}`}>
                    <BrutalButton variant="accent" size="sm">VIEW</BrutalButton>
                  </Link>
                </li>
              ))}
              {(!users || users.length === 0) && (
                <li className="px-4 py-6 text-center font-bold text-black/70">No users found.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
