"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { BrutalInput } from "@/components/brutal-input"
import { addTeamMemberToParty, removePersonFromParty, inviteGuest, togglePartyVisibility } from "./actions"
import { calculateDrunkLevel } from "@/lib/drunk-levels"
import { getBaseUrl } from "@/lib/url"

interface Party {
  id: string
  name: string
  slug: string
  team_id: string
  is_public: boolean // Added is_public flag
}

interface Person {
  id: string
  user_id?: string
  name: string
  photo_url: string | null
  drunk_votes: number | null
  sober_votes: number | null
  is_guest?: boolean
}

interface TeamMember {
  id: string
  full_name: string
  display_name: string | null
  email: string
  is_in_party: boolean
}

export function ManagePartyClient({
  party,
  initialPeople,
  teamMembers,
  teamName,
}: {
  party: Party
  initialPeople: Person[]
  teamMembers: TeamMember[]
  teamName?: string
}) {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [members, setMembers] = useState<TeamMember[]>(teamMembers)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestName, setGuestName] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(party.is_public) // Added isPublic state
  const [shareLink] = useState<string>(`${getBaseUrl()}/party/${party.slug}`)

  async function handleToggleMember(userId: string, currentlyInParty: boolean) {
    if (currentlyInParty) {
      // Remove from party
      const result = await removePersonFromParty(party.id, userId)
      if (!result.error) {
        setPeople((prev) => prev.filter((p) => p.id !== result.attendeeId))
        const removedUserId = result.userId || userId
        setMembers((prev) => prev.map((m) => (m.id === removedUserId ? { ...m, is_in_party: false } : m)))
      }
    } else {
      // Add to party
      const result = await addTeamMemberToParty(party.id, userId)
      if (!result.error && result.person) {
        setPeople((prev) => [...prev, result.person])
        setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, is_in_party: true } : m)))
      }
    }
  }

  async function handleInviteGuest(e: React.FormEvent) {
    e.preventDefault()
    if (!guestEmail.trim() || !guestName.trim()) return

    setIsInviting(true)
    setError("")

    const result = await inviteGuest(party.id, party.team_id, guestEmail.trim(), guestName.trim())

    if (result.error) {
      setError(result.error)
    } else if (result.person) {
      setPeople([...people, result.person])
      setGuestEmail("")
      setGuestName("")
    }

    setIsInviting(false)
  }

  async function handleRemovePerson(personId: string) {
    // Find if this is a guest or team member
    const person = people.find((p) => p.id === personId || p.user_id === personId)
    console.log("[v0] Removing person:", personId, "Is guest:", person?.is_guest)

    const result = await removePersonFromParty(party.id, personId)

    if (!result.error) {
      setPeople((prev) => prev.filter((p) => p.id !== personId))
      // If it was a team member, update their checkbox state
      if (!person?.is_guest) {
        console.log("[v0] Updating member state for:", personId)
        const userId = result.userId || person?.user_id || personId
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id === userId) {
              console.log("[v0] Found member, setting is_in_party to false")
              return { ...m, is_in_party: false }
            }
            return m
          }),
        )
      }
    } else {
      console.log("[v0] Error removing person:", result.error)
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggleVisibility() {
    const result = await togglePartyVisibility(party.id, !isPublic, party.slug)
    if (result.error) {
      console.log("[v0] Error toggling visibility:", result.error)
      return
    }
    if (typeof result.is_public === "boolean") {
      setIsPublic(result.is_public)
    }
  }

  const availableMembers = members.filter((m) => !m.is_in_party)
  console.log("[v0] Available members count:", availableMembers.length, "Total members:", members.length)

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <header className="brutal-border-thick border-t-0 border-x-0 bg-secondary halftone p-4 relative">
        <div className="container mx-auto flex items-center justify-between relative z-10">
          <Link
            href="/"
            className="font-(family-name:--font-bangers) text-2xl md:text-4xl tracking-wider text-brutal"
          >
            ARE THEY DRUNK?
          </Link>
          <Link href={`/party/${party.slug}`}>
            <BrutalButton variant="primary" size="sm">
              VIEW PARTY
            </BrutalButton>
          </Link>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 sunburst-yellow opacity-50" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="text-center">
            <div className="tilt-wild inline-block mb-4">
              <span className="sticker">PARTY MANAGER</span>
            </div>
            <h1 className="font-(family-name:--font-bangers) text-5xl md:text-7xl text-brutal tracking-wider">
              {party.name}
            </h1>
            {teamName ? (
              <p className="font-bold text-lg mt-2 text-muted-foreground">Team: {teamName}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* LEFT COLUMN: Party People */}
          <div>
            <BrutalCard className="bg-card">
              <h2 className="font-(family-name:--font-bangers) text-2xl mb-4 tracking-wide">
                PARTY PEOPLE ({people.length})
              </h2>

              {people.length > 0 ? (
                <div className="space-y-4">
                  {people.map((person) => {
                    const drunkVotes = person.drunk_votes ?? 0
                    const soberVotes = person.sober_votes ?? 0
                    const level = calculateDrunkLevel(drunkVotes, soberVotes)
                    const totalVotes = drunkVotes + soberVotes

                    return (
                      <div
                        key={person.id}
                        className="flex items-center justify-between bg-muted brutal-border-thick p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 brutal-border-thick flex items-center justify-center text-2xl"
                            style={{ backgroundColor: level.color }}
                          >
                            {level.emoji}
                          </div>
                          <div>
                            <div className="font-(family-name:--font-bangers) text-xl tracking-wide flex items-center gap-2">
                              {person.name}
                              {person.is_guest && (
                                <span className="text-xs bg-accent brutal-border px-2 py-1">GUEST</span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-muted-foreground">
                              {level.name} - {totalVotes} votes
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePerson(person.id)}
                          className="brutal-border-thick bg-drunk px-4 py-2 font-(family-name:--font-bangers) tracking-wide brutal-hover"
                        >
                          REMOVE
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="font-bold text-muted-foreground text-lg">
                  No one added yet. Add team members or invite guests!
                </p>
              )}
            </BrutalCard>
          </div>

          {/* RIGHT COLUMN: Share, Add Team Members, Add Guest */}
          <div className="space-y-8">
            <BrutalCard className="bg-white">
              <h2 className="font-(family-name:--font-bangers) text-2xl mb-4 tracking-wide">PARTY VISIBILITY</h2>
              <label className="flex items-center gap-4 bg-muted brutal-border-thick p-4 cursor-pointer brutal-hover">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={handleToggleVisibility}
                  className="w-6 h-6 brutal-border-thick cursor-pointer"
                />
                <div>
                  <div className="font-(family-name:--font-bangers) text-lg tracking-wide">MAKE PARTY PUBLIC</div>
                  <div className="text-sm font-bold text-muted-foreground">
                    {isPublic ? "Anyone can find and join this party" : "Only people with the link can join"}
                  </div>
                </div>
              </label>
            </BrutalCard>

            {/* Share Link */}
            <BrutalCard className="bg-accent">
              <h2 className="font-(family-name:--font-bangers) text-2xl mb-4 tracking-wide">SHARE THIS PARTY!</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-card brutal-border-thick px-4 py-3 font-mono text-sm break-all font-bold">{shareLink}</div>
                <BrutalButton onClick={copyShareLink} variant="primary">
                  {copied ? "COPIED!" : "COPY LINK"}
                </BrutalButton>
              </div>
            </BrutalCard>

            {/* Team Members */}
            <BrutalCard className="bg-card">
              <h2 className="font-(family-name:--font-bangers) text-2xl mb-4 tracking-wide">
                ADD TEAM MEMBERS ({availableMembers.length})
              </h2>
              {availableMembers.length > 0 ? (
                <div className="space-y-2">
                  {availableMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 bg-muted brutal-border-thick p-4 cursor-pointer brutal-hover"
                    >
                      <input
                        type="checkbox"
                        checked={member.is_in_party}
                        onChange={() => handleToggleMember(member.id, member.is_in_party)}
                        className="w-6 h-6 brutal-border-thick cursor-pointer"
                      />
                      <div>
                        <div className="font-(family-name:--font-bangers) text-lg tracking-wide">
                          {member.display_name || member.full_name}
                        </div>
                        <div className="text-sm font-bold text-muted-foreground">{member.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="font-bold text-muted-foreground">All team members are already in the party!</p>
              )}
            </BrutalCard>

            {/* Invite Guest */}
            <BrutalCard className="bg-secondary">
              <h2 className="font-(family-name:--font-bangers) text-2xl mb-4 tracking-wide">INVITE GUEST</h2>
              <p className="font-bold text-sm mb-4">
                Guests can join this specific party without being full team members.
              </p>
              <form onSubmit={handleInviteGuest} className="space-y-4">
                <BrutalInput
                  type="text"
                  placeholder="Guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={50}
                />
                <BrutalInput
                  type="email"
                  placeholder="Guest email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <BrutalButton
                  type="submit"
                  variant="drunk"
                  disabled={isInviting || !guestEmail.trim() || !guestName.trim()}
                  className="w-full"
                >
                  {isInviting ? "INVITING..." : "INVITE GUEST"}
                </BrutalButton>
              </form>
              {error && (
                <p className="font-(family-name:--font-bangers) text-drunk text-xl mt-4 tracking-wide">{error}</p>
              )}
            </BrutalCard>
          </div>
        </div>
      </div>
    </main>
  )
}
