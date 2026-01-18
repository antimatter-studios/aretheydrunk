"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalInput } from "@/components/brutal-input"
import { BrutalCard } from "@/components/brutal-card"
import { signUpUser } from "./actions"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [teamName, setTeamName] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmCode, setConfirmCode] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    setLoading(true)

    try {
      const result = await signUpUser({
        email,
        password,
        fullName,
        teamName,
      })

      if (result.error) {
        console.error("[v0] Signup error from server:", result.error)
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.confirmCode) {
        setConfirmCode(result.confirmCode)
        setSuccess(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error("[v0] Signup catch error:", message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const confirmUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/confirmed?confirm_code=${confirmCode}`

    return (
      <div className="min-h-screen bg-brutal-cream flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 sunburst opacity-30" />
        <BrutalCard className="max-w-md w-full p-8 text-center relative z-10 bg-white">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="font-display text-3xl text-black mb-4">CHECK YOUR EMAIL!</h1>
          <p className="text-lg text-black/80 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your team account!
          </p>

          <div className="mt-6 p-4 bg-brutal-yellow border-4 border-black">
            <p className="text-sm text-black/80 mb-3">Or click here to confirm your account:</p>
            <Link href={`/auth/confirmed?confirm_code=${confirmCode}`}>
              <BrutalButton className="bg-brutal-teal text-black">CONFIRM MY ACCOUNT</BrutalButton>
            </Link>
          </div>
        </BrutalCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brutal-cream flex items-center justify-center p-4 py-12 relative">
      <div className="fixed inset-0 sunburst opacity-30" />
      <div className="fixed inset-0 halftone-overlay pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-display text-5xl text-black pop-text" data-text="ARE THEY DRUNK?">
              ARE THEY DRUNK?
            </h1>
          </Link>
        </div>

        <BrutalCard className="p-8 bg-white">
          <div className="sticker-badge mb-6">
            <span className="font-display text-xl text-black">CREATE TEAM</span>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block font-display text-lg text-black mb-2">TEAM NAME</label>
              <BrutalInput
                type="text"
                placeholder="Antimatter Studios"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <p className="text-sm text-black/60 mt-1">Your company or group name</p>
            </div>

            <div>
              <label className="block font-display text-lg text-black mb-2">YOUR NAME</label>
              <BrutalInput
                type="text"
                placeholder="Chris Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-display text-lg text-black mb-2">EMAIL</label>
              <BrutalInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-display text-lg text-black mb-2">PASSWORD</label>
              <BrutalInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block font-display text-lg text-black mb-2">CONFIRM PASSWORD</label>
              <BrutalInput
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-sm text-black/60 mt-1">Type your password again to confirm</p>
            </div>

            {error && (
              <div className="bg-brutal-pink border-4 border-black p-3 shadow-brutal-sm">
                <p className="text-black font-bold">{error}</p>
              </div>
            )}

            <BrutalButton type="submit" disabled={loading} className="w-full bg-brutal-yellow">
              {loading ? "CREATING TEAM..." : "CREATE TEAM ACCOUNT"}
            </BrutalButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-black/80">
              Already have a team?{" "}
              <Link href="/auth/login" className="font-bold underline hover:text-brutal-pink">
                Sign in here
              </Link>
            </p>
          </div>
        </BrutalCard>
      </div>
    </div>
  )
}
