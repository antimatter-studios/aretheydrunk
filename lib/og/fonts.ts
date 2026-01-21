import { readFile } from "node:fs/promises"
import { join } from "node:path"

const JSDELIVR_GOOGLE_TTF =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bangers/Bangers-Regular.ttf"
const FONTSOURCE_BANGERS_WOFF2 =
  "https://cdn.jsdelivr.net/npm/@fontsource/bangers@5.1.0/files/bangers-latin-400-normal.woff2"
const FONTSOURCE_NOTO_SANS_WOFF2 =
  "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.1.0/files/noto-sans-latin-400-normal.woff2"

async function tryFetch(url: string): Promise<ArrayBuffer | undefined> {
  try {
    const r = await fetch(url)
    const ct = r.headers.get("content-type") || ""
    if (r.ok && (ct.includes("font") || ct.includes("octet-stream") || ct.includes("application"))) {
      return await r.arrayBuffer()
    }
  } catch {}
  return undefined
}

export async function getBangersFont(): Promise<ArrayBuffer | undefined> {
  try {
    const p = join(process.cwd(), "public", "fonts", "Bangers-Regular.ttf")
    const buf = await readFile(p)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  } catch {}

  let data = await tryFetch(JSDELIVR_GOOGLE_TTF)
  if (data) return data

  data = await tryFetch(FONTSOURCE_BANGERS_WOFF2)
  if (data) return data

  data = await tryFetch(FONTSOURCE_NOTO_SANS_WOFF2)
  if (data) return data

  return undefined
}
