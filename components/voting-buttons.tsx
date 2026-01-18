"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { castVote } from "@/app/party/[slug]/person/[personId]/actions"

interface VotingButtonsProps {
  personId: string
  currentDrunkVotes: number
  currentSoberVotes: number
}

export function VotingButtons({ personId }: VotingButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [voted, setVoted] = useState<"drunk" | "sober" | null>(null)
  const [showBurst, setShowBurst] = useState(false)

  async function handleVote(isDrunk: boolean) {
    setVoted(isDrunk ? "drunk" : "sober")
    setShowBurst(true)
    setTimeout(() => setShowBurst(false), 500)

    startTransition(async () => {
      await castVote(personId, isDrunk)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6 relative">
      <p className="font-[family-name:var(--font-bangers)] text-3xl md:text-4xl tracking-wide text-brutal">
        CAST YOUR VOTE!
      </p>

      <div className="flex gap-6 justify-center">
        {/* DRUNK Button */}
        <button
          onClick={() => handleVote(true)}
          disabled={isPending}
          className="group relative brutal-border-thick brutal-shadow-lg bg-drunk px-8 py-6 md:px-12 md:py-8 brutal-hover disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl md:text-7xl group-hover:scale-125 transition-transform">👍</span>
            <span className="font-[family-name:var(--font-bangers)] text-2xl md:text-3xl tracking-wider">DRUNK</span>
          </div>
        </button>

        {/* SOBER Button */}
        <button
          onClick={() => handleVote(false)}
          disabled={isPending}
          className="group relative brutal-border-thick brutal-shadow-lg bg-sober px-8 py-6 md:px-12 md:py-8 brutal-hover disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl md:text-7xl group-hover:scale-125 transition-transform">👎</span>
            <span className="font-[family-name:var(--font-bangers)] text-2xl md:text-3xl tracking-wider">SOBER</span>
          </div>
        </button>
      </div>

      {/* Vote confirmation */}
      {voted && (
        <div className={`tilt-left inline-block ${showBurst ? "wiggle" : ""}`}>
          <span
            className={`brutal-border-thick brutal-shadow-sm px-6 py-3 font-[family-name:var(--font-bangers)] text-xl tracking-wide inline-block ${voted === "drunk" ? "bg-drunk" : "bg-sober"}`}
          >
            YOU VOTED {voted.toUpperCase()}! VOTE AGAIN ANYTIME!
          </span>
        </div>
      )}
    </div>
  )
}
