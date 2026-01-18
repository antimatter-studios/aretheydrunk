"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalInput } from "@/components/brutal-input"

interface AcceptInviteFormProps {
  inviteCode: string
  email: string
  teamName: string
}

export function AcceptInviteForm({ inviteCode, email, teamName }: AcceptInviteFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          fullName,
          email,
          password,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to accept invitation")
        setIsLoading(false)
        return
      }

      // Redirect to login page
      router.push("/auth/login?message=Account created successfully! Please log in.")
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block font-display text-sm text-black mb-1">YOUR NAME</label>
        <BrutalInput
          type="text"
          placeholder="John Smith"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-display text-sm text-black mb-1">EMAIL</label>
        <BrutalInput type="email" value={email} disabled className="bg-brutal-cream" />
      </div>

      <div>
        <label className="block font-display text-sm text-black mb-1">PASSWORD</label>
        <BrutalInput
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-display text-sm text-black mb-1">CONFIRM PASSWORD</label>
        <BrutalInput
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="bg-brutal-pink border-4 border-black p-3">
          <p className="text-black font-bold text-sm">{error}</p>
        </div>
      )}

      <BrutalButton type="submit" disabled={isLoading} className="w-full bg-brutal-green">
        {isLoading ? "JOINING..." : `JOIN ${teamName.toUpperCase()}`}
      </BrutalButton>
    </form>
  )
}
