"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { BrutalButton } from "@/components/brutal-button"

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
    <BrutalButton onClick={handleLogout} variant="danger" size="sm">
      LOGOUT
    </BrutalButton>
  )
}
