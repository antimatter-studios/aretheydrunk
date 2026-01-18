"use client"

import { useState } from "react"
import { BrutalButton } from "./brutal-button"

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <BrutalButton onClick={handleShare} variant="secondary" size="lg" className="text-xl">
      {copied ? "COPIED!" : "SHARE PARTY LINK"}
    </BrutalButton>
  )
}
