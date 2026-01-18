export type DrunkLevel = {
  level: number
  name: string
  emoji: string
  color: string
  description: string
}

export const DRUNK_LEVELS: DrunkLevel[] = [
  { level: 0, name: "Stone Cold Sober", emoji: "😐", color: "#4ecdc4", description: "Not a drop in sight" },
  { level: 1, name: "Warming Up", emoji: "🙂", color: "#7dd87d", description: "Just getting started" },
  { level: 2, name: "Feeling Good", emoji: "😊", color: "#a8e063", description: "The buzz is kicking in" },
  { level: 3, name: "Tipsy", emoji: "😄", color: "#ffd93d", description: "Definitely feeling it" },
  { level: 4, name: "Pretty Drunk", emoji: "🥴", color: "#ffb347", description: "Wobbly vibes" },
  { level: 5, name: "Very Drunk", emoji: "🤪", color: "#ff8c42", description: "No filter mode activated" },
  { level: 6, name: "Absolutely Smashed", emoji: "😵", color: "#ff6b6b", description: "Gone. Just gone." },
  { level: 7, name: "HOLY SH*T", emoji: "💀", color: "#ff3e8a", description: "Someone call a medic" },
]

export function calculateDrunkLevel(drunkVotes: number, soberVotes: number): DrunkLevel {
  const totalVotes = drunkVotes + soberVotes

  if (totalVotes === 0) {
    return DRUNK_LEVELS[0]
  }

  const drunkPercentage = drunkVotes / totalVotes

  // Map percentage to level (0-7)
  const levelIndex = Math.min(Math.floor(drunkPercentage * DRUNK_LEVELS.length), DRUNK_LEVELS.length - 1)

  return DRUNK_LEVELS[levelIndex]
}

export function getDrunkPercentage(drunkVotes: number, soberVotes: number): number {
  const total = drunkVotes + soberVotes
  if (total === 0) return 0
  return Math.round((drunkVotes / total) * 100)
}

export function getDrunkLevel(percentage: number): DrunkLevel & { min: number; max: number; label: string } {
  const levelIndex = Math.min(Math.floor((percentage / 100) * DRUNK_LEVELS.length), DRUNK_LEVELS.length - 1)
  const level = DRUNK_LEVELS[levelIndex]
  const min = Math.round((levelIndex / DRUNK_LEVELS.length) * 100)
  const max = Math.round(((levelIndex + 1) / DRUNK_LEVELS.length) * 100) - 1
  return { ...level, min, max, label: level.name }
}

export const drunkLevels = DRUNK_LEVELS.map((level, index) => ({
  ...level,
  label: level.name,
  min: Math.round((index / DRUNK_LEVELS.length) * 100),
  max: Math.round(((index + 1) / DRUNK_LEVELS.length) * 100) - 1,
}))
