import { ImageResponse } from "next/og"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getBangersFont } from "@/lib/og/fonts"
import { getTheme } from "@/lib/og/theme"
import { renderSocial } from "@/lib/og/render"
import { getPartySubtitle } from "@/lib/og/texts"

export const size = { width: 1200, height: 630 }

async function getPartyInfo(slug: string): Promise<{ title: string; partyId: string | null; attendeeCount: number }> {
  const supabase = await getSupabaseServerClient()
  const { data: party } = await supabase.from("party").select("id, name").eq("slug", slug).single()

  let title: string
  if (party?.name) {
    title = party.name.toUpperCase()
  } else {
    const parts = slug.split("-")
    const maybeId = parts[parts.length - 1]
    const idLike = /^[a-f0-9]{5,}$/i.test(maybeId)
    const core = idLike ? parts.slice(0, -1) : parts
    const derived = core.join(" ") || slug
    title = derived.toUpperCase()
  }

  let attendeeCount = 0
  if (party?.id) {
    const { count } = await supabase
      .from("party_attendees")
      .select("id", { count: "exact", head: true })
      .eq("party_id", party.id)
    attendeeCount = count || 0
  }

  return { title, partyId: party?.id ?? null, attendeeCount }
}

export async function buildPartyImage(
  kind: "opengraph" | "twitter",
  slug: string,
  themeName?: string,
  overrides?: { title?: string; subtitle?: string }
) {
  const info = await getPartyInfo(slug)
  const title = overrides?.title ?? info.title
  const bangers = await getBangersFont()
  if (!bangers) {
    return new Response("Service Unavailable: Bangers font could not be loaded", { status: 503 })
  }
  const { stops, base } = getTheme(themeName || "pink")
  const subtitle = overrides?.subtitle ?? getPartySubtitle(info.attendeeCount)
  return new ImageResponse(
    renderSocial({ size, title, subtitle, stops, base, kind }),
    {
      ...size,
      fonts: [
        { name: "Bangers", data: bangers, weight: 400, style: "normal" },
      ],
    },
  )
}
