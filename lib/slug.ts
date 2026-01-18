export function slugifyWithSuffix(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
  const suffix = Math.random().toString(16).slice(2, 8)
  return `${base}-${suffix}`
}
