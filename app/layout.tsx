import type React from "react"
import type { Metadata } from "next"
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
  title: "Are They Drunk? | The Ultimate Party Voting Game",
  description: "Create a party, add your friends, and let the crowd decide who's had one too many!",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Are They Drunk? | The Ultimate Party Voting Game",
    description:
      "Create a party, add your friends, and let the crowd decide who's had one too many!",
    url: "/",
    siteName: "Are They Drunk?",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Are They Drunk? | The Ultimate Party Voting Game",
    description:
      "Create a party, add your friends, and let the crowd decide who's had one too many!",
    images: [
      {
        url: "/twitter-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
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
