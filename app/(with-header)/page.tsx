import Link from "next/link"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getRecentParties() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from("party")
    .select(`
      *,
      team:team_id (
        name
      )
    `)
    .eq("is_active", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return data || []
}

export default async function HomePage() {
  const recentParties = await getRecentParties()

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <section className="relative">
        {/* Sunburst background */}
        <div className="absolute inset-0 sunburst opacity-80" />

        {/* Content */}
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Sticker badge */}
            <div className="tilt-wild mb-8">
              <span className="sticker text-lg wiggle-hover cursor-default">THE ULTIMATE PARTY GAME</span>
            </div>

            <h1 className="font-(family-name:--font-bangers) text-6xl md:text-8xl lg:text-9xl tracking-wider mb-4 text-brutal-white leading-none">
              ARE THEY
            </h1>
            <h1 className="font-(family-name:--font-bangers) text-7xl md:text-9xl lg:text-[12rem] tracking-wider mb-8 text-brutal-pink leading-none">
              DRUNK?
            </h1>

            <div className="speech-bubble max-w-xl mb-10 tilt-left">
              <p className="text-lg md:text-xl font-bold">
                Create a party, add your friends, and let the crowd vote on who&apos;s absolutely WASTED!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/create-party">
                <BrutalButton variant="secondary" size="lg" className="text-xl md:text-2xl px-10 py-5">
                  CREATE A PARTY
                </BrutalButton>
              </Link>
              <Link href="/join">
                <BrutalButton variant="accent" size="lg" className="text-xl md:text-2xl px-10 py-5">
                  JOIN A PARTY
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-4 left-4 text-6xl md:text-8xl rotate-12 opacity-90">🍺</div>
        <div className="absolute top-20 right-8 text-5xl md:text-7xl -rotate-12 opacity-90">🎉</div>
        <div className="absolute bottom-20 right-20 text-4xl md:text-6xl rotate-6 opacity-90">🥴</div>
      </section>

      <section className="relative brutal-border-thick border-x-0">
        <div className="absolute inset-0 sunburst-blue opacity-60" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <h2 className="font-(family-name:--font-bangers) text-5xl md:text-7xl text-center text-brutal mb-12">
            HOW IT WORKS
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <BrutalCard tilt="left" className="bg-card">
              <div className="text-7xl mb-4 font-(family-name:--font-bangers) text-primary text-outline-black">
                1
              </div>
              <h3 className="font-(family-name:--font-bangers) text-2xl mb-2 tracking-wide">CREATE A PARTY</h3>
              <p className="text-muted-foreground font-bold">Name your event and get a shareable link instantly.</p>
            </BrutalCard>

            <BrutalCard className="bg-card">
              <div className="text-7xl mb-4 font-(family-name:--font-bangers) text-secondary text-outline-black">
                2
              </div>
              <h3 className="font-(family-name:--font-bangers) text-2xl mb-2 tracking-wide">ADD YOUR CREW</h3>
              <p className="text-muted-foreground font-bold">Add everyone at the party so people can vote on them.</p>
            </BrutalCard>

            <BrutalCard tilt="right" className="bg-card">
              <div className="text-7xl mb-4 font-(family-name:--font-bangers) text-accent text-outline-black">
                3
              </div>
              <h3 className="font-(family-name:--font-bangers) text-2xl mb-2 tracking-wide">VOTE & WATCH</h3>
              <p className="text-muted-foreground font-bold">
                Thumbs up = DRUNK. Thumbs down = SOBER. Watch the chaos!
              </p>
            </BrutalCard>
          </div>
        </div>
      </section>

      <section className="relative brutal-border-thick border-x-0">
        <div className="absolute inset-0 sunburst-yellow opacity-70" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <h2 className="font-(family-name:--font-bangers) text-5xl md:text-7xl text-center text-brutal mb-10">
            THE DRUNK SCALE
          </h2>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              { name: "STONE COLD SOBER", emoji: "😐", bgClass: "bg-brutal-teal" },
              { name: "FEELING IT", emoji: "😊", bgClass: "bg-scale-feeling" },
              { name: "TIPSY", emoji: "😄", bgClass: "bg-brutal-yellow" },
              { name: "DRUNK", emoji: "🥴", bgClass: "bg-scale-drunk" },
              { name: "SMASHED", emoji: "😵", bgClass: "bg-scale-smashed" },
              { name: "OBLITERATED", emoji: "🤪", bgClass: "bg-brutal-pink" },
              { name: "HOLY SH*T", emoji: "💀", bgClass: "bg-scale-holy" },
            ].map((level, i) => (
              <div
                key={level.name}
                className={`brutal-border brutal-shadow-sm px-5 py-3 font-bold flex items-center gap-2 ${i % 2 === 0 ? "tilt-left" : "tilt-right"} ${level.bgClass}`}
              >
                <span className="text-2xl">{level.emoji}</span>
                <span className="font-(family-name:--font-bangers) text-lg tracking-wide">{level.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recentParties.length > 0 && (
        <section className="brutal-border-thick border-x-0 bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-(family-name:--font-bangers) text-5xl md:text-7xl text-center text-brutal mb-10">
              PUBLIC PARTIES
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {recentParties.map((party, i) => (
                <Link key={party.id} href={`/party/${party.slug}`}>
                  <BrutalCard
                    tilt={i === 0 ? "left" : i === 2 ? "right" : "none"}
                    className="bg-primary cursor-pointer brutal-hover"
                  >
                    <h3 className="font-(family-name:--font-bangers) text-2xl mb-2 tracking-wide text-brutal-white">
                      {party.name}
                    </h3>
                    <p className="font-bold opacity-90 text-sm mb-2 text-brutal-yellow">
                      {party.team?.name || "Unknown Team"}
                    </p>
                    <p className="font-bold opacity-80">Click to join the madness!</p>
                  </BrutalCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="brutal-border-thick border-b-0 border-x-0 bg-foreground text-background p-8">
        <div className="container mx-auto text-center">
          <p className="font-(family-name:--font-bangers) text-4xl md:text-5xl mb-4 tracking-wider text-primary">
            ARE THEY DRUNK?
          </p>
          <p className="font-bold opacity-70">Drink responsibly. This is just for laughs!</p>
          <div className="mt-4 flex justify-center gap-4 text-3xl">
            <span>🍻</span>
            <span>🎉</span>
            <span>🥳</span>
            <span>🍺</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
