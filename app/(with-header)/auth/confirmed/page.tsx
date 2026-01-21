import { createServerComponentClient } from "@/lib/supabase/server"
import { BrutalCard } from "@/components/brutal-card"
import Link from "next/link"
import { ConfirmLoginForm } from "./login-form"

interface ConfirmedPageProps {
  searchParams: Promise<{ confirm_code?: string }>
}

export default async function ConfirmedPage({ searchParams }: ConfirmedPageProps) {
  const params = await searchParams
  const confirmCode = params.confirm_code
  const supabase = await createServerComponentClient()

  // No confirm_code provided
  if (!confirmCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none sunburst-red opacity-30" />

        <div className="relative z-10 w-full max-w-lg">
          <BrutalCard className="p-8 text-center bg-white">
            <div className="text-8xl mb-4">X</div>
            <h1 className="font-display text-4xl md:text-5xl mb-4 uppercase text-outline-red">
              Invalid Link
            </h1>
            <p className="text-lg mb-8 text-black">
              This confirmation link is missing the required code. Please check your email and click the link again.
            </p>
            <Link
              href="/auth/signup"
              className="block bg-brutal-yellow border-4 border-black p-4 font-display text-xl uppercase text-black hover:-translate-y-1 transition-all brutal-shadow"
            >
              Sign Up Again
            </Link>
          </BrutalCard>
        </div>
      </div>
    )
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("id, email, full_name, display_name, email_confirmed_at")
    .eq("confirm_code", confirmCode)
    .single()

  // Invalid or expired confirm_code
  if (profileError || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none sunburst-red opacity-30" />

        <div className="relative z-10 w-full max-w-lg">
          <BrutalCard className="p-8 text-center bg-white">
            <div className="text-8xl mb-4">?</div>
            <h1 className="font-display text-4xl md:text-5xl mb-4 uppercase text-outline-red">
              Code Not Found
            </h1>
            <p className="text-lg mb-8 text-black">
              This confirmation code doesn&apos;t exist or has already been used. If you&apos;ve already confirmed your
              account, try logging in instead.
            </p>
            <div className="flex flex-col gap-4">
              <Link
                href="/auth/login"
                className="block bg-brutal-pink border-4 border-black p-4 font-display text-xl uppercase text-black hover:-translate-y-1 transition-all brutal-shadow"
              >
                Go to Login
              </Link>
              <Link
                href="/auth/signup"
                className="block bg-brutal-yellow border-4 border-black p-4 font-display text-xl uppercase text-black hover:-translate-y-1 transition-all brutal-shadow"
              >
                Sign Up Again
              </Link>
            </div>
          </BrutalCard>
        </div>
      </div>
    )
  }

  const { data: membership } = await supabase
    .from("team_memberships")
    .select(`
      role,
      team (
        id,
        name
      )
    `)
    .eq("user_id", userProfile.id)
    .single()

  const teamRelation = membership?.team as
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null
  const teamData = Array.isArray(teamRelation) ? teamRelation[0] : teamRelation
  const teamName = teamData?.name || "Your Team"
  const role = membership?.role || "member"
  const alreadyConfirmed = !!userProfile.email_confirmed_at
  const displayName = userProfile.display_name || userProfile.full_name || "Team Member"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Green sunburst background */}
      <div className="fixed inset-0 pointer-events-none sunburst-green opacity-30" />

      {/* Halftone overlay */}
      <div className="fixed inset-0 pointer-events-none halftone-overlay-8 opacity-5" />

      <div className="relative z-10 w-full max-w-lg">
        <BrutalCard className="p-8 text-center bg-white relative">
          {/* Party emoji */}
          <div className="text-8xl mb-4">🎉</div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl mb-4 uppercase text-brutal">
            {alreadyConfirmed ? "Already Confirmed!" : "Email Confirmed!"}
          </h1>

          {/* Team welcome banner */}
          <div className="bg-brutal-yellow border-4 border-black p-4 mb-6 -rotate-1 brutal-shadow">
            <p className="font-display text-xl uppercase text-black">Welcome to</p>
            <p className="font-display text-3xl uppercase text-brutal-pink">{teamName}</p>
          </div>

          {/* User info card */}
          <div className="bg-gray-100 border-4 border-black p-4 mb-6 text-left brutal-shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👤</span>
              <span className="font-bold text-black">{displayName}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📧</span>
              <span className="text-black">{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{role === "admin" ? "👑" : "🎫"}</span>
              <span className="uppercase font-display text-sm text-black">
                {role === "admin" ? "Team Admin" : "Team Member"}
              </span>
            </div>
          </div>

          <p className="text-lg mb-6 text-black">
            Your account is ready! Enter your password below to log in and start tracking who&apos;s getting drunk
            tonight.
          </p>

          {/* Login form with email pre-filled */}
          <ConfirmLoginForm email={userProfile.email || ""} confirmCode={confirmCode} />

          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 text-4xl rotate-12">🍺</div>
          <div className="absolute -top-4 -right-4 text-4xl -rotate-12">🍻</div>
          <div className="absolute -bottom-4 -left-4 text-4xl -rotate-12">🥳</div>
          <div className="absolute -bottom-4 -right-4 text-4xl rotate-12">🎊</div>
        </BrutalCard>
      </div>
    </div>
  )
}
