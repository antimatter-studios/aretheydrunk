import { ImageResponse } from "next/og"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getBangersFont } from "@/lib/og/fonts"
import { getTheme } from "@/lib/og/theme"
import { renderSocial } from "@/lib/og/render"

export const size = { width: 1200, height: 630 }

async function getPartyName(slug: string): Promise<string> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from("party").select("name").eq("slug", slug).single()
  return (data?.name || "ARE THEY DRUNK?").toUpperCase()
}

export async function buildPartyImage(kind: "opengraph" | "twitter", slug: string, themeName?: string) {
  const title = await getPartyName(slug)
  const bangers = await getBangersFont()
  if (!bangers) {
    return new Response("Service Unavailable: Bangers font could not be loaded", { status: 503 })
  }
  const { stops, base } = getTheme(themeName || "pink")
  return new ImageResponse(
    renderSocial({ size, title, stops, base, kind }),
    {
      ...size,
      fonts: [
        { name: "Bangers", data: bangers, weight: 400, style: "normal" },
      ],
    },
  )
}
