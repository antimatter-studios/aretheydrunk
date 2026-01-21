import { buildPartyImage } from "@/lib/og/party"

export const runtime = "nodejs"
export const contentType = "image/png"

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const url = new URL(req.url)
  const theme = url.searchParams.get("theme") || "pink"
  return buildPartyImage("opengraph", params.slug, theme)
}
