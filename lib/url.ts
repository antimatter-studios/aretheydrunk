export function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  // Remove trailing slash to avoid double slashes when composing URLs
  return base.replace(/\/$/, "")
}
