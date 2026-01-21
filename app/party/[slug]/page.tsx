import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BrutalButton } from "@/components/brutal-button"
import { BrutalCard } from "@/components/brutal-card"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { calculateDrunkLevel, getDrunkPercentage } from "@/lib/drunk-levels"
import { PersonCard } from "@/components/person-card"
import { ShareButton } from "@/components/share-button"
import { SiteTitle } from "@/components/site-title"

async function getPartyWithAttendees(slug: string) {
  const supabase = await getSupabaseServerClient()

  const { data: party, error: partyError } = await supabase
    .from("party")
    .select("*")
    .eq("slug", slug)
    .or("is_active.is.true,is_active.is.null")
    .single()

  if (partyError) {
    console.error("party_page: failed to load party", { slug, error: partyError })
    return null
  }

  if (!party) return null

  const { data: attendees, error: attendeeError } = await supabase
    .from("party_attendees")
    .select("*, user:users(id, display_name, full_name)")
    .eq("party_id", party.id)
    .order("created_at", { ascending: true })

  if (attendeeError) {
    console.error("party_page: failed to load attendees", { slug, error: attendeeError })
  }

  return { party, attendees: attendees || [] }
}

export default async function PartyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPartyWithAttendees(slug)

  if (!data) {
    notFound()
  }

  const { party, attendees } = data

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <header className="brutal-border-thick border-t-0 border-x-0 bg-primary halftone p-4 relative">
        <div className="container mx-auto flex items-center justify-between relative z-10">
          <SiteTitle />
          <div className="flex gap-3">
            <Link href={`/party/${slug}/stats`}>
              <BrutalButton variant="secondary" size="sm">
                STATS
              </BrutalButton>
            </Link>
            <Link href={`/party/${slug}/manage`}>
              <BrutalButton variant="accent" size="sm">
                MANAGE
              </BrutalButton>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 sunburst-yellow opacity-70" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <div className="tilt-wild inline-block mb-6">
              <span className="sticker text-lg">LIVE PARTY</span>
            </div>
            <h1 className="font-(family-name:--font-bangers) text-5xl md:text-7xl lg:text-8xl text-brutal mb-4 tracking-wider">
              {party.name}
            </h1>
            <p className="font-bold text-lg max-w-md mx-auto">
              Tap on a person to vote if they&apos;re DRUNK or SOBER!
            </p>
          </div>
        </div>
      </section>

      {/* People Grid */}
      <section className="container mx-auto px-4 py-12">
        {attendees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {attendees.map((attendee, index) => {
              const drunkVotes = attendee.drunk_votes ?? 0
              const soberVotes = attendee.sober_votes ?? 0
              const level = calculateDrunkLevel(drunkVotes, soberVotes)
              const percentage = getDrunkPercentage(drunkVotes, soberVotes)
              const tilt = index % 3 === 0 ? "left" : index % 3 === 2 ? "right" : "none"
              const displayName = attendee.user?.display_name || attendee.user?.full_name || "Unknown"

              return (
                <PersonCard
                  key={attendee.id}
                  person={{
                    id: attendee.id,
                    name: displayName,
                    photo_url: null,
                    drunk_votes: drunkVotes,
                    sober_votes: soberVotes,
                  }}
                  level={level}
                  percentage={percentage}
                  partySlug={slug}
                  tilt={tilt}
                />
              )
            })}
          </div>
        ) : (
          <BrutalCard className="max-w-lg mx-auto text-center bg-secondary">
            <p className="font-(family-name:--font-bangers) text-2xl mb-4 tracking-wide">
              NO ONE&apos;S HERE YET!
            </p>
            <p className="font-bold text-muted-foreground mb-6">Add people to start the voting madness!</p>
            <Link href={`/party/${slug}/manage`}>
              <BrutalButton variant="primary">ADD PEOPLE</BrutalButton>
            </Link>
          </BrutalCard>
        )}
      </section>

      <footer className="brutal-border-thick border-b-0 border-x-0 bg-accent py-10 mt-12 relative">
        <div className="absolute inset-0 sunburst-blue opacity-30" />
        <div className="container mx-auto text-center relative z-10">
          <p className="font-(family-name:--font-bangers) text-3xl mb-4 tracking-wide text-black no-underline">
            SHARE THIS PARTY!
          </p>
          <ShareButton
            url={`https://aretheydrunk.com/party/${slug}`}
            title={`Vote: Is everyone drunk at ${party.name}?`}
          />
        </div>
      </footer>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ogUrl = `/party/${slug}/opengraph-image`
  const twUrl = `/party/${slug}/twitter-image`

  return {
    openGraph: {
      images: [
        { url: ogUrl, width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [
        { url: twUrl, width: 1200, height: 630 },
      ],
    },
  }
}
