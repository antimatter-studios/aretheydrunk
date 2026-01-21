import { ImageResponse } from "next/og"
import { getBangersFont } from "@/lib/og/fonts"
import { getTheme } from "@/lib/og/theme"
import { renderSocial } from "@/lib/og/render"
import { getSiteTitle, getSiteCatchphrase } from "@/lib/og/texts"

export const size = { width: 1200, height: 630 }

export async function buildSiteImage(
  kind: "opengraph" | "twitter",
  themeName?: string,
  overrides?: { title?: string; subtitle?: string }
) {
  const title = overrides?.title ?? getSiteTitle()
  const bangers = await getBangersFont()
  if (!bangers) {
    return new Response("Service Unavailable: Bangers font could not be loaded", { status: 503 })
  }
  const { stops, base } = getTheme(themeName || "pink")
  return new ImageResponse(
    renderSocial({ size, title, subtitle: overrides?.subtitle ?? getSiteCatchphrase(), stops, base, kind }),
    {
      ...size,
      fonts: [
        { name: "Bangers", data: bangers, weight: 400, style: "normal" },
      ],
    },
  )
}
