"use client"

import Link from "next/link"
import { BrutalCard } from "./brutal-card"
import type { DrunkLevel } from "@/lib/drunk-levels"

interface Person {
  id: string
  name: string
  photo_url: string | null
  drunk_votes: number
  sober_votes: number
}

interface PersonCardProps {
  person: Person
  level: DrunkLevel
  percentage: number
  partySlug: string
  tilt?: "left" | "right" | "none"
}

export function PersonCard({ person, level, percentage, partySlug, tilt = "none" }: PersonCardProps) {
  const totalVotes = person.drunk_votes + person.sober_votes

  const getDisplayName = (name: string) => {
    if (name.includes("@")) {
      // It's an email, extract and format the username part
      return name.split("@")[0].replace(/\./g, " ")
    }
    return name
  }
  const displayName = getDisplayName(person.name)

  return (
    <Link href={`/party/${partySlug}/person/${person.id}`}>
      <BrutalCard tilt={tilt} className="bg-card brutal-hover cursor-pointer group">
        {/* Photo/Emoji with sunburst background */}
        <div className="w-full aspect-square brutal-border-thick mb-4 overflow-hidden relative">
          {/* Sunburst background */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-conic-gradient(from 0deg, ${level.color} 0deg 15deg, ${level.color}cc 15deg 30deg)`,
            }}
          />
          {/* Halftone overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {person.photo_url ? (
              <img
                src={person.photo_url || "/placeholder.svg"}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-7xl group-hover:scale-110 transition-transform">{level.emoji}</span>
            )}
          </div>
        </div>

        {/* Name with pop-art text */}
        <h3
          className="font-[family-name:var(--font-bangers)] text-2xl mb-3 tracking-wide text-brutal leading-tight truncate"
          title={person.name}
        >
          IS {displayName.toUpperCase()} DRUNK?
        </h3>

        {/* Status badge */}
        <div
          className="brutal-border-thick brutal-shadow-sm px-4 py-2 inline-block mb-4"
          style={{ backgroundColor: level.color }}
        >
          <span className="text-xl mr-2">{level.emoji}</span>
          <span className="font-[family-name:var(--font-bangers)] text-lg tracking-wide">{level.name}</span>
        </div>

        {/* Stats bar */}
        <div className="space-y-2">
          <div className="h-4 bg-muted brutal-border overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${percentage}%`, backgroundColor: level.color }}
            />
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>{percentage}% think drunk</span>
            <span>{totalVotes} votes</span>
          </div>
        </div>
      </BrutalCard>
    </Link>
  )
}
