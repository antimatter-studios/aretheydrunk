"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalInput } from "@/components/brutal-input"
import { BrutalCard } from "@/components/brutal-card"
import { createParty } from "./actions"

export function CreatePartyForm({ slug, teamName }: { slug: string; teamName: string }) {
  const router = useRouter()
  const [partyName, setPartyName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await createParty(partyName, slug, isPublic)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.partySlug) {
      router.push(`/party/${result.partySlug}`)
    }
  }

  return (
    <BrutalCard className="bg-white p-8">
      <h1
        className="text-6xl font-black text-center mb-2 text-black"
        style={{
          fontFamily: "Bangers, cursive",
          letterSpacing: "0.05em",
          textShadow: "4px 4px 0 #FFD700",
        }}
      >
        START A PARTY! 🎉
      </h1>
      <p className="text-center text-xl mb-8 font-bold">{"Name your party and let the voting begin!"}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-brutal-teal/20 border-6 border-black shadow-[8px_8px_0_0_#000]">
          <label className="block text-sm font-bold mb-1">TEAM</label>
          <p className="text-2xl font-black" style={{ fontFamily: "Bangers, cursive" }}>
            {teamName}
          </p>
        </div>

        <div>
          <label
            htmlFor="partyName"
            className="block text-xl font-black mb-2"
            style={{ fontFamily: "Bangers, cursive" }}
          >
            PARTY NAME
          </label>
          <BrutalInput
            id="partyName"
            type="text"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="Friday Night Drinks"
            required
            className="w-full text-xl"
          />
        </div>

        <div className="flex items-start gap-4 p-4 bg-brutal-yellow/20 border-6 border-black shadow-[8px_8px_0_0_#000]">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-6 h-6 mt-1 border-4 border-black accent-brutal-teal"
          />
          <label htmlFor="isPublic" className="flex-1">
            <span className="block text-lg font-black mb-1">{"🌍 MAKE PUBLIC"}</span>
            <span className="text-sm">{"Anyone with the link can request to join. You'll approve each request."}</span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border-6 border-red-500">
            <p className="text-red-900 font-bold">{error}</p>
          </div>
        )}

        <BrutalButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? "🎊 CREATING..." : "🎊 CREATE PARTY!"}
        </BrutalButton>
      </form>
    </BrutalCard>
  )
}
