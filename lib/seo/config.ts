import type { Metadata } from "next"

export const SITE_ORIGIN = "https://aretheydrunk.com"
export const SITE_NAME = "Are They Drunk?"
export const DEFAULT_DESCRIPTION = "Create a party, add your friends, and let the crowd decide who's had one too many!"

export function siteOpenGraph(): NonNullable<Metadata["openGraph"]> {
  return {
    title: `${SITE_NAME} | The Ultimate Party Voting Game`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      { url: "/opengraph-image.png", width: 1200, height: 630 },
    ],
    type: "website",
  }
}

export function siteTwitter(): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title: `${SITE_NAME} | The Ultimate Party Voting Game`,
    description: DEFAULT_DESCRIPTION,
    images: [
      { url: "/twitter-image.png", width: 1200, height: 630 },
    ],
  }
}

export function partyOpenGraph(slug: string, partyName: string): NonNullable<Metadata["openGraph"]> {
  return {
    title: `${partyName}`,
    description: `Vote: Is everyone drunk at ${partyName}?`,
    url: `${SITE_ORIGIN}/party/${slug}`,
    siteName: SITE_NAME,
    images: [
      { url: `${SITE_ORIGIN}/party/${slug}/opengraph-image.png`, width: 1200, height: 630 },
    ],
    type: "website",
  }
}

export function partyTwitter(slug: string, partyName: string): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title: `${partyName}`,
    description: `Vote: Is everyone drunk at ${partyName}?`,
    images: [
      { url: `${SITE_ORIGIN}/party/${slug}/twitter-image.png`, width: 1200, height: 630 },
    ],
  }
}

export function derivePartyTitleFromSlug(slug: string): string {
  const parts = slug.split("-")
  const maybeId = parts[parts.length - 1]
  const idLike = /^[a-f0-9]{5,}$/i.test(maybeId)
  const core = idLike ? parts.slice(0, -1) : parts
  const derived = core.join(" ") || slug
  return derived.toUpperCase()
}
