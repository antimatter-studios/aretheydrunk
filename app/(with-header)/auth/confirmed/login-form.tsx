"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalInput } from "@/components/brutal-input"
import { confirmAndLogin } from "./actions"

interface ConfirmLoginFormProps {
  email: string
  confirmCode: string
}

export function ConfirmLoginForm({ email, confirmCode }: ConfirmLoginFormProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await confirmAndLogin({ email, password, confirmCode })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 text-left">
      <div>
        <label className="block font-display text-lg text-black mb-2">EMAIL</label>
        <BrutalInput type="email" value={email} disabled className="bg-gray-200 cursor-not-allowed" />
      </div>

      <div>
        <label className="block font-display text-lg text-black mb-2">PASSWORD</label>
        <BrutalInput
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
      </div>

      {error && (
        <div className="bg-brutal-pink border-4 border-black p-3 shadow-brutal-sm">
          <p className="text-black font-bold">{error}</p>
        </div>
      )}

      <BrutalButton type="submit" disabled={loading} className="w-full bg-brutal-teal">
        {loading ? "LOGGING IN..." : "LOG IN & GET STARTED"}
      </BrutalButton>
    </form>
  )
}
