import Link from "next/link"
import { notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { calculateDrunkLevel, getDrunkPercentage, DRUNK_LEVELS } from "@/lib/drunk-levels"
import { VotingButtons } from "@/components/voting-buttons"
import { DrunkMeter } from "@/components/drunk-meter"
import { BrutalButton } from "@/components/brutal-button"

async function getAttendeeWithParty(attendeeId: string, partySlug: string) {
  const supabase = await getSupabaseServerClient()

  const { data: party } = await supabase.from("party").select("*").eq("slug", partySlug).eq("is_active", true).single()

  if (!party) return null

  const { data: attendee } = await supabase
    .from("party_attendees")
    .select("*, user:users(id, display_name, full_name)")
    .eq("id", attendeeId)
    .eq("party_id", party.id)
    .single()

  if (!attendee) return null

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: recentVotes } = await supabase
    .from("votes")
    .select("is_drunk")
    .eq("attendee_id", attendeeId)
    .gte("created_at", oneHourAgo)

  const hourlyDrunk = recentVotes?.filter((v) => v.is_drunk).length || 0
  const hourlySober = recentVotes?.filter((v) => !v.is_drunk).length || 0

  return { party, attendee, hourlyStats: { drunk: hourlyDrunk, sober: hourlySober } }
}

export default async function PersonVotePage({
  params,
}: {
  params: Promise<{ slug: string; personId: string }>
}) {
  const { slug, personId } = await params
  const data = await getAttendeeWithParty(personId, slug)

  if (!data) {
    notFound()
  }

  const { party, attendee, hourlyStats } = data
  const drunkVotes = attendee.drunk_votes ?? 0
  const soberVotes = attendee.sober_votes ?? 0
  const level = calculateDrunkLevel(drunkVotes, soberVotes)
  const percentage = getDrunkPercentage(drunkVotes, soberVotes)
  const totalVotes = drunkVotes + soberVotes

  const displayName = attendee.user?.display_name || attendee.user?.full_name || "Unknown"

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <header
        className="brutal-border-thick border-t-0 border-x-0 halftone p-4 relative"
        style={{ backgroundColor: level.color }}
      >
        <div className="container mx-auto flex items-center justify-between relative z-10">
          <Link
            href={`/party/${slug}`}
            className="font-[family-name:var(--font-bangers)] text-2xl md:text-4xl tracking-wider text-brutal"
          >
            {party.name}
          </Link>
          <Link href={`/party/${slug}`}>
            <BrutalButton variant="secondary" size="sm">
              BACK TO PARTY
            </BrutalButton>
          </Link>
        </div>
      </header>

      {/* Main voting section with sunburst */}
      <section className="relative py-12">
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-conic-gradient(from 0deg, ${level.color} 0deg 10deg, ${level.color}99 10deg 20deg)`,
            opacity: 0.7,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            {/* The Big Question */}
            <h1 className="mb-8 leading-tight">
              <span className="font-[family-name:var(--font-bangers)] text-5xl md:text-7xl lg:text-8xl tracking-wider text-brutal-white block">
                IS
              </span>
              <span
                className="block font-[family-name:var(--font-bangers)] text-4xl md:text-6xl lg:text-7xl tracking-wider text-brutal-white truncate max-w-full px-2"
                title={displayName}
              >
                {displayName.toUpperCase()}
              </span>
              <span
                className="block font-[family-name:var(--font-bangers)] text-5xl md:text-7xl lg:text-8xl tracking-wider"
                style={{
                  color: level.color,
                  textShadow: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                }}
              >
                DRUNK?
              </span>
            </h1>

            {/* Photo/Emoji Display */}
            <div
              className="w-48 h-48 md:w-64 md:h-64 mx-auto brutal-border-thick brutal-shadow-lg mb-8 overflow-hidden flex items-center justify-center relative"
              style={{ backgroundColor: level.color }}
            >
              {/* Halftone overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />
              <span className="text-8xl md:text-9xl relative z-10">{level.emoji}</span>
            </div>

            {/* Current Status */}
            <div
              className="brutal-border-thick brutal-shadow-lg inline-block px-8 py-4 mb-10"
              style={{ backgroundColor: level.color }}
            >
              <span className="font-[family-name:var(--font-bangers)] text-3xl md:text-4xl tracking-wider">
                {level.emoji} {level.name.toUpperCase()}
              </span>
            </div>

            {/* Drunk Meter */}
            <DrunkMeter percentage={percentage} level={level} />

            {/* Voting Buttons */}
            <VotingButtons personId={attendee.id} currentDrunkVotes={drunkVotes} currentSoberVotes={soberVotes} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="bg-white brutal-border-thick brutal-shadow p-6">
                <div className="font-[family-name:var(--font-bangers)] text-5xl tracking-wide text-drunk">{drunkVotes}</div>
                <div className="font-bold text-sm uppercase mt-2 text-black">DRUNK VOTES</div>
              </div>
              <div className="bg-white brutal-border-thick brutal-shadow p-6">
                <div className="font-[family-name:var(--font-bangers)] text-5xl tracking-wide text-sober">{soberVotes}</div>
                <div className="font-bold text-sm uppercase mt-2 text-black">SOBER VOTES</div>
              </div>
            </div>

            {/* Hourly Stats */}
            <div className="bg-white brutal-border-thick brutal-shadow-sm p-6 mt-6">
              <div className="font-[family-name:var(--font-bangers)] text-xl tracking-wide mb-3 text-black">THIS HOUR</div>
              <div className="flex justify-center gap-8 font-bold text-black">
                <span>
                  <span className="text-drunk text-2xl">{hourlyStats.drunk}</span> drunk
                </span>
                <span>
                  <span className="text-sober text-2xl">{hourlyStats.sober}</span> sober
                </span>
              </div>
            </div>

            <p className="font-bold text-muted-foreground mt-6 text-lg">{totalVotes} total votes</p>
          </div>
        </div>
      </section>

      {/* Drunk Scale Legend */}
      <section className="brutal-border-thick border-x-0 bg-card py-8">
        <div className="container mx-auto px-4">
          <h3 className="font-[family-name:var(--font-bangers)] text-2xl text-center mb-6 tracking-wide">
            THE DRUNK SCALE
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {DRUNK_LEVELS.map((l, i) => (
              <div
                key={l.level}
                className={`brutal-border-thick px-3 py-2 font-bold flex items-center gap-2 ${level.level === l.level ? "brutal-shadow scale-110" : "opacity-70"} ${i % 2 === 0 ? "tilt-left" : "tilt-right"}`}
                style={{ backgroundColor: l.color }}
              >
                <span className="text-lg">{l.emoji}</span>
                <span className="font-[family-name:var(--font-bangers)] text-sm tracking-wide">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
