"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalInput } from "@/components/brutal-input"
import { BrutalCard } from "@/components/brutal-card"
import { loginUser } from "./actions"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNeedsConfirmation(null)
    setLoading(true)

    try {
      const result = await loginUser({ email, password })

      if (result.error) {
        if (result.confirmCode) {
          setNeedsConfirmation(result.confirmCode)
        }
        setError(result.error)
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brutal-cream flex items-start justify-center p-4 pt-8 relative overflow-auto">
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
            <span className="font-display text-xl text-black">SIGN IN</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              />
            </div>

            {error && (
              <div className="bg-brutal-pink border-4 border-black p-3 shadow-brutal-sm">
                <p className="text-black font-bold">{error}</p>
                {needsConfirmation && (
                  <Link
                    href={`/auth/confirmed?confirm_code=${needsConfirmation}`}
                    className="block mt-2 underline font-bold"
                  >
                    Click here to confirm your account
                  </Link>
                )}
              </div>
            )}

            <BrutalButton type="submit" disabled={loading} className="w-full bg-brutal-green">
              {loading ? "SIGNING IN..." : "LET'S PARTY!"}
            </BrutalButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-black/80">
              Need a team account?{" "}
              <Link href="/auth/signup" className="font-bold underline hover:text-brutal-pink">
                Create one here
              </Link>
            </p>
          </div>
        </BrutalCard>
      </div>
    </div>
  )
}
