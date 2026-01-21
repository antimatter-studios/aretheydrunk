import { buildSiteImage } from "@/lib/og/site"

export const runtime = "nodejs"
export const contentType = "image/png"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const theme = url.searchParams.get("theme") || "pink"
  const title = url.searchParams.get("title") || undefined
  const subtitle = url.searchParams.get("subtitle") || undefined
  return buildSiteImage("opengraph", theme, { title, subtitle })
}
