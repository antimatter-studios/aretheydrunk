"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { BrutalInput } from "@/components/brutal-input"
import { createParty, getUserTeams } from "./actions"

export default function CreatePartyPage() {
  const router = useRouter()
  const [partyName, setPartyName] = useState("")
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [teams, setTeams] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchTeams() {
      const result = await getUserTeams()
      if (result.teams) {
        if (result.teams.length === 0) {
          router.push("/auth/login?redirect=/create-party")
          return
        }
        setTeams(result.teams)
        // Auto-select first team if only one
        if (result.teams.length === 1) {
          setSelectedTeamId(result.teams[0].id)
        }
      }
      setIsLoadingTeams(false)
    }
    fetchTeams()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!partyName.trim()) {
      setError("Give your party a name!")
      return
    }

    if (!selectedTeamId) {
      setError("Select which team this party is for!")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await createParty(partyName.trim(), selectedTeamId, isPublic)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      router.push(`/party/${result.slug}/manage`)
    } catch {
      setError("Something went wrong. Try again!")
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative">
      <div className="fixed inset-0 sunburst opacity-60 pointer-events-none" />
      <div className="fixed inset-0 halftone opacity-20 pointer-events-none" />

      <section className="relative min-h-screen flex items-start pt-8">
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="tilt-wild inline-block mb-6">
                <span className="sticker text-xl wiggle-hover">LET&apos;S GO!</span>
              </div>
              <h1 className="font-[family-name:var(--font-bangers)] text-5xl md:text-7xl text-brutal-white tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                CREATE A PARTY
              </h1>
            </div>

            <BrutalCard className="bg-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {teams.length > 1 && (
                  <div>
                    <label
                      htmlFor="team"
                      className="block font-[family-name:var(--font-bangers)] text-2xl mb-3 tracking-wide"
                    >
                      WHICH TEAM?
                    </label>
                    <select
                      id="team"
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full p-4 bg-white brutal-border-thick font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
                      disabled={isLoadingTeams}
                    >
                      <option value="">Select a team...</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-muted-foreground mt-3 font-bold">
                      Choose which team this party belongs to
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="partyName"
                    className="block font-[family-name:var(--font-bangers)] text-2xl mb-3 tracking-wide"
                  >
                    PARTY NAME
                  </label>
                  <BrutalInput
                    id="partyName"
                    type="text"
                    placeholder="Dave's Birthday Bash"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-sm text-muted-foreground mt-3 font-bold">
                    This will be visible to everyone at the party
                  </p>
                </div>

                <div className="bg-brutal-yellow/20 brutal-border p-4">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="mt-1 w-6 h-6 brutal-border-thick cursor-pointer"
                    />
                    <div>
                      <div className="font-[family-name:var(--font-bangers)] text-xl tracking-wide">🌍 MAKE PUBLIC</div>
                      <p className="text-sm font-bold text-muted-foreground mt-1">
                        Anyone with the link can request to join this party. You&apos;ll approve each request.
                      </p>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="bg-drunk brutal-border-thick p-4 font-[family-name:var(--font-bangers)] text-xl tracking-wide">
                    {error}
                  </div>
                )}

                <BrutalButton
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full text-2xl"
                  disabled={isLoading || isLoadingTeams}
                >
                  {isLoading ? "CREATING..." : "START THE PARTY!"}
                </BrutalButton>
              </form>
            </BrutalCard>

            <p className="text-center font-bold mt-8 text-lg">
              After creating, you&apos;ll add people and share the link!
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-10 text-6xl rotate-12 opacity-80">🎉</div>
        <div className="absolute top-32 right-10 text-5xl -rotate-12 opacity-80">🍻</div>
      </section>
    </main>
  )
}
