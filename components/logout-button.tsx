"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-brutal-red text-black px-8 py-4 text-xl font-black border-6 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
    >
      LOGOUT
    </button>
  )
}
