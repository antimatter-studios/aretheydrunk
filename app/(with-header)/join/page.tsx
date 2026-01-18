"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { BrutalInput } from "@/components/brutal-input"

export default function JoinPartyPage() {
  const router = useRouter()
  const [partyCode, setPartyCode] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!partyCode.trim()) {
      setError("Enter a party code or link!")
      return
    }

    let slug = partyCode.trim()

    if (slug.includes("/party/")) {
      const match = slug.match(/\/party\/([^/]+)/)
      if (match) {
        slug = match[1]
      }
    }

    router.push(`/party/${slug}`)
  }

  return (
    <main className="min-h-screen bg-background relative">
      {/* Background - fixed position so it covers entire viewport */}
      <div className="fixed inset-0 sunburst-blue opacity-60 pointer-events-none" />
      <div className="fixed inset-0 halftone opacity-30 pointer-events-none" />

      <section className="relative min-h-[80vh] flex items-center py-12">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="tilt-left inline-block mb-6">
                <span className="sticker text-xl wiggle-hover">JUMP IN!</span>
              </div>
              <h1 className="font-[family-name:var(--font-bangers)] text-5xl md:text-7xl text-brutal tracking-wider">
                JOIN A PARTY
              </h1>
            </div>

            <BrutalCard className="bg-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="partyCode"
                    className="block font-[family-name:var(--font-bangers)] text-2xl mb-3 tracking-wide"
                  >
                    PARTY CODE OR LINK
                  </label>
                  <BrutalInput
                    id="partyCode"
                    type="text"
                    placeholder="Paste the party link or code"
                    value={partyCode}
                    onChange={(e) => setPartyCode(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="bg-drunk brutal-border-thick p-4 font-[family-name:var(--font-bangers)] text-xl tracking-wide">
                    {error}
                  </div>
                )}

                <BrutalButton type="submit" variant="primary" size="lg" className="w-full text-2xl">
                  JOIN THE FUN!
                </BrutalButton>
              </form>
            </BrutalCard>

            <div className="text-center mt-10">
              <p className="font-bold text-lg mb-4">Don&apos;t have a party to join?</p>
              <Link href="/create-party">
                <BrutalButton variant="secondary" size="lg">
                  CREATE YOUR OWN
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 right-10 text-6xl -rotate-12 opacity-80">🥳</div>
        <div className="absolute top-32 left-10 text-5xl rotate-12 opacity-80">🍺</div>
      </section>
    </main>
  )
}
