import { createServerComponentClient } from "@/lib/supabase/server"
import { BrutalCard } from "@/components/brutal-card"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { AcceptInviteForm } from "./accept-form"

interface InvitePageProps {
  params: Promise<{ code: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Look up the pending membership by invite code
  const { data: membership, error } = await supabase
    .from("team_memberships")
    .select(`
      id,
      email,
      status,
      invited_at,
      team:team(id, name, slug)
    `)
    .eq("invite_code", code)
    .single()

  // Invalid or expired invite
  if (error || !membership) {
    return (
      <main className="min-h-screen bg-brutal-pink flex items-center justify-center p-4">
        <div className="fixed inset-0 sunburst opacity-30" />
        <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="font-display text-3xl text-black mb-4">INVALID INVITE</h1>
          <p className="text-lg text-black/80 mb-6">This invitation link is invalid or has expired.</p>
          <Link href="/">
            <BrutalButton className="bg-brutal-yellow">GO HOME</BrutalButton>
          </Link>
        </BrutalCard>
      </main>
    )
  }

  // Already accepted
  if (membership.status === "active") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 sunburst opacity-30" />
        <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="font-display text-3xl text-black mb-4">ALREADY ACCEPTED</h1>
          <p className="text-lg text-black/80 mb-6">
            This invitation has already been accepted. Log in to access your team!
          </p>
          <Link href="/auth/login">
            <BrutalButton className="bg-brutal-teal">LOG IN</BrutalButton>
          </Link>
        </BrutalCard>
      </main>
    )
  }

  const teamRelation = membership.team as { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null
  const team = Array.isArray(teamRelation) ? teamRelation[0] : teamRelation
  if (!team) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 sunburst opacity-30" />
        <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="font-display text-3xl text-black mb-4">TEAM NOT FOUND</h1>
          <p className="text-lg text-black/80 mb-6">This invitation references a missing team.</p>
          <Link href="/">
            <BrutalButton className="bg-brutal-yellow">GO HOME</BrutalButton>
          </Link>
        </BrutalCard>
      </main>
    )
  }

  if (user) {
    if (user.email === membership.email) {
      // Auto-accept the invitation - redirect to accept endpoint
      return (
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="fixed inset-0 sunburst opacity-30" />
          <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-display text-3xl text-black mb-2">WELCOME BACK!</h1>
            <p className="text-lg text-black/80 mb-6">
              You're already logged in. Click below to join <strong>{team.name}</strong>!
            </p>
            <form action={`/api/accept-invite-logged-in`} method="POST">
              <input type="hidden" name="inviteCode" value={code} />
              <BrutalButton type="submit" className="bg-brutal-green">
                JOIN TEAM
              </BrutalButton>
            </form>
          </BrutalCard>
        </main>
      )
    } else {
      // Email mismatch
      return (
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="fixed inset-0 sunburst opacity-30" />
          <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="font-display text-3xl text-black mb-4">EMAIL MISMATCH</h1>
            <p className="text-lg text-black/80 mb-4">
              This invitation is for <strong>{membership.email}</strong>
            </p>
            <p className="text-lg text-black/80 mb-6">
              You're logged in as <strong>{user.email}</strong>
            </p>
            <p className="text-black/60 mb-6">Please log out and sign up with the invited email address.</p>
            <Link href="/auth/signout">
              <BrutalButton className="bg-brutal-red">LOG OUT</BrutalButton>
            </Link>
          </BrutalCard>
        </main>
      )
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 sunburst opacity-30" />
      <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="font-display text-3xl text-black mb-2">YOU'RE INVITED!</h1>
        <p className="text-lg text-black/80 mb-2">You've been invited to join</p>
        <div className="sticker-badge inline-block mb-4">
          <span className="font-display text-xl text-black">{team.name}</span>
        </div>
        <p className="text-black/60 mb-6">Accept to join this team.</p>

        <AcceptInviteForm inviteCode={code} email={membership.email || ""} teamName={team.name} />
      </BrutalCard>
    </main>
  )
}
