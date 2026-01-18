export const dynamic = "force-dynamic"

import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import Link from "next/link"
import { SettingsForm } from "./settings-form"

export default async function UserSettingsPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/auth/login")
  }

  const { data: dbUser, error: userError } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single()

  if (userError || !dbUser) {
    console.error("[settings] user fetch failed or missing", userError)
    redirect("/auth/login")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-brutal-blue relative overflow-auto">
        {/* Sunburst background */}
        <div className="fixed inset-0 opacity-30 pointer-events-none sunburst-blue" />

        {/* Halftone overlay */}
        <div
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.15) 1px, transparent 1px)`,
            backgroundSize: "10px 10px",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mb-6 font-black text-xl hover:translate-x-1 transition-transform"
          >
            ← DASHBOARD
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1
              className="font-display text-6xl font-black text-black mb-4"
              style={{ textShadow: "6px 6px 0 #7DF9FF" }}
            >
              USER SETTINGS
            </h1>
            <p className="text-2xl font-bold">Manage your profile and account settings</p>
          </div>

          <SettingsForm user={dbUser} />
        </div>
      </div>
    </>
  )
}
