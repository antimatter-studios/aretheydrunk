import { buildPartyImage } from "@/lib/og/party"

export const runtime = "nodejs"
export const contentType = "image/png"

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> } | { params: { slug: string } }
) {
  const url = new URL(req.url)
  const theme = url.searchParams.get("theme") || "pink"
  const title = url.searchParams.get("title") || undefined
  const subtitle = url.searchParams.get("subtitle") || undefined

  const p = (ctx.params as any)?.then ? await (ctx.params as Promise<{ slug: string }>) : (ctx.params as { slug: string })
  const { slug } = p

  return buildPartyImage("twitter", slug, theme, { title, subtitle })
}
