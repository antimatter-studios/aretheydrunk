import type React from "react"
import type { Metadata } from "next"
import { siteOpenGraph, siteTwitter, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo/config"
import { Geist, Geist_Mono } from "next/font/google"
import { Bangers } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://aretheydrunk.com"),
  title: `${SITE_NAME} | The Ultimate Party Voting Game`,
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: siteOpenGraph(),
  twitter: siteTwitter(),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${bangers.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
