// Centralized site-wide text helpers for OG/Twitter images and other contexts

export function getSiteTitle(): string {
  return "ARE THEY DRUNK?"
}

export function getSiteCatchphrase(): string {
  return "The Ultimate Party Voting Game"
}

// Party subtitle helpers
const PARTY_SUBTITLE_PHRASES = [
  "have an amazing time",
  "get smashed",
  "party like it's 1989!",
  "dance till sunrise",
  "make legendary memories",
]

export function getRandomPartyPhrase(): string {
  return PARTY_SUBTITLE_PHRASES[Math.floor(Math.random() * PARTY_SUBTITLE_PHRASES.length)]
}

export function getPartySubtitle(attendeeCount?: number): string {
  const count = Math.max(0, attendeeCount ?? 0)
  return `Join ${count} people and ${getRandomPartyPhrase()}`
}
