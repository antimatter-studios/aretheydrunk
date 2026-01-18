"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { BrutalInput } from "@/components/brutal-input"
import { inviteTeamMember } from "./actions"

export default function InviteMemberPage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"member" | "admin">("member")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [inviteCode, setInviteCode] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await inviteTeamMember(email, role)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    if (result.inviteCode) {
      setInviteCode(result.inviteCode)
    }
    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    const inviteUrl =
      typeof window !== "undefined" ? `${window.location.origin}/invite/${inviteCode}` : `/invite/${inviteCode}`

    return (
      <main className="min-h-screen bg-brutal-cream flex items-center justify-center p-4">
        <div className="fixed inset-0 sunburst opacity-30" />
        <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="font-display text-3xl text-black mb-4">INVITATION CREATED!</h1>
          <p className="text-lg text-black/80 mb-4">
            Share this link with <strong>{email}</strong> to join your team:
          </p>
          <div className="bg-brutal-cream border-4 border-black p-3 mb-6 break-all">
            <code className="text-sm">{inviteUrl}</code>
          </div>
          <BrutalButton onClick={() => navigator.clipboard.writeText(inviteUrl)} className="w-full bg-brutal-teal mb-4">
            COPY LINK
          </BrutalButton>
          <Link href="/dashboard">
            <BrutalButton className="w-full bg-brutal-yellow">BACK TO DASHBOARD</BrutalButton>
          </Link>
        </BrutalCard>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brutal-cream">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-black font-bold mb-6 hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="sticker-badge inline-block mb-4">
          <span className="font-display text-xl text-black">INVITE MEMBER</span>
        </div>

        <h1 className="font-display text-4xl text-black mb-6">ADD TO YOUR TEAM</h1>

        <BrutalCard className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-display text-lg text-black mb-2">EMAIL ADDRESS</label>
              <BrutalInput
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-display text-lg text-black mb-2">ROLE</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("member")}
                  className={`flex-1 p-4 border-4 border-black font-bold transition-all ${
                    role === "member" ? "bg-brutal-teal shadow-brutal" : "bg-white hover:bg-brutal-cream"
                  }`}
                >
                  MEMBER
                  <p className="text-xs font-normal mt-1">Can view and vote</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 p-4 border-4 border-black font-bold transition-all ${
                    role === "admin" ? "bg-brutal-yellow shadow-brutal" : "bg-white hover:bg-brutal-cream"
                  }`}
                >
                  ADMIN
                  <p className="text-xs font-normal mt-1">Full control</p>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-brutal-pink border-4 border-black p-3">
                <p className="text-black font-bold">{error}</p>
              </div>
            )}

            <BrutalButton type="submit" disabled={isLoading} className="w-full bg-brutal-green">
              {isLoading ? "SENDING..." : "SEND INVITATION"}
            </BrutalButton>
          </form>
        </BrutalCard>
      </div>
    </main>
  )
}
