import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { getDrunkLevel, drunkLevels } from "@/lib/drunk-levels"

export default async function StatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await getSupabaseServerClient()

  const { data: party } = await supabase.from("party").select("*").eq("slug", slug).single()

  if (!party) {
    notFound()
  }

  const { data: attendees } = await supabase
    .from("party_attendees")
    .select("*, user:users(id, display_name, full_name)")
    .eq("party_id", party.id)
    .order("drunk_votes", { ascending: false })

  // Transform to compatible format
  const people = (attendees || []).map((a) => ({
    id: a.id,
    name: a.user?.display_name || a.user?.full_name || "Unknown",
    drunk_votes: a.drunk_votes ?? 0,
    sober_votes: a.sober_votes ?? 0,
  }))

  const totalVotes = people.reduce((acc, p) => acc + p.drunk_votes + p.sober_votes, 0)

  const mostDrunk = people[0]
  const mostSober =
    people.length > 0
      ? people.reduce((prev, curr) => {
          const prevRatio = prev.sober_votes / (prev.drunk_votes + prev.sober_votes || 1)
          const currRatio = curr.sober_votes / (curr.drunk_votes + curr.sober_votes || 1)
          return currRatio > prevRatio ? curr : prev
        }, people[0])
      : null

  const mostControversial =
    people.length > 0
      ? people.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.drunk_votes - prev.sober_votes)
          const currDiff = Math.abs(curr.drunk_votes - curr.sober_votes)
          const prevTotal = prev.drunk_votes + prev.sober_votes
          const currTotal = curr.drunk_votes + curr.sober_votes
          const prevScore = prevTotal > 0 ? prevTotal / (prevDiff + 1) : 0
          const currScore = currTotal > 0 ? currTotal / (currDiff + 1) : 0
          return currScore > prevScore ? curr : prev
        }, people[0])
      : null

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <header className="brutal-border-thick border-t-0 border-x-0 bg-secondary halftone p-4 relative">
        <div className="container mx-auto flex items-center justify-between relative z-10">
          <Link
            href="/"
            className="font-[family-name:var(--font-bangers)] text-2xl md:text-4xl tracking-wider text-brutal"
          >
            ARE THEY DRUNK?
          </Link>
          <Link href={`/party/${slug}`}>
            <BrutalButton variant="primary" size="sm">
              VIEW PARTY
            </BrutalButton>
          </Link>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 sunburst opacity-50" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="text-center">
            <div className="tilt-wild inline-block mb-4">
              <span className="sticker">PARTY STATS</span>
            </div>
            <h1 className="font-[family-name:var(--font-bangers)] text-5xl md:text-7xl text-brutal-white tracking-wider">
              {party.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <BrutalCard className="bg-primary text-center p-6">
            <p className="font-[family-name:var(--font-bangers)] text-5xl md:text-6xl tracking-wide">{people.length}</p>
            <p className="font-bold text-sm uppercase mt-2">PEOPLE</p>
          </BrutalCard>
          <BrutalCard className="bg-secondary text-center p-6">
            <p className="font-[family-name:var(--font-bangers)] text-5xl md:text-6xl tracking-wide">{totalVotes}</p>
            <p className="font-bold text-sm uppercase mt-2">TOTAL VOTES</p>
          </BrutalCard>
          <BrutalCard className="bg-drunk text-center p-6">
            <p className="font-[family-name:var(--font-bangers)] text-5xl md:text-6xl tracking-wide">
              {people.reduce((acc, p) => acc + p.drunk_votes, 0)}
            </p>
            <p className="font-bold text-sm uppercase mt-2">DRUNK VOTES</p>
          </BrutalCard>
          <BrutalCard className="bg-accent text-center p-6">
            <p className="font-[family-name:var(--font-bangers)] text-5xl md:text-6xl tracking-wide">
              {people.reduce((acc, p) => acc + p.sober_votes, 0)}
            </p>
            <p className="font-bold text-sm uppercase mt-2">SOBER VOTES</p>
          </BrutalCard>
        </div>

        {/* Awards */}
        {people.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {mostDrunk && (
              <BrutalCard tilt="left" className="bg-drunk p-8 text-center">
                <p className="text-6xl mb-4">🍺</p>
                <p className="font-bold text-sm uppercase opacity-80 mb-2">MOST DRUNK</p>
                <p className="font-[family-name:var(--font-bangers)] text-3xl tracking-wide text-brutal-white">
                  {mostDrunk.name}
                </p>
                <p className="font-bold mt-2">{mostDrunk.drunk_votes} drunk votes</p>
              </BrutalCard>
            )}
            {mostSober && (
              <BrutalCard className="bg-accent p-8 text-center">
                <p className="text-6xl mb-4">😇</p>
                <p className="font-bold text-sm uppercase opacity-80 mb-2">DESIGNATED DRIVER</p>
                <p className="font-[family-name:var(--font-bangers)] text-3xl tracking-wide text-brutal">
                  {mostSober.name}
                </p>
                <p className="font-bold mt-2">{mostSober.sober_votes} sober votes</p>
              </BrutalCard>
            )}
            {mostControversial && (
              <BrutalCard tilt="right" className="bg-secondary p-8 text-center">
                <p className="text-6xl mb-4">🤔</p>
                <p className="font-bold text-sm uppercase opacity-80 mb-2">MOST CONTROVERSIAL</p>
                <p className="font-[family-name:var(--font-bangers)] text-3xl tracking-wide text-brutal">
                  {mostControversial.name}
                </p>
                <p className="font-bold mt-2">
                  {mostControversial.drunk_votes + mostControversial.sober_votes} total votes
                </p>
              </BrutalCard>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <BrutalCard className="bg-card p-8">
          <h2 className="font-[family-name:var(--font-bangers)] text-4xl tracking-wide text-brutal mb-8">
            DRUNK LEADERBOARD
          </h2>

          {people.length > 0 ? (
            <div className="space-y-4">
              {people.map((person, index) => {
                const totalPersonVotes = person.drunk_votes + person.sober_votes
                const drunkPercent =
                  totalPersonVotes > 0 ? Math.round((person.drunk_votes / totalPersonVotes) * 100) : 0
                const level = getDrunkLevel(drunkPercent)

                return (
                  <Link key={person.id} href={`/party/${slug}/person/${person.id}`} className="block">
                    <div className="flex items-center gap-4 brutal-border-thick bg-muted p-4 brutal-hover">
                      <div
                        className="w-14 h-14 brutal-border-thick flex items-center justify-center font-[family-name:var(--font-bangers)] text-2xl"
                        style={{
                          backgroundColor:
                            index === 0 ? "#ffe156" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#f5f5f5",
                        }}
                      >
                        #{index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{level.emoji}</span>
                          <span className="font-[family-name:var(--font-bangers)] text-xl tracking-wide">
                            {person.name}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-5 flex-1 brutal-border bg-background">
                            <div
                              className="h-full transition-all"
                              style={{ width: `${drunkPercent}%`, backgroundColor: level.color }}
                            />
                          </div>
                          <span className="font-bold text-sm w-12">{drunkPercent}%</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className="font-[family-name:var(--font-bangers)] text-lg tracking-wide"
                          style={{ color: level.color }}
                        >
                          {level.label}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">{totalPersonVotes} votes</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-center font-bold text-lg text-muted-foreground">
              No people added yet. Add some party people first!
            </p>
          )}
        </BrutalCard>

        {/* Drunk Scale Reference */}
        <BrutalCard className="mt-8 bg-muted p-8">
          <h2 className="font-[family-name:var(--font-bangers)] text-3xl tracking-wide text-brutal mb-6">
            THE DRUNK SCALE
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {drunkLevels.map((level, i) => (
              <div
                key={level.label}
                className={`flex items-center gap-4 brutal-border-thick bg-card p-3 ${i % 2 === 0 ? "tilt-left" : "tilt-right"}`}
              >
                <span className="text-3xl">{level.emoji}</span>
                <div>
                  <p
                    className="font-[family-name:var(--font-bangers)] text-lg tracking-wide"
                    style={{ color: level.color }}
                  >
                    {level.label}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">
                    {level.min}% - {level.max}% drunk votes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BrutalCard>
      </div>
    </main>
  )
}
