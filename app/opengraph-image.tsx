export const runtime = "nodejs"
export const contentType = "image/png"

import { readFile } from "node:fs/promises"
import { join } from "node:path"

export default async function OGImage() {
  const filePath = join(process.cwd(), "public", "og.png")
  const buf = await readFile(filePath)
  return new Response(buf, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
